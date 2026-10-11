import express, { Request, Response } from 'express';
import crypto from 'node:crypto';
import { db, logAuditEvent } from './db.js';
import { requireAuth } from './auth.js';

export const apiRouter = express.Router();

// -------------------------------------------------------------
// PUBLIC / CUSTOMER CATALOG ENDPOINTS
// -------------------------------------------------------------

/**
 * GET /api/products
 * Returns active catalog with real stock quantities from SQLite
 */
apiRouter.get('/products', (_req: Request, res: Response) => {
  const products = db.prepare('SELECT * FROM products ORDER BY price DESC').all() as any[];
  const formatted = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    subtitle: p.subtitle,
    price: p.price,
    originalPrice: p.original_price,
    image: p.image,
    rating: p.rating,
    reviewCount: p.review_count,
    badge: p.badge,
    tagline: p.tagline,
    features: JSON.parse(p.features_json || '[]'),
    specs: JSON.parse(p.specs_json || '{}'),
    highlights: JSON.parse(p.highlights_json || '[]'),
    inStock: Boolean(p.in_stock && p.stock_quantity > 0),
    stockQuantity: p.stock_quantity,
    lowStockThreshold: p.low_stock_threshold,
    unitManufacturingCost: p.unit_mfg_cost,
  }));
  return res.json(formatted);
});

/**
 * GET /api/customer/offers
 * Returns active coupons & promotional banners
 */
apiRouter.get('/customer/offers', (req: Request, res: Response) => {
  const uid = req.query.uid as string;
  const hasCart = req.query.has_cart === 'true';

  const promos = db.prepare('SELECT * FROM promo_codes WHERE is_active = 1').all() as any[];
  const offers = promos.map((p) => ({
    code: p.code,
    title: p.description || `${p.value}% Off`,
    discountPercentage: p.type === 'percentage' ? p.value : undefined,
    freeShipping: true,
    description: `Order over PKR ${p.min_spend_pkr.toLocaleString()} for discount`,
    badge: p.code === 'RETURNING10' ? 'WhatsApp Loyalty' : 'Active Launch Offer',
  }));

  // If returning user with previous orders, prioritize loyalty promo
  if (uid) {
    const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders WHERE phone = ?').get(uid) as any;
    if (orderCount && orderCount.count > 0) {
      return res.json([
        {
          code: 'RETURNING10',
          title: 'Loyal Customer 10% Discount',
          discountPercentage: 10,
          freeShipping: true,
          description: 'Special 10% loyalty discount for your repeat order with M&B Atelier',
          badge: 'Verified Returning Patron',
        },
        ...offers.filter((o) => o.code !== 'RETURNING10'),
      ]);
    }
  }

  return res.json(offers);
});

/**
 * POST /api/orders/place
 * Secure COD Order Placement with Server-Side Price & Inventory Validation
 */
