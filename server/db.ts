import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'mbatelier.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Pragmas for durability and performance
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
`);

/**
 * Initializes database schemas, indexes, and initial records
 */
export function initializeDatabase() {
  db.exec(`
    -- Administrator Accounts Table
    CREATE TABLE IF NOT EXISTS administrators (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN_SUPER',
      totp_secret TEXT,
      totp_enabled INTEGER NOT NULL DEFAULT 0,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until INTEGER DEFAULT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Admin Break-Glass Recovery Codes
    CREATE TABLE IF NOT EXISTS admin_recovery_codes (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      used_at TEXT,
      FOREIGN KEY (admin_id) REFERENCES administrators(id) ON DELETE CASCADE
    );

    -- Customers Table
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL, -- 923XXXXXXXXX normalized format
      name TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Customer OTP & Verification Challenges
    CREATE TABLE IF NOT EXISTS verification_otps (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      expires_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      channel TEXT NOT NULL DEFAULT 'whatsapp',
      created_at TEXT NOT NULL
    );

    -- Products Table
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      subtitle TEXT,
      price INTEGER NOT NULL, -- Stored as integer minor units / PKR exact
      original_price INTEGER NOT NULL,
      image TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 5.0,
      review_count INTEGER NOT NULL DEFAULT 0,
      badge TEXT,
      tagline TEXT,
      features_json TEXT NOT NULL DEFAULT '[]',
      specs_json TEXT NOT NULL DEFAULT '{}',
      highlights_json TEXT NOT NULL DEFAULT '[]',
      in_stock INTEGER NOT NULL DEFAULT 1,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      unit_mfg_cost INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Couriers Table
    CREATE TABLE IF NOT EXISTS couriers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo TEXT NOT NULL,
      tracking_prefix TEXT NOT NULL,
      account_number TEXT NOT NULL,
      center_code TEXT NOT NULL,
      origin_city TEXT NOT NULL,
      api_key TEXT NOT NULL,
      default_rate_pkr INTEGER NOT NULL DEFAULT 250,
      delivery_eta TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      tracking_url_template TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Promo Codes Table
    CREATE TABLE IF NOT EXISTS promo_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL, -- 'percentage' | 'flat'
      value INTEGER NOT NULL,
      min_spend_pkr INTEGER NOT NULL DEFAULT 0,
      max_discount_pkr INTEGER,
      usage_limit INTEGER NOT NULL DEFAULT 500,
      usage_count INTEGER NOT NULL DEFAULT 0,
      expiry_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Campaign Banners Table
    CREATE TABLE IF NOT EXISTS campaign_banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      discount_badge TEXT NOT NULL,
      countdown_ends_at TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      cta_text TEXT NOT NULL,
      cta_target_id TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Inventory Stock Movements Table
    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      sku TEXT NOT NULL,
      change_amount INTEGER NOT NULL,
      movement_type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      operator_notes TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      delivery_notes TEXT,
      subtotal INTEGER NOT NULL,
      discount_amount INTEGER NOT NULL DEFAULT 0,
      applied_coupon TEXT,
      shipping INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'COD',
      status TEXT NOT NULL DEFAULT 'processing',
      courier_id TEXT,
      courier_name TEXT,
      tracking_number TEXT,
      request_open_parcel INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Order Items Table
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_sku TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    );

    -- Operational Expenses Table
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      expense_date TEXT NOT NULL,
      category TEXT NOT NULL,
      amount_pkr INTEGER NOT NULL,
      description TEXT NOT NULL,
      order_id TEXT,
      reference_no TEXT,
      created_at TEXT NOT NULL
    );

    -- Audit Logs Table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_type TEXT NOT NULL, -- 'ADMIN' | 'CUSTOMER' | 'SYSTEM'
      actor_id TEXT,
      action TEXT NOT NULL,
      resource TEXT,
      ip_address TEXT,
      details_json TEXT,
      timestamp TEXT NOT NULL
    );

    -- Server-Side Session Storage
    CREATE TABLE IF NOT EXISTS active_sessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Seed default dynamic products if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM products');
  const countRow = countStmt.get() as { count: number };
  if (countRow.count === 0) {
    seedInitialCatalog();
  }

  // Seed default couriers if empty
  const courierCountStmt = db.prepare('SELECT COUNT(*) as count FROM couriers');
  const courierCountRow = courierCountStmt.get() as { count: number };
  if (courierCountRow.count === 0) {
    seedInitialCouriers();
  }

  // Seed default promo codes if empty
  const promoCountStmt = db.prepare('SELECT COUNT(*) as count FROM promo_codes');
  const promoCountRow = promoCountStmt.get() as { count: number };
  if (promoCountRow.count === 0) {
    seedInitialPromoCodes();
  }

  // Seed default campaign banner if empty
  const bannerCountStmt = db.prepare('SELECT COUNT(*) as count FROM campaign_banners');
  const bannerCountRow = bannerCountStmt.get() as { count: number };
  if (bannerCountRow.count === 0) {
    seedInitialBanner();
  }

  // Seed bootstrap administrator if none exists
  const adminCountStmt = db.prepare('SELECT COUNT(*) as count FROM administrators');
  const adminCountRow = adminCountStmt.get() as { count: number };
  if (adminCountRow.count === 0) {
    bootstrapInitialAdmin();
  }
}

