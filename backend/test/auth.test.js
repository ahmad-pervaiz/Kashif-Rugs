import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import authRoutes from '../routes/auth.js';
import { hashPassword } from '../middleware/admin.js';

test('two admins can sign in independently; passwords, logout and throttling are enforced', async () => {
  const previous = process.env.ADMIN_ACCOUNTS;
  const firstHash = await hashPassword('test-only-password');
  const secondHash = await hashPassword('second-test-password');
  assert.notEqual(firstHash, await hashPassword('test-only-password'));
  process.env.ADMIN_ACCOUNTS = JSON.stringify([
    { email: 'first@example.com', passwordHash: firstHash },
    { email: 'second@example.com', passwordHash: secondHash },
  ]);
  const app = express(); app.use(express.json()); app.use('/auth', authRoutes);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  const url = `http://127.0.0.1:${server.address().port}/auth`;
  const login = (email, password) => fetch(url + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  try {
    const first = await login(' FIRST@example.com ', 'test-only-password');
    assert.equal(first.status, 200);
    assert.equal(first.headers.get('cache-control'), 'no-store');
    const a = await first.json();
    assert.equal(a.email, 'first@example.com');
    assert.equal(a.passwordHash, undefined);
    const second = await login('second@example.com', 'second-test-password');
    assert.equal(second.status, 200);
    const b = await second.json();
    assert.notEqual(a.token, b.token);
    assert.ok(a.expiresAt > Date.now());
    const check = token => fetch(url + '/me', { headers: { Authorization: 'Bearer ' + token } });
    assert.equal((await check(a.token)).status, 200);
    await fetch(url + '/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + a.token } });
    assert.equal((await check(a.token)).status, 401);
    assert.equal((await check(b.token)).status, 200);
    const wrong = await login('first@example.com', 'wrong-password');
    const unknown = await login('unknown@example.com', 'wrong-password');
    assert.equal(wrong.status, 401);
    assert.equal(unknown.status, 401);
    assert.deepEqual(await wrong.json(), await unknown.json());
    assert.equal((await login({ unexpected: true }, 'anything')).status, 401);
    assert.equal((await login('first@example.com', 'test-only-password')).status, 429);
  } finally {
    if (previous === undefined) delete process.env.ADMIN_ACCOUNTS; else process.env.ADMIN_ACCOUNTS = previous;
    await new Promise(resolve => server.close(resolve));
  }
});
