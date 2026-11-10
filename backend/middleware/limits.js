export function rateLimit(max = 20, windowMs = 60_000) {
  const buckets = new Map();
  const timer = setInterval(() => { const now = Date.now(); for (const [key, value] of buckets) if (value.until <= now) buckets.delete(key); }, windowMs);
  timer.unref();
  return (req, res, next) => {
    const key = req.ip, now = Date.now();
    let entry = buckets.get(key);
    if (!entry || entry.until <= now) { entry = { count: 0, until: now + windowMs }; buckets.set(key, entry); }
    if (++entry.count > max) return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    next();
  };
}
