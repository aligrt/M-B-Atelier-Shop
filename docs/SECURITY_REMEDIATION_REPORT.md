# M&B Atelier — Security Remediation & Vulnerability Assessment Report

**Application:** M&B Atelier (`mbatelier.shop`)  
**Security Standard:** NIST SP 800-63B MFA, RFC 6238 TOTP, OWASP Top 10:2021, Zero-Trust Architecture  
**Audit & Remediation Date:** October 2026  
**Status:** REMEDIATED & ZERO-TRUST ENFORCED  

---

## 1. Executive Summary

A comprehensive security audit and remediation was performed on the M&B Atelier e-commerce platform. Prior to remediation, the application relied on client-side authentication checks, hardcoded admin credentials and OTP verification bypasses, and had zero server-side route enforcement.

All critical vulnerabilities have been remediated by deploying a dedicated server-side architecture (`server.ts`, `server/auth.ts`, `server/api.ts`, and `server/db.ts`) with a persistent SQLite database, timing-safe PBKDF2-HMAC-SHA512 password hashing, server-generated cryptographic JWTs, strict IDOR authorization filters, and honeypot reconnaissance decoys.

---

## 2. Remediated Vulnerabilities & Technical Fixes

### 2.1 Hardcoded Administrator Passwords & Bypass Codes (CWE-259 / CWE-798)
- **Previous State:** `securityService.ts` evaluated credentials directly on the client with hardcoded passwords (`mbatelier2026`, `admin123`) and in-memory recovery codes.
- **Remediation:** Removed all hardcoded credentials from client-side code. Created server-side endpoint `/api/v1/auth/gateway-portal-x99` backed by SQLite `administrators` table. Passwords are now hashed using PBKDF2-HMAC-SHA512 (100,000 iterations, 16-byte cryptographically secure salt) and compared using `crypto.timingSafeEqual`.

### 2.2 Client-Side Session Signing & Fake JWTs (CWE-345)
- **Previous State:** Administrative JWT tokens were generated using client-side SubtleCrypto in browser sessionStorage.
- **Remediation:** Token generation is now exclusively executed by the server (`server/auth.ts` `signJwt`) using HMAC-SHA256 with server-side `JWT_SECRET`. Tokens are transmitted and stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies with 15-minute idle expiration.

### 2.3 Customer OTP Verification Bypass (CWE-304 / CWE-287)
- **Previous State:** Customer OTP verification allowed `123456` as an arbitrary bypass code on the client.
- **Remediation:** Removed the `123456` bypass completely. OTPs are now generated on the server using `crypto.randomInt(100000, 999999)`, stored as SHA-256 hashes with a 5-minute expiration in the database, and consumed immediately upon successful validation (one-time use). Rate limits enforce a maximum of 3 requests per 10 minutes per phone number.

### 2.4 Insecure Direct Object References (IDOR) on Order History (CWE-639)
- **Previous State:** Order history was accessible through localStorage or unauthenticated queries.
- **Remediation:** Implemented `requireAuth()` middleware on `/api/orders/history`. The server validates that the requesting session matches the target customer UID or possesses the `ADMIN_SUPER` role claim. Any unauthorized attempt returns `403 Forbidden`.

### 2.5 Reconnaissance Scanning & Admin Footprint (CWE-200)
- **Previous State:** Legacy paths like `/admin`, `/wp-admin`, and `/dashboard` were exposed in client bundles.
- **Remediation:** Decoupled all admin navigation links from the public DOM. Implemented an authentic Apache/2.4.52 (Ubuntu) 404 Honeypot interceptor on all common scan targets. Admin gateway access is strictly restricted to the obfuscated token gateway (`POST /api/v1/auth/gateway-portal-x99` or keyboard chord `Ctrl+Shift+A`).

### 2.6 Server-Side Price & Inventory Tampering (CWE-602)
- **Previous State:** Order placement accepted client-calculated subtotals and discounts.
- **Remediation:** `/api/orders/place` now recalculates subtotals, product prices, discounts, and inventory availability authoritatively on the server inside SQLite atomic transactions (`BEGIN TRANSACTION ... COMMIT`). If stock is insufficient, the transaction rolls back with a `409 Conflict`.
