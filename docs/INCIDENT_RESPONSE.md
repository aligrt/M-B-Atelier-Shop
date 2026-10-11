# M&B Atelier — Incident Response & Secret Rotation Playbook

**Scope:** Credential compromise, token leakage, unauthorized admin attempts, and operational security incidents.  
**Classification:** STRICTLY CONFIDENTIAL  

---

## 1. Incident Classification Levels

- **P1 — Critical:** Administrator password leaked, `JWT_SECRET` or `SESSION_SECRET` compromised, database dumped.
- **P2 — Major:** Failed brute-force attacks against admin gateway, OTP provider abuse.
- **P3 — Moderate:** Honeypot scan triggers, rate limit anomalies.

---

## 2. Emergency Secret Rotation Runbook (P1 Action)

If `JWT_SECRET` or any administrative credential is suspected of compromise:

### Step 1: Invalidate All Active Sessions Immediately
Rotating `JWT_SECRET` instantly renders all issued administrative and customer tokens cryptographically invalid:
```bash
# Generate fresh random 64-character secret
NEW_JWT_SECRET=$(openssl rand -base64 48)

# Update in hosting environment variables
# In Cloud Run / Vercel / Railway:
# Set JWT_SECRET=$NEW_JWT_SECRET
```

### Step 2: Rotate Administrator Password
Update the master administrator password directly in the database using the server cryptographic hasher:
```bash
./node_modules/.bin/tsx -e "
import { db, hashPassword } from './server/db.js';
const newHash = hashPassword('YourNewStrongAdminPassword2026!');
db.prepare('UPDATE administrators SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE email = ?')
  .run(newHash, 'admin@mbatelier.shop');
console.log('Administrator password updated successfully.');
"
```

### Step 3: Burn & Regenerate Emergency Break-Glass Codes
```bash
./node_modules/.bin/tsx -e "
import { db } from './server/db.js';
import crypto from 'node:crypto';
const admin = db.prepare('SELECT id FROM administrators LIMIT 1').get();
db.prepare('DELETE FROM admin_recovery_codes WHERE admin_id = ?').run(admin.id);
const newCodes = ['MBA-NEW1-9988', 'MBA-NEW2-7711', 'MBA-NEW3-5522', 'MBA-NEW4-3344', 'MBA-NEW5-1122'];
const insert = db.prepare('INSERT INTO admin_recovery_codes (id, admin_id, code_hash, used) VALUES (?, ?, ?, 0)');
for (const c of newCodes) {
  insert.run('rec-' + crypto.randomUUID(), admin.id, crypto.createHash('sha256').update(c).digest('hex'));
}
console.log('New break-glass recovery codes provisioned.');
"
```

### Step 4: Restart Service & Inspect Audit Logs
```bash
# Query audit logs for recent suspicious actions
./node_modules/.bin/tsx -e "
import { db } from './server/db.js';
const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 20').all();
console.table(logs);
"
```
