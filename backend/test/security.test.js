import test from 'node:test';
import assert from 'node:assert/strict';
import { requireAdmin, createSession, revokeSession } from '../middleware/admin.js';
import { imageExtension } from '../routes/carpets.js';
import Review from '../models/Review.js';
function authorize(token) {
  let status, passed = false;
  const res = { status(n) { status = n; return this; }, json() {}, set() {} };
  requireAdmin({ headers: { authorization: token } }, res, () => { passed = true; });
  return { status, passed };
}
test('admin access requires a live session and rejects old shared tokens', () => {
  const old = process.env.ADMIN_ACCOUNTS;
  const account = { email: 'admin@example.com', passwordHash: `scrypt:${'0'.repeat(32)}:${'0'.repeat(128)}` };
  try {
    delete process.env.ADMIN_ACCOUNTS;
    assert.equal(authorize('Bearer test').status, 503);
    process.env.ADMIN_ACCOUNTS = JSON.stringify([account]);
    assert.equal(authorize('').status, 401);
    assert.equal(authorize('Bearer ' + 'a'.repeat(40)).status, 401);
    const session = createSession(account);
    assert.equal(authorize('Bearer ' + session.token).passed, true);
    assert.equal(authorize(session.token).status, 401);
    revokeSession({ headers: { authorization: 'Bearer ' + session.token } });
    assert.equal(authorize('Bearer ' + session.token).status, 401);
    const expired = createSession(account, Date.now() - 3600001);
    assert.equal(authorize('Bearer ' + expired.token).status, 401);
    const changed = createSession(account);
    process.env.ADMIN_ACCOUNTS = JSON.stringify([{ ...account, passwordHash: `scrypt:${'1'.repeat(32)}:${'1'.repeat(128)}` }]);
    assert.equal(authorize('Bearer ' + changed.token).status, 401);
    process.env.ADMIN_ACCOUNTS = 'invalid JSON';
    assert.equal(authorize('').status, 503);
  } finally { if (old === undefined) delete process.env.ADMIN_ACCOUNTS; else process.env.ADMIN_ACCOUNTS = old; }
});
test('HTML and SVG payloads cannot masquerade as raster photo uploads', () => {
  assert.equal(imageExtension(Buffer.from('<svg onload="alert(1)"></svg>')), null);
  assert.equal(imageExtension(Buffer.from('<html>bad.jpg</html>')), null);
  assert.equal(imageExtension(Buffer.from([255,216,255,224])), '.jpg');
  assert.equal(imageExtension(Buffer.from([137,80,78,71,13,10,26,10])), '.png');
});
test('reviews default to private moderation and enforce rating boundaries', () => {
  const review = new Review({ carpet: '507f1f77bcf86cd799439011', name: 'Customer', comment: 'Lovely rug', rating: 6 });
  assert.equal(review.approved, false);
  assert.ok(review.validateSync().errors.rating);
  review.rating = 4.5;
  assert.ok(review.validateSync().errors.rating);
  review.rating = 5;
  assert.equal(review.validateSync(), undefined);
});
