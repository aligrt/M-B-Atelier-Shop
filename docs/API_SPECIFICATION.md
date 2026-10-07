# M&B Atelier — REST API Specification & Pakistani COD Architecture

**Domain:** `mbatelier.shop`  
**Target Market:** Pakistan D2C E-Commerce (Cash-on-Delivery, WhatsApp Identity, Multi-Hub Courier Logistics)  
**Security & State Model:** Serverless HTTP/JSON Microservices, Google Cloud Functions / Firebase Auth & Firestore, HttpOnly JWT Bearer tokens, WhatsApp Business Cloud API.

---

## 1. Authentication & WhatsApp Customer Identity

In Pakistan, mobile numbers (`923XXXXXXXXX`) serve as the primary unique customer identifier (`uid`). No email or complex passwords are required before checkout.

### `POST /api/auth/request-otp`
Requests a 6-digit one-time passcode delivered directly to the user's WhatsApp account.

- **Rate Limit:** 3 requests / 60 seconds per IP / Phone
- **Gateway:** Twilio WhatsApp Business API / Local Pakistani WhatsApp Gateway

#### Request Payload
```json
{
  "phone": "923001234567"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "OTP sent via WhatsApp to +92 300 1234567",
  "uid": "923001234567",
  "expiresInSeconds": 300
}
```

---

### `POST /api/auth/verify-otp`
Verifies the user-entered 6-digit OTP, initializes/retrieves the customer profile from Firestore, and sets the secure authentication session.

#### Request Payload
```json
{
  "phone": "923001234567",
  "otp": "786920"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI5MjMwMDEyMzQ1NjciLCJpYXQiOjE3OTIxMDAwMDB9.xyz...",
  "user": {
    "uid": "923001234567",
    "phone": "+92 300 1234567",
    "name": "Hamza Tariq",
    "address": "House 42-B, Sector Y, DHA Phase 3",
    "city": "Lahore",
    "createdAt": "2026-03-24T10:00:00.000Z",
    "orderCount": 2
  },
  "message": "WhatsApp authentication successful"
}
```

---

## 2. Customer Offers & Returning Patron Strategy

### `GET /api/customer/offers?uid=923001234567`
Evaluates database order history for the authenticated WhatsApp UID and unlocks personalized incentives.

#### Query Parameters
- `uid`: Customer's verified WhatsApp ID (`923XXXXXXXXX`)

#### Response (200 OK)
```json
[
  {
    "code": "RETURNING10",
    "title": "Loyal Patron: 10% Off Entire Order",
    "description": "Exclusively unlocked for returning M&B Atelier patrons with completed orders.",
    "discountPercent": 10,
    "badge": "10% VIP DISCOUNT",
    "triggerReason": "RETURNING_CUSTOMER"
  },
  {
    "code": "MBFREE",
    "title": "VIP Express Courier Complimentary",
    "description": "Priority courier dispatch with zero handling charges across Pakistan.",
    "isFreeShipping": true,
    "badge": "FREE COURIER",
    "triggerReason": "CART_INACTIVE_10D"
  }
]
```

---

## 3. Order Placement with High-Trust Open Parcel Guarantee

### `POST /api/orders/place`
Creates a new Cash on Delivery order in Firestore linked to the customer's WhatsApp ID.

