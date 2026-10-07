# M&B Atelier - Backend REST API Specification & Integration Contract

**Domain:** `mbatelier.shop`  
**Target Market:** Pakistan (Mobile-first, WhatsApp identity, Cash on Delivery)  
**Architecture:** Serverless REST Microservices (Google Cloud Functions / Cloud Run / Firebase Firestore & Auth)

---

## 1. Authentication & Identity: WhatsApp as Customer ID (`uid`)

In Pakistan, mobile numbers are the primary customer identity. The database uses the normalized Pakistani mobile number in E.164 without plus (`923XXXXXXXXX`) as the immutable Customer ID (`uid`).

- **JWT Session:** Issued on successful OTP verification.
- **Cookie Header:** `Set-Cookie: mb_atelier_jwt=<token>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
- **Bearer Header:** `Authorization: Bearer <token>`

---

## 2. API Endpoints

### 2.1 Request WhatsApp OTP
*Initiates WhatsApp OTP delivery via Twilio WhatsApp Business API or specialized local Pakistani gateway (e.g., Brandverse, SMS4Connect, Telecard).*

- **Route:** `POST /api/auth/request-otp`
- **Auth Required:** No
- **Rate Limit:** 3 requests per 5 minutes per IP/mobile

#### Request Payload
```json
{
  "phone": "923001234567"
}
```

#### Field Specifications:
- `phone` *(string, required)*: Mobile number normalized to 12 digits starting with `923`.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "A 6-digit verification code has been dispatched to WhatsApp +92 300 1234567.",
  "uid": "923001234567",
  "expiresInSeconds": 300
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "INVALID_PHONE_FORMAT",
  "message": "Please enter a valid Pakistani mobile number starting with 03XX."
}
```

---

### 2.2 Verify WhatsApp OTP
*Validates the 6-digit OTP code. If the user does not exist, registers a new profile document in Firestore `users/{uid}`. Issues secure session JWT token.*

