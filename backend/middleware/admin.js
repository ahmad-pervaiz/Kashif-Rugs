import { timingSafeEqual } from 'node:crypto';
export function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length < 32) return res.status(503).json({ message: 'Admin access is not configured' });
  const header = req.headers.authorization || '';
  const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = Buffer.from(supplied), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(401).json({ message: 'Admin authentication required' });
  res.set('Cache-Control', 'no-store');
  next();
}