#### Headers
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: application/json`

#### Request Payload
```json
{
  "customerName": "Hamza Tariq",
  "phone": "923001234567",
  "address": "House 42-B, Sector Y, DHA Phase 3",
  "city": "Lahore",
  "deliveryNotes": "Near DHA Phase 3 Commercial Area / Ring Road",
  "items": [
    {
      "product": {
        "id": "metro-commuter",
        "name": "The Metro Commuter Backpack",
        "price": 6990
      },
      "quantity": 1
    }
  ],
  "subtotal": 6990,
  "discountAmount": 699,
  "couponCode": "RETURNING10",
  "total": 6291,
  "openParcelRequested": true
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "orderId": "MBA-9821",
  "order": {
    "orderId": "MBA-9821",
    "date": "2026-04-07",
    "itemsSummary": "The Metro Commuter Backpack (x1)",
    "itemCount": 1,
    "total": 6291,
    "status": "COD Pending",
    "paymentMethod": "Cash on Delivery",
    "city": "Lahore",
    "deliveryAddress": "House 42-B, Sector Y, DHA Phase 3",
    "courierName": "Trax Logistics",
    "courierTrackingNumber": "TRX-9821-PK",
    "courierTrackingUrl": "https://sonic.trax.pk/tracking?tracking_number=TRX-9821-PK",
    "canInspectParcel": true,
    "openParcelRequested": true
  }
}
```

---

## 4. Post-Purchase One-Click COD Upsell

### `POST /api/orders/upsell`
Immediately appends an impulse add-on accessory (such as the M&B Waterproof Tech Pouch) to the active, unfulfilled COD order without prompting for OTP, re-entering address, or triggering duplicate shipping costs.

#### Headers
- `Authorization: Bearer <JWT_TOKEN>` (Optional if session is active)
- `Content-Type: application/json`

#### Request Payload
```json
{
  "orderId": "MBA-9821",
  "upsellProduct": {
    "id": "mb-tech-pouch",
    "name": "M&B Waterproof Tech Pouch",
    "price": 990,
    "originalPrice": 1500
  }
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "orderId": "MBA-9821",
  "newTotal": 7281,
  "addedItem": "M&B Waterproof Tech Pouch",
  "message": "M&B Waterproof Tech Pouch added to active COD parcel with zero extra shipping."
}
```

---

## 5. Embedded Courier Tracking Integration (Pakistani Courier APIs)

### `GET /api/shipping/track?order_id=MBA-9821`
Aggregates telemetry scans from Pakistani courier APIs (Trax Logistics, CallCourier, TCS Express, PostEx) into a normalized 4-step milestone progression.

#### Query Parameters
- `order_id`: Atelier Order Reference (`MBA-XXXX`)

#### Response (200 OK)
```json
{
  "orderId": "MBA-9821",
  "consignmentNumber": "TRX-PK-7829104",
  "courierName": "Trax Logistics",
  "status": "Out for Delivery",
  "currentStageIndex": 2,
  "estimatedDelivery": "Today (Expected before 6:00 PM)",
  "riderName": "Muhammad Farhan (Rider #LHR-42)",
  "riderPhone": "0312-8491024",
  "publicTrackingUrl": "https://sonic.trax.pk/tracking?tracking_number=TRX-PK-7829104",
  "openParcelInspectionAllowed": true,
  "steps": [
    {
      "title": "Order Placed",
      "location": "M&B Sialkot Atelier",
      "timestamp": "Oct 6 • 10:30 AM",
      "completed": true,
      "description": "Order confirmed and quality audited with 1000D ballistic waterproof materials check."
    },
    {
      "title": "Dispatched from Lahore Hub",
      "location": "Cargo Terminal, Gulberg Lahore Hub",
      "timestamp": "Oct 6 • 06:45 PM",
      "completed": true,
      "current": false,
      "description": "Handed over to Trax Logistics overnight linehaul flight for rapid transit."
    },
    {
      "title": "Out for Delivery",
      "location": "DHA Phase 3 Delivery Station, Lahore",
      "timestamp": "Oct 7 • 09:15 AM",
      "completed": true,
      "current": true,
      "description": "Courier rider is on route with the package. Doorstep inspection authorized."
    },
    {
      "title": "Delivered",
      "location": "Recipient Doorstep",
      "timestamp": null,
      "completed": false,
      "current": false,
      "description": "Cash on Delivery collected. Open-parcel inspection completed successfully."
    }
  ]
}
```

---

## 6. Automatic 1-Year Local Digital Warranty Certificate

### `GET /api/warranty/details?order_id=MBA-9821&uid=923001234567`
Retrieves or issues the cryptographic digital warranty certificate linked to a delivered order.

#### Query Parameters
- `order_id`: Order identifier (`MBA-XXXX`)
- `uid`: Verified customer WhatsApp UID (`923XXXXXXXXX`)

#### Response (200 OK)
```json
{
  "serialNumber": "MBA-2026-LA-9821",
  "orderId": "MBA-9821",
  "productName": "The Metro Commuter Backpack",
  "customerUid": "923001234567",
  "deliveryDate": "2026-03-24",
  "expiryDate": "2027-03-24",
  "status": "ACTIVE",
  "coverageInclusions": [
    "100% Free Doorstep Pickup & Return via Trax Courier across Pakistan",
    "YKK Heavy-Duty Zipper Teeth & Slider Replacement Guarantee",
    "Sialkot Bartack Reinforcement & Shoulder Harness Seam Repair",
    "TPU Weatherproof Barrier & Internal False-Bottom Lining Fixes"
  ],
  "claimSupportUrl": "https://wa.me/923008472910?text=Assalam-o-Alaikum%20M%26B%20Atelier!%20I%20am%20claiming%20local%20warranty%20for%20Bag%20Serial:%20MBA-2026-LA-9821..."
}
```

---

## 7. Security, Trust & Pakistani E-Commerce Compliance

1. **HttpOnly Cookie for Tokens:** In production, authentication tokens are issued with `HttpOnly`, `Secure`, `SameSite=Lax`.
2. **Doorstep Open-Parcel Compliance:** The `openParcelRequested` boolean flag is passed to the courier booking webhook (`trax_create_booking`, `callcourier_shipment_create`) to instruct riders on the delivery manifest that doorstep package inspection is allowed before payment.
3. **Fraud Prevention:** Verified WhatsApp OTP prevents invalid address bookings common in unverified Pakistani COD checkouts.
