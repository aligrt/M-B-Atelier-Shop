# M&B Atelier — Database Architecture & Migrations Guide

**Database Engine:** SQLite 3 (`node:sqlite` via Node 22 built-in engine / WAL mode)  
**Location:** `data/mbatelier.sqlite`  
**Durability Settings:** `PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON;`  

---

## 1. Relational Entity Schema

### 1.1 `administrators`
Stores authorized administrative accounts with PBKDF2-HMAC-SHA512 password hashes.
```sql
CREATE TABLE administrators (
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
```

### 1.2 `admin_recovery_codes`
Stores single-use emergency break-glass recovery codes hashed with SHA-256.
```sql
CREATE TABLE admin_recovery_codes (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  used_at TEXT,
  FOREIGN KEY (admin_id) REFERENCES administrators(id) ON DELETE CASCADE
);
```

### 1.3 `customers`
Stores customer records authenticated via verified WhatsApp/SMS numbers.
```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 1.4 `products`
Authoritative product catalog with real integer-based inventory levels.
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT,
  price INTEGER NOT NULL,
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
```

### 1.5 `orders` & `order_items`
Authoritative orders and line items created via atomic transactions.
```sql
CREATE TABLE orders (
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

CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
```

---

## 2. Migration and Seeding

The database initializes automatically on server startup via `initializeDatabase()` in `server/db.ts`. If the database file does not exist, all tables are created and seeded with:
1. Three flagship handcrafted bags (`The Metro Commuter Backpack`, `The Tech Exec Clamshell`, `The Urban Minimalist Sling`).
2. Couriers: Trax Logistics, CallCourier, PostEx, and TCS Express.
3. Active Promo Codes (`MBATELIER10`, `GRANDOPEN500`, `RETURNING10`).
4. Grand Opening Campaign Banner.
5. Initial administrator account (`admin@mbatelier.shop`) with 5 hashed emergency break-glass recovery codes.