/**
 * Hash password securely with PBKDF2-HMAC-SHA512 (100,000 iterations)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2$100000$${salt}$${hash}`;
}

/**
 * Verify password against stored hash using timing-safe comparison
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const originalHash = parts[3];
    const testHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch {
    return false;
  }
}

function bootstrapInitialAdmin() {
  const adminId = `adm-${crypto.randomUUID()}`;
  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@mbatelier.shop').toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'mbatelier2026_SecureAdmin!';
  const now = new Date().toISOString();
  const pwdHash = hashPassword(password);

  const insertAdmin = db.prepare(`
    INSERT INTO administrators (id, email, password_hash, role, totp_enabled, failed_attempts, created_at, updated_at)
    VALUES (?, ?, ?, 'ADMIN_SUPER', 0, 0, ?, ?)
  `);
  insertAdmin.run(adminId, email, pwdHash, now, now);

  // Insert initial single-use recovery codes
  const recoveryCodes = [
    'MBA-9X82-K7L1',
    'MBA-4R99-T2P0',
    'MBA-7M14-W8Q3',
    'MBA-2D55-H9X6',
    'MBA-8B33-V6Y9',
  ];
  const insertCode = db.prepare(`
    INSERT INTO admin_recovery_codes (id, admin_id, code_hash, used)
    VALUES (?, ?, ?, 0)
  `);

  for (const code of recoveryCodes) {
    const codeHash = crypto.createHash('sha256').update(code.toUpperCase().trim()).digest('hex');
    insertCode.run(`rec-${crypto.randomUUID()}`, adminId, codeHash);
  }

  logAuditEvent('SYSTEM', 'bootstrap', 'INITIAL_ADMIN_CREATED', `Bootstrap admin ${email} created.`);
}

function seedInitialCatalog() {
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO products (
      id, sku, name, subtitle, price, original_price, image, rating, review_count,
      badge, tagline, features_json, specs_json, highlights_json, in_stock, stock_quantity,
      low_stock_threshold, unit_mfg_cost, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialProducts = [
    {
      id: 'metro-commuter',
      sku: 'MBA-MC-001',
      name: 'The Metro Commuter Backpack',
      subtitle: 'Engineered for Bike Commuters, Monsoon Downpours, & Heavy Tech',
      price: 6990,
      originalPrice: 8990,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewCount: 248,
      badge: 'Flagship · Pakistan Biker Choice',
      tagline: 'Model 1 — Engineered to survive 70cc / 125cc rides on Sharea Faisal & Canal Road.',
      features: [
        'Built-in Waterproof Rain Cover (High-Vis Neon with elastic hem)',
        '3M™ Reflective Safety Strip (360° headlight reflection on night commutes)',
        'Anti-Theft Hidden Back Pocket (Concealed lumbar zip for cash, phone & CNIC)',
        'Suspended Laptop Sleeve (Air-cushioned floor protects up to 16" laptops)',
      ],
      specs: {
        capacity: '24 Liters',
        weight: '890 grams',
        laptopFit: 'Up to 16" (MacBook Pro / ThinkPad / Dell XPS / Gaming)',
        material: '1000D Matte Ballistic Oxford with TPU Hydro-Shield',
        dimensions: '48 cm (H) x 31 cm (W) x 16 cm (D)',
        waterproofRating: 'IPX4 Water-Resistant Shell + Full IPX7 Rain Cover',
      },
      highlights: [
        'Tested against monsoon downpours on Lahore and Karachi ring roads',
        'Ergonomic S-curve padded harness distributes weight away from shoulders',
        'Air-mesh breathable back panel keeps riders sweat-free in 42°C heat',
        'Doorstep Open-Parcel inspection allowed before paying Cash on Delivery',
      ],
      inStock: 1,
      stockQuantity: 42,
      lowStockThreshold: 5,
      unitManufacturingCost: 2650,
    },
    {
      id: 'tech-exec',
      sku: 'MBA-TE-002',
      name: 'The Tech Exec Clamshell',
      subtitle: '180° Lay-Flat Tech Briefpack for Engineers, Founders & Travel',
      price: 7990,
      originalPrice: 9990,
      image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 182,
      badge: 'Executive · Dual Compartment',
      tagline: 'Model 2 — Luggage-grade 180° clamshell organization for flights and boardroom meetings.',
      features: [
        '180° TSA-Ready Clamshell Opening (Unzips completely flat like a suitcase)',
        'Dedicated Dual Tech Chamber (Padded sleeves for 16" laptop + 12.9" iPad)',
        'Integrated Powerbank Pass-Through (Charge iPhone/Android on the go)',
        'Luggage Trolley Pass-Through Strap (Slides securely over suitcase handles)',
      ],
      specs: {
        capacity: '28 Liters (Expandable)',
        weight: '1,050 grams',
        laptopFit: 'Up to 16.2" MacBook / Workstation + Tablet chamber',
        material: '1680D Armor Weave Nylon with Leather-Touch Accents',
        dimensions: '50 cm (H) x 32 cm (W) x 18 cm (D)',
        waterproofRating: 'Water-Repellent Weather-Sealed Zippers',
      },
      highlights: [
        'Ideal for PIA, Airblue, and Fly Jinnah domestic overhead cabins',
        'Discrete business profile with hidden external bottle sleeve',
        'Crush-resistant hard-molded top pocket for sunglasses and AirPods',
        'Full doorstep verification before paying courier Cash on Delivery',
      ],
      inStock: 1,
      stockQuantity: 18,
      lowStockThreshold: 5,
      unitManufacturingCost: 3100,
    },
    {
      id: 'urban-sling',
      sku: 'MBA-US-003',
      name: 'The Urban Minimalist Sling',
      subtitle: 'Crossbody Daypack for Quick Coffee Runs, Errands & Bike Navigation',
      price: 3990,
      originalPrice: 4990,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 140,
      badge: 'Lightweight · Daily EDC',
      tagline: 'Model 3 — Sleek chest or back sling designed for motorcycle grab-and-go.',
      features: [
        'Quick-Release Magnetic German Fidlock™ Buckle (Instant one-hand unclip)',
        'Weather-Proof Waterproof Zip Enclosures (Protects phone and cash)',
        'Reversible Padded Crossbody Strap (Wear comfortably on left or right shoulder)',
        'Dedicated Padded Chamber fits iPad Mini (8.3") & Kindle Paperwhite',
      ],
      specs: {
        capacity: '7 Liters',
        weight: '420 grams',
        laptopFit: 'iPad Mini / Tablet up to 9" (No full laptops)',
        material: '840D High-Density Oxford Ripstop',
        dimensions: '32 cm (H) x 20 cm (W) x 9 cm (D)',
        waterproofRating: 'Splash & Rain-Resistant Coated Shell',
      },
      highlights: [
        'Anti-theft front-facing chest carry for crowded bazaars and Metro buses',
        'Key tether clip so motorcycle keys are never misplaced',
        'Breathable honeycomb back mesh for hot Pakistani afternoons',
        'Doorstep inspection guaranteed before paying Cash on Delivery',
      ],
      inStock: 1,
      stockQuantity: 28,
      lowStockThreshold: 5,
      unitManufacturingCost: 1450,
    },
  ];

  for (const p of initialProducts) {
    insert.run(
      p.id,
      p.sku,
      p.name,
      p.subtitle,
      p.price,
      p.originalPrice,
      p.image,
      p.rating,
      p.reviewCount,
      p.badge,
      p.tagline,
      JSON.stringify(p.features),
      JSON.stringify(p.specs),
      JSON.stringify(p.highlights),
      p.inStock,
      p.stockQuantity,
      p.lowStockThreshold,
      p.unitManufacturingCost,
      now,
      now
    );
  }
}

function seedInitialCouriers() {
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO couriers (
      id, name, logo, tracking_prefix, account_number, center_code, origin_city,
      api_key, default_rate_pkr, delivery_eta, status, tracking_url_template, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const couriers = [
    {
      id: 'trax',
      name: 'Trax Logistics',
      logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&auto=format&fit=crop&q=80',
      trackingPrefix: 'TRX',
      accountNumber: 'MBA-LHE-9921',
      centerCode: 'LHE-04',
      originCity: 'Lahore',
      apiKey: 'trx_live_k82jd91msldp01',
      defaultRatePKR: 250,
      deliveryEta: '2–3 Days',
      status: 'active',
      trackingUrlTemplate: 'https://trax.pk/tracking?cn=',
    },
    {
      id: 'callcourier',
      name: 'CallCourier',
      logo: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=120&auto=format&fit=crop&q=80',
      trackingPrefix: 'CC',
      accountNumber: 'MBA-CALL-8841',
      centerCode: 'LHE-HUB-01',
      originCity: 'Lahore',
      apiKey: 'cc_prod_sec_498218731',
      defaultRatePKR: 240,
      deliveryEta: '2–4 Days',
      status: 'active',
      trackingUrlTemplate: 'https://callcourier.com.pk/tracking/?cn=',
    },
    {
      id: 'postex',
      name: 'PostEx COD',
      logo: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=120&auto=format&fit=crop&q=80',
      trackingPrefix: 'PEX',
      accountNumber: 'PEX-MBA-0192',
      centerCode: 'LHE-CENTRAL',
      originCity: 'Lahore',
      apiKey: 'pex_tok_8172648172',
      defaultRatePKR: 230,
      deliveryEta: '2–3 Days',
      status: 'active',
      trackingUrlTemplate: 'https://postex.pk/tracking?order=',
    },
    {
      id: 'tcs',
      name: 'TCS Express',
      logo: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=120&auto=format&fit=crop&q=80',
      trackingPrefix: 'TCS',
      accountNumber: 'TCS-CORP-4882',
      centerCode: 'TCS-LHE-HQ',
      originCity: 'Lahore',
      apiKey: 'tcs_api_live_891723',
      defaultRatePKR: 350,
      deliveryEta: '1–2 Days (Express)',
      status: 'inactive',
      trackingUrlTemplate: 'https://www.tcsexpress.com/track/',
    },
  ];

  for (const c of couriers) {
    insert.run(
      c.id,
      c.name,
      c.logo,
      c.trackingPrefix,
      c.accountNumber,
      c.centerCode,
      c.originCity,
      c.apiKey,
      c.defaultRatePKR,
      c.deliveryEta,
      c.status,
      c.trackingUrlTemplate,
      now,
      now
    );
  }
}

function seedInitialPromoCodes() {
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO promo_codes (
      id, code, type, value, min_spend_pkr, max_discount_pkr, usage_limit,
      usage_count, expiry_date, is_active, description, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const promos = [
    {
      id: 'promo-1',
      code: 'MBATELIER10',
      type: 'percentage',
      value: 10,
      minSpendPKR: 5000,
      maxDiscountPKR: 1500,
      usageLimit: 500,
      usageCount: 43,
      expiryDate: '2026-12-31T23:59:59Z',
      isActive: 1,
      description: '10% Welcome Discount for Nationwide Orders over PKR 5,000',
    },
    {
      id: 'promo-2',
      code: 'GRANDOPEN500',
      type: 'flat',
      value: 500,
      minSpendPKR: 3990,
      maxDiscountPKR: null,
      usageLimit: 200,
      usageCount: 112,
      expiryDate: '2026-11-30T23:59:59Z',
      isActive: 1,
      description: 'Flat PKR 500 Off on Grand Opening Launch Campaign',
    },
    {
      id: 'promo-3',
      code: 'RETURNING10',
      type: 'percentage',
      value: 10,
      minSpendPKR: 3500,
      maxDiscountPKR: null,
      usageLimit: 1000,
      usageCount: 19,
      expiryDate: '2026-12-31T23:59:59Z',
      isActive: 1,
      description: 'Exclusive 10% Off for Loyal Verified WhatsApp Returning Customers',
    },
  ];

  for (const pr of promos) {
    insert.run(
      pr.id,
      pr.code,
      pr.type,
      pr.value,
      pr.minSpendPKR,
      pr.maxDiscountPKR,
      pr.usageLimit,
      pr.usageCount,
      pr.expiryDate,
      pr.isActive,
      pr.description,
      now,
      now
    );
  }
}

function seedInitialBanner() {
  const insert = db.prepare(`
    INSERT INTO campaign_banners (
      id, title, subtitle, discount_badge, countdown_ends_at, is_active, cta_text, cta_target_id, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    'campaign-grand-opening',
    'Grand Opening Launch Sale · 15% Off Flagship Bags',
    'Use code MBATELIER10 at checkout · Free Doorstep Open Parcel COD Across Pakistan',
    '15% OFF LAUNCH',
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    1,
    'Shop Launch Offers',
    'shop',
    new Date().toISOString()
  );
}

export function logAuditEvent(actorType: string, actorId: string | null, action: string, details?: string, ipAddress?: string) {
  try {
    const insert = db.prepare(`
      INSERT INTO audit_logs (id, actor_type, actor_id, action, resource, ip_address, details_json, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      `aud-${crypto.randomUUID()}`,
      actorType,
      actorId,
      action,
      null,
      ipAddress || '127.0.0.1',
      details || null,
      new Date().toISOString()
    );
  } catch {
    // Suppress audit log write error to avoid failing the main transaction
  }
}