apiRouter.post('/orders/place', (req: Request, res: Response) => {
  const {
    customerName,
    phone,
    address,
    city,
    deliveryNotes,
    items,
    appliedCoupon,
    requestOpenParcel,
  } = req.body;

  if (!customerName || !phone || !address || !city) {
    return res.status(400).json({ error: 'Customer name, phone, address, and city are required.' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart must contain at least one item.' });
  }

  const cleanPhone = phone.replace(/\D/g, '');

  // 1. Authoritative Server-Side Price Calculation & Stock Validation
  let calculatedSubtotal = 0;
  const orderItemsData: any[] = [];

  // Begin transaction
  db.exec('BEGIN TRANSACTION');

  try {
    for (const item of items) {
      const prodId = item.product?.id || item.productId;
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      const dbProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(prodId) as any;
      if (!dbProduct) {
        db.exec('ROLLBACK');
        return res.status(400).json({ error: `Product ${prodId} no longer exists in catalog.` });
      }

      if (dbProduct.stock_quantity < quantity) {
        db.exec('ROLLBACK');
        return res.status(409).json({
          error: `Insufficient inventory for "${dbProduct.name}". Only ${dbProduct.stock_quantity} left in stock.`,
        });
      }

      calculatedSubtotal += dbProduct.price * quantity;
      orderItemsData.push({
        productId: dbProduct.id,
        name: dbProduct.name,
        sku: dbProduct.sku,
        price: dbProduct.price,
        quantity,
      });

      // Deduct inventory atomically
      db.prepare(`
        UPDATE products
        SET stock_quantity = stock_quantity - ?,
            in_stock = CASE WHEN stock_quantity - ? > 0 THEN 1 ELSE 0 END,
            updated_at = ?
        WHERE id = ?
      `).run(quantity, quantity, new Date().toISOString(), dbProduct.id);

      // Record stock movement log
      db.prepare(`
        INSERT INTO stock_movements (id, product_id, product_name, sku, change_amount, movement_type, timestamp, operator_notes)
        VALUES (?, ?, ?, ?, ?, 'Order Dispatch', ?, ?)
      `).run(
        `mov-${crypto.randomUUID()}`,
        dbProduct.id,
        dbProduct.name,
        dbProduct.sku,
        -quantity,
        new Date().toISOString(),
        `Order placed by ${customerName}`
      );
    }

    // 2. Validate Coupon Server-Side
    let calculatedDiscount = 0;
    if (appliedCoupon) {
      const couponCode = String(appliedCoupon).trim().toUpperCase();
      const promo = db.prepare(`
        SELECT * FROM promo_codes
        WHERE UPPER(code) = ? AND is_active = 1
      `).get(couponCode) as any;

      if (promo && calculatedSubtotal >= promo.min_spend_pkr) {
        if (promo.type === 'percentage') {
          calculatedDiscount = Math.round((calculatedSubtotal * promo.value) / 100);
          if (promo.max_discount_pkr && calculatedDiscount > promo.max_discount_pkr) {
            calculatedDiscount = promo.max_discount_pkr;
          }
        } else {
          calculatedDiscount = promo.value;
        }

        // Increment coupon usage
        db.prepare('UPDATE promo_codes SET usage_count = usage_count + 1 WHERE id = ?').run(promo.id);
      }
    }

    const shipping = 0; // Free nationwide shipping across Pakistan
    const finalTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + shipping);

    const orderId = `MBA-${crypto.randomInt(1000, 9999)}`;
    const trackingNum = `TRX-PK-${crypto.randomInt(1000000, 9999999)}`;
    const now = new Date().toISOString();

    // 3. Insert Order
    db.prepare(`
      INSERT INTO orders (
        order_id, customer_id, customer_name, phone, address, city, delivery_notes,
        subtotal, discount_amount, applied_coupon, shipping, total, payment_method,
        status, courier_id, courier_name, tracking_number, request_open_parcel, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COD', 'processing', 'trax', 'Trax Logistics', ?, ?, ?, ?)
    `).run(
      orderId,
      cleanPhone,
      customerName,
      cleanPhone,
      address,
      city,
      deliveryNotes || null,
      calculatedSubtotal,
      calculatedDiscount,
      appliedCoupon || null,
      shipping,
      finalTotal,
      trackingNum,
      requestOpenParcel ? 1 : 0,
      now,
      now
    );

    // 4. Insert Order Items
    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, price, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of orderItemsData) {
      insertItem.run(
        `itm-${crypto.randomUUID()}`,
        orderId,
        item.productId,
        item.name,
        item.sku,
        item.price,
        item.quantity
      );
    }

    // Commit Transaction
    db.exec('COMMIT');

    logAuditEvent('CUSTOMER', cleanPhone, 'ORDER_PLACED', `Order ${orderId} created for PKR ${finalTotal}`);

    const itemsSummary = orderItemsData.map((i) => `${i.name} (x${i.quantity})`).join(', ');

    return res.json({
      success: true,
      orderId,
      order: {
        orderId,
        date: now.split('T')[0],
        itemsSummary,
        itemCount: orderItemsData.reduce((acc, i) => acc + i.quantity, 0),
        total: finalTotal,
        status: 'COD Pending',
        paymentMethod: 'Cash on Delivery',
        city,
        deliveryAddress: address,
        courierName: 'Trax Logistics',
        courierTrackingNumber: trackingNum,
        courierTrackingUrl: `https://sonic.trax.pk/tracking?tracking_number=${trackingNum}`,
        canInspectParcel: true,
        openParcelRequested: Boolean(requestOpenParcel),
      },
    });
  } catch (err: any) {
    db.exec('ROLLBACK');
    return res.status(500).json({ error: 'Failed to process order transaction.' });
  }
});

