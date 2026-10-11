# M&B Atelier — Environment Variables Specification

**Domain:** `mbatelier.shop`  
**Security Classification:** RESTRICTED · NEVER COMMIT VALUES TO SOURCE CONTROL  

---

## 1. Overview

All environment variables used by the M&B Atelier full-stack application are documented below. Secrets must be configured in hosting environment variable settings (e.g., Cloud Run, Vercel, Railway, or AWS SSM) or in a local `.env` file that is excluded via `.gitignore`.

---

## 2. Environment Variable Inventory

| Variable Name | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` / `development` | Controls security flags, cookie `Secure` attribute, and Vite middleware mode |
| `PORT` | Optional | `3000` | Port for the Express server to listen on |
| `APP_URL` | Yes | `https://mbatelier.shop` | Base public canonical URL of the application |
| `TRUSTED_ORIGINS` | Yes | `https://mbatelier.shop,http://localhost:3000` | Comma-separated list of allowed origins for CORS |
| `SESSION_SECRET` | Yes | Random 64-character string | Cryptographic secret used for cookie signing and session tampering defense |
| `JWT_SECRET` | Yes | Random 64-character string | HMAC-SHA256 secret key for signing customer and administrative session tokens |
| `ADMIN_BOOTSTRAP_EMAIL` | Optional | `admin@mbatelier.shop` | Initial email seeded for the master administrator |
| `ADMIN_BOOTSTRAP_PASSWORD` | Optional | `mbatelier2026_SecureAdmin!` | Initial strong password seeded for the master administrator |
| `GATEWAY_SECRET_TOKEN` | Yes | `gateway-portal-x99` | Secret token required to validate admin gateway route requests |
| `SMS_PROVIDER` | Optional | `disabled` / `twilio` | Gateway provider for WhatsApp / SMS OTP delivery |
| `EMAIL_PROVIDER` | Optional | `disabled` / `smtp` | Gateway provider for transactional email notifications |

---

## 3. Secret Generation Guidelines

Generate cryptographically secure 64-character secrets using OpenSSL:

```bash
# Generate JWT_SECRET
openssl rand -base64 48

# Generate SESSION_SECRET
openssl rand -base64 48
```
