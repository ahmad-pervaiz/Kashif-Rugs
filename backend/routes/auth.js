import express from 'express';
import { adminConfigured, authenticate, createSession, requireAdmin, revokeSession } from '../middleware/admin.js';
import { rateLimit } from '../middleware/limits.js';
const router = express.Router();
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
router.post('/login', rateLimit(5, 15 * 60_000), async (req, res, next) => {
  try {
    if (!adminConfigured()) return res.status(503).json({ message: 'Admin accounts are not configured' });
    const account = await authenticate(req.body?.email, req.body?.password);
    if (!account) return res.status(401).json({ message: 'Incorrect email or password' });
    res.json(createSession(account));
  } catch (error) { next(error); }
});
router.post('/logout', (req, res) => { revokeSession(req); res.sendStatus(204); });
router.get('/me', requireAdmin, (req, res) => res.json(req.admin));
export default router;