/**
 * GET /api/orders/history
 * Returns orders for authenticated customer with IDOR prevention
 */
apiRouter.get('/orders/history', requireAuth(), (req: Request, res: Response) => {
  const user = (req as any).user;
  const requestedUid = req.query.uid as string;

  // Strict IDOR Protection: Customers may only view their own orders
  if (user.role !== 'ADMIN_SUPER' && user.phone !== requestedUid && user.sub !== requestedUid) {
    return res.status(403).json({ error: 'Access denied: cannot view order history of other customers.' });
  }

  const phone = requestedUid || user.phone;
  const orders = db.prepare(`
    SELECT * FROM orders WHERE phone = ? ORDER BY created_at DESC
  `).all(phone) as any[];

  const formatted = orders.map((o) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.order_id) as any[];
    return {
      orderId: o.order_id,
      date: o.created_at.split('T')[0],
      itemsSummary: items.map((i) => `${i.product_name} (x${i.quantity})`).join(', '),
      itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
      total: o.total,
      status: o.status === 'processing' ? 'COD Pending' : o.status === 'delivered' ? 'Delivered' : 'Shipped',
      paymentMethod: 'Cash on Delivery',
      city: o.city,
      deliveryAddress: o.address,
      courierName: o.courier_name || 'Trax Logistics',
      courierTrackingNumber: o.tracking_number,
      courierTrackingUrl: `https://trax.pk/tracking?cn=${o.tracking_number}`,
      canInspectParcel: true,
      openParcelRequested: Boolean(o.request_open_parcel),
    };
  });

  return res.json(formatted);
});

/**
 * GET /api/shipping/track
 * Returns authoritative tracking details from database
 */
