import test from 'node:test';
import assert from 'node:assert/strict';
import { requireAdmin } from '../middleware/admin.js';
import { imageExtension } from '../routes/carpets.js';
import Review from '../models/Review.js';
function authorize(token) {
  let status, passed = false;
  const res = { status(n) { status = n; return this; }, json() {}, set() {} };
  requireAdmin({ headers: { authorization: token } }, res, () => { passed = true; });
  return { status, passed };
}
test('admin access fails closed and only accepts the configured token', () => {
  const old = process.env.ADMIN_TOKEN;
  try {
    delete process.env.ADMIN_TOKEN;
    assert.equal(authorize('Bearer test').status, 503);
    process.env.ADMIN_TOKEN = 'a'.repeat(40);
    assert.equal(authorize('').status, 401);
    assert.equal(authorize('a'.repeat(40)).status, 401);
    assert.equal(authorize('Bearer ' + 'b'.repeat(40)).status, 401);
    assert.equal(authorize('Bearer ' + 'a'.repeat(40)).passed, true);
  } finally { if (old === undefined) delete process.env.ADMIN_TOKEN; else process.env.ADMIN_TOKEN = old; }
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
