import express from 'express';
import Carpet from '../models/Carpet.js';
import { requireAdmin } from '../middleware/admin.js';
import { rateLimit } from '../middleware/limits.js';
import Order from '../models/Order.js';

const router = express.Router();

// GET all orders (for admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.carpet')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Unable to process order' });
  }
});

// GET single order
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.carpet');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Unable to process order' });
  }
});

// POST create new order
router.post('/', rateLimit(10), async (req, res) => {
  try {
    const { customerName, email, phone, address, items, notes } = req.body;

    // Validate required fields
    if (!customerName || !email || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!Array.isArray(items) || items.length > 50) return res.status(400).json({ message: 'Invalid cart' });
    const pricedItems = [];
    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) return res.status(400).json({ message: 'Invalid quantity' });
      const rug = await Carpet.findById(item.carpet);
      if (!rug) return res.status(400).json({ message: 'A rug is no longer available' });
      pricedItems.push({ carpet: rug._id, quantity: item.quantity, price: rug.price });
    }
    const calculatedTotal = pricedItems.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;
    const order = new Order({
      customerName,
      email,
      phone,
      address,
      items: pricedItems,
      totalAmount: calculatedTotal,
      notes: notes || ''
    });

    const savedOrder = await order.save();
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('items.carpet');

    res.status(201).json({ _id: populatedOrder._id, status: populatedOrder.status, totalAmount: populatedOrder.totalAmount });
  } catch (error) {
    res.status(400).json({ message: 'Invalid order details' });
  }
});

// PUT update order status
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('items.carpet');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order details' });
  }
});

// DELETE order
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process order' });
  }
});

export default router;
