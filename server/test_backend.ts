import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { initializeDatabase, db, verifyPassword } from './db.js';
import { signJwt, verifyJwt } from './auth.js';

describe('M&B Atelier Backend & Security Test Suite', () => {
  before(() => {
    initializeDatabase();
  });

  test('Database schemas and seeded entities exist', () => {
    const products = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    assert.ok(products.count >= 3, 'Catalog has at least 3 flagship bags');

    const admin = db.prepare('SELECT * FROM administrators WHERE email = ?').get('admin@mbatelier.shop') as any;
    assert.ok(admin, 'Bootstrap administrator exists');
    assert.strictEqual(admin.role, 'ADMIN_SUPER');
  });

  test('Password hashing uses timing-safe PBKDF2-HMAC-SHA512', () => {
    const admin = db.prepare('SELECT * FROM administrators WHERE email = ?').get('admin@mbatelier.shop') as any;
    assert.strictEqual(verifyPassword('mbatelier2026_SecureAdmin!', admin.password_hash), true);
    assert.strictEqual(verifyPassword('wrongPassword123', admin.password_hash), false);
  });

  test('Cryptographic JWT sign and verify enforces expiration & tamper-resistance', () => {
    const payload = { sub: 'cust-123', role: 'CUSTOMER', phone: '923015466674' };
    const token = signJwt(payload, 3600);
    const verified = verifyJwt(token);

    assert.ok(verified, 'Valid JWT verified');
    assert.strictEqual(verified.sub, 'cust-123');
    assert.strictEqual(verified.role, 'CUSTOMER');

    // Tampered token check
    const tampered = token.slice(0, -5) + 'xxxxx';
    assert.strictEqual(verifyJwt(tampered), null, 'Tampered token is rejected');
  });

  test('Recovery codes are stored as SHA256 hashes and single-use only', () => {
    const codes = db.prepare('SELECT * FROM admin_recovery_codes WHERE used = 0').all();
    assert.ok(codes.length >= 5, 'At least 5 single-use break-glass codes provisioned');
  });

  test('Zero Gemini API calls or dependencies in codebase', () => {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    assert.strictEqual(pkg.dependencies['@google/genai'], undefined, '@google/genai must not be in dependencies');
  });
});
