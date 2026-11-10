import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import orderRoutes from '../routes/orders.js';
import Order from '../models/Order.js';
import Carpet from '../models/Carpet.js';

// Exercise the HTTP boundary with model calls stubbed; no production database is touched.
test('order routes keep customer data private and ignore client supplied prices', async () => {
  const app = express(); app.use(express.json()); app.use('/orders', orderRoutes);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/orders`;
  const oldToken = process.env.ADMIN_ACCOUNTS;
  const oldFind = Carpet.findById, oldSave = Order.prototype.save, oldOrderFind = Order.findById;
  let stored;
  try {
    process.env.ADMIN_ACCOUNTS = JSON.stringify([{ email: 'admin@example.com', passwordHash: `scrypt:${'0'.repeat(32)}:${'0'.repeat(128)}` }]);
    for (const suffix of ['', '/507f1f77bcf86cd799439011']) {
      const response = await fetch(url + suffix);
      assert.equal(response.status, 401);
    }
    Carpet.findById = async id => ({ _id: id, price: 123.45 });
    Order.prototype.save = async function () { const error = this.validateSync(); if (error) throw error; stored = this; return this; };
    Order.findById = () => ({ populate: async () => stored });
    const body = { customerName: 'Customer', email: 'buyer@example.com', phone: '123456', address: { street: 'Street', city: 'City', state: 'State', zipCode: '12345', country: 'PK' }, items: [{ carpet: '507f1f77bcf86cd799439011', quantity: 2, price: 0.01 }], totalAmount: 0.02 };
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.equal(result.totalAmount, 246.9);
    assert.equal(stored.items[0].price, 123.45);
    assert.equal(result.email, undefined);
    body.items[0].quantity = -1;
    const invalid = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal(invalid.status, 400);
  } finally {
    Carpet.findById = oldFind; Order.prototype.save = oldSave; Order.findById = oldOrderFind;
    if (oldToken === undefined) delete process.env.ADMIN_ACCOUNTS; else process.env.ADMIN_ACCOUNTS = oldToken;
    await new Promise(resolve => server.close(resolve));
  }
});