- **Route:** `POST /api/auth/verify-otp`
- **Auth Required:** No

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI5MjMwMDEyMzQ1NjciLCJpYXQiOjE3NDEyMzQ1Njd9.mock_signature",
  "user": {
    "uid": "923001234567",
    "phone": "+92 300 1234567",
    "name": "Hamza Tariq",
    "address": "House 42-B, Sector Y, DHA Phase 3",
    "city": "Lahore",
    "createdAt": "2026-03-01T10:00:00.000Z",
    "orderCount": 2
  },
  "message": "WhatsApp authentication successful."
}
```

#### Error Response (401 Unauthorized)
```json
{
  "success": false,
  "error": "INVALID_OTP",
  "message": "Incorrect verification code. Please check your WhatsApp messages."
}
```

---

### 2.3 Returning Customer Offers & Discount Triggers
*Evaluates dynamic promotion rules for returning patrons and cart retention.*

- **Route:** `GET /api/customer/offers`
- **Query Params:** `?uid=923001234567`
- **Auth Required:** Optional (JWT via Cookie or Bearer)

#### Backend Business Rules:
1. **Rule 1 (Returning Patron Discount):** Look up `orders` collection where `uid == request.uid` and `status == 'Delivered'`. If `count > 1`, return coupon `RETURNING10` (10% off total).
2. **Rule 2 (Cart Retention):** If user has items in cart and `lastAccountVisit > 10 days`, return coupon `MBFREE` (Complimentary priority courier).

#### Sample Response (200 OK)
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

### 2.4 Place Cash on Delivery Order
*Creates a stateful order in Firestore `orders/{orderId}`, increments patron order counters, and prepares courier dispatch payload for Trax/CallCourier/TCS.*

- **Route:** `POST /api/orders/place`
- **Auth Required:** Yes (JWT via Cookie or Bearer header)

#### Request Payload
```json
{
  "customerName": "Hamza Tariq",
  "phone": "0300 1234567",
  "address": "House 42-B, Sector Y, DHA Phase 3",
  "city": "Lahore",
  "deliveryNotes": "Near Commercial Broadway / Open-parcel inspect before payment",
  "items": [
    {
      "product": {
        "id": "model-1",
        "name": "Model 1: The Metro Stealth Commuter",
        "price": 14500
      },
      "quantity": 1
    }
  ],
  "subtotal": 14500,
  "discountAmount": 1450,
  "couponCode": "RETURNING10",
  "total": 13050
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "orderId": "MBA-7193",
  "order": {
    "orderId": "MBA-7193",
    "date": "2026-10-07",
    "itemsSummary": "Model 1: The Metro Stealth Commuter (x1)",
    "itemCount": 1,
    "total": 13050,
    "status": "COD Pending",
    "paymentMethod": "Cash on Delivery",
    "city": "Lahore",
    "deliveryAddress": "House 42-B, Sector Y, DHA Phase 3",
    "courierName": "Trax Logistics",
    "courierTrackingNumber": "TRX-MBA7193",
    "courierTrackingUrl": "https://sonic.trax.pk/tracking?tracking_number=TRX-MBA7193",
    "canInspectParcel": true
  }
}
```

---

### 2.5 Get Order History
*Fetches all historical purchases linked to the verified WhatsApp ID.*

- **Route:** `GET /api/orders/history?uid=923001234567`
- **Auth Required:** Yes (JWT verification must match `req.user.uid == query.uid`)

#### Sample Response (200 OK)
```json
[
  {
    "orderId": "MBA-9821",
    "date": "2026-03-24",
    "itemsSummary": "Model 1: The Metro Stealth Commuter (x1)",
    "itemCount": 1,
    "total": 14500,
    "status": "Delivered",
    "paymentMethod": "Cash on Delivery",
    "city": "Lahore",
    "deliveryAddress": "House 42-B, Sector Y, DHA Phase 3, Lahore",
    "courierName": "Trax Logistics",
    "courierTrackingNumber": "TRX-PK-7829104",
    "courierTrackingUrl": "https://sonic.trax.pk/tracking?tracking_number=TRX-PK-7829104",
    "canInspectParcel": true
  },
  {
    "orderId": "MBA-8412",
    "date": "2026-02-10",
    "itemsSummary": "Model 2: The Tactical Rainproof Weekender (x1)",
    "itemCount": 1,
    "total": 18500,
    "status": "Delivered",
    "paymentMethod": "Cash on Delivery",
    "city": "Lahore",
    "deliveryAddress": "House 42-B, Sector Y, DHA Phase 3, Lahore",
    "courierName": "CallCourier",
    "courierTrackingNumber": "CC-9948218-LHR",
    "courierTrackingUrl": "https://callcourier.com.pk/tracking/?trackingno=CC-9948218-LHR",
    "canInspectParcel": true
  }
]
```

---

## 3. Database Schema (Firestore / MongoDB)

### Collection: `users`
- `_id / uid`: `string` ("923001234567")
- `phone`: `string`
- `name`: `string`
- `defaultAddress`: `string`
- `defaultCity`: `string`
- `createdAt`: `timestamp`
- `updatedAt`: `timestamp`
- `ordersCount`: `number`

### Collection: `orders`
- `_id`: `string` ("MBA-7193")
- `customerUid`: `string` ("923001234567")
- `customerName`: `string`
- `phone`: `string`
- `city`: `string`
- `shippingAddress`: `string`
- `items`: `Array<OrderItem>`
- `subtotal`: `number`
- `discountAmount`: `number`
- `couponCode`: `string | null`
- `totalAmount`: `number`
- `paymentMethod`: `string` ("COD")
- `status`: `'COD Pending' | 'Shipped' | 'Delivered' | 'Cancelled'`
- `courier`: `{ name: string, trackingNumber: string, trackingUrl: string }`
- `openParcelAllowed`: `boolean` (default: `true`)