apiRouter.get('/shipping/track', (req: Request, res: Response) => {
  const orderId = req.query.order_id as string;
  if (!orderId) {
    return res.status(400).json({ error: 'order_id is required.' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE UPPER(order_id) = ?').get(orderId.toUpperCase().trim()) as any;
  if (!order) {
    return res.status(404).json({ error: 'Consignment not found in tracking registry.' });
  }

  const stepIndex = order.status === 'delivered' ? 3 : order.status === 'out_for_delivery' ? 2 : order.status === 'dispatched' ? 1 : 0;

  return res.json({
    orderId: order.order_id,
    trackingNumber: order.tracking_number || `TRX-${order.order_id}`,
    courierName: order.courier_name || 'Trax Logistics',
    courierPortalUrl: `https://trax.pk/tracking?cn=${order.tracking_number}`,
    statusText: order.status === 'delivered' ? 'Delivered & COD Collected' : order.status === 'out_for_delivery' ? 'Out for Delivery' : 'In Transit via Courier Express',
    currentStepIndex: stepIndex,
    timeline: [
      {
        step: 'Order Placed & Quality Verified',
        description: 'Packed at Sialkot Atelier in sealed protective mailer with Open-Parcel inspection flyer',
        time: order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Verified',
        location: 'Sialkot & Lahore Workshop',
        completed: true,
      },
      {
        step: 'Handover to Linehaul Courier',
        description: `Handed over to ${order.courier_name || 'Trax Logistics'} central hub for nationwide linehaul`,
        time: 'In Transit',
        location: 'Central Transit Hub',
        completed: stepIndex >= 1,
        current: stepIndex === 1,
      },
      {
        step: 'Rider Out for Doorstep Delivery',
        description: 'Courier rider dispatched. Doorstep Open-Parcel unboxing permitted before paying cash.',
        time: 'Pending Delivery',
        location: `${order.city}, Pakistan`,
        completed: stepIndex >= 2,
        current: stepIndex === 2,
      },
      {
        step: 'Delivered & Cash Collected',
        description: 'Customer inspected bag and handed COD payment to courier rider.',
        time: 'Completed',
        location: `${order.city}, Pakistan`,
        completed: stepIndex === 3,
      },
    ],
    rider: {
      name: 'Muhammad Tariq',
      phone: '0301 5466674',
      hub: `${order.city} Central Delivery Hub`,
    },
    openParcelPermitted: true,
    cashToCollect: order.total,
  });
});

/**
 * POST /api/orders/upsell
 * One-Click Post-Purchase COD Upsell adding tech pouch with zero extra shipping
 */
apiRouter.post('/orders/upsell', (req: Request, res: Response) => {
  const { orderId, upsellProduct } = req.body;
  if (!orderId || !upsellProduct) {
    return res.status(400).json({ error: 'orderId and upsellProduct required.' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId) as any;
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const upsellPrice = upsellProduct.price || 990;
  const newTotal = order.total + upsellPrice;

  db.prepare(`
    UPDATE orders
    SET total = ?, subtotal = subtotal + ?, updated_at = ?
    WHERE order_id = ?
  `).run(newTotal, upsellPrice, new Date().toISOString(), order.order_id);

  db.prepare(`
    INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, price, quantity)
    VALUES (?, ?, ?, ?, 'MBA-UP-POUCH', ?, 1)
  `).run(`itm-${crypto.randomUUID()}`, order.order_id, upsellProduct.id || 'mb-tech-pouch', upsellProduct.name || 'M&B Waterproof Tech Pouch', upsellPrice);

  logAuditEvent('CUSTOMER', order.phone, 'ORDER_UPSELL_ADDED', `Order ${orderId} updated with ${upsellProduct.name}`);

  return res.json({
    success: true,
    newTotal,
    addedItem: upsellProduct.name || 'M&B Waterproof Tech Pouch',
    message: 'M&B Waterproof Tech Pouch added to active COD parcel with zero extra courier fees.',
  });
});

// -------------------------------------------------------------
// ADMINISTRATIVE OPERATIONS SUITE ENDPOINTS (RBAC PROTECTED)
// -------------------------------------------------------------

/**
 * GET /api/admin/data
 * Returns complete operational ERP state for AdminOperationsSuite
 */
apiRouter.get('/admin/data', requireAuth(['ADMIN_SUPER']), (_req: Request, res: Response) => {
  const products = db.prepare('SELECT * FROM products ORDER BY price DESC').all() as any[];
  const couriers = db.prepare('SELECT * FROM couriers').all();
  const promos = db.prepare('SELECT * FROM promo_codes').all();
  const banner = db.prepare('SELECT * FROM campaign_banners LIMIT 1').get();
  const expenses = db.prepare('SELECT * FROM expenses ORDER BY expense_date DESC').all();
  const stockMovements = db.prepare('SELECT * FROM stock_movements ORDER BY timestamp DESC LIMIT 50').all();
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50').all() as any[];

  return res.json({
    products: products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      subtitle: p.subtitle,
      price: p.price,
      originalPrice: p.original_price,
      image: p.image,
      rating: p.rating,
      reviewCount: p.review_count,
      badge: p.badge,
      tagline: p.tagline,
      features: JSON.parse(p.features_json || '[]'),
      specs: JSON.parse(p.specs_json || '{}'),
      highlights: JSON.parse(p.highlights_json || '[]'),
      inStock: Boolean(p.in_stock && p.stock_quantity > 0),
      stockQuantity: p.stock_quantity,
      lowStockThreshold: p.low_stock_threshold,
      unitManufacturingCost: p.unit_mfg_cost,
    })),
    couriers,
    promoCodes: promos,
    campaignBanner: banner,
    expenses,
    stockMovements,
    orders: orders.map((o) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.order_id) as any[];
      return {
        orderId: o.order_id,
        customerName: o.customer_name,
        phone: o.phone,
        address: o.address,
        city: o.city,
        items: items.map((i) => ({
          product: { id: i.product_id, name: i.product_name, price: i.price },
          quantity: i.quantity,
        })),
        subtotal: o.subtotal,
        discountAmount: o.discount_amount,
        appliedCoupon: o.applied_coupon,
        shipping: o.shipping,
        total: o.total,
        createdAt: o.created_at,
        paymentMethod: 'COD',
        status: o.status,
        courierName: o.courier_name,
        trackingNumber: o.tracking_number,
      };
    }),
  });
});
