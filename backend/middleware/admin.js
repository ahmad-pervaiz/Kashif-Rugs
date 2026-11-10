import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const deriveKey = promisify(scrypt);
const scryptOptions = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const sessions = new Map();
const SESSION_MS = 60 * 60 * 1000;
const digest = value => createHash('sha256').update(value).digest('hex');
const cleanup = setInterval(() => {
  for (const [key, session] of sessions) if (session.expiresAt <= Date.now()) sessions.delete(key);
}, 60_000);
cleanup.unref();

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await deriveKey(password, salt, 64, scryptOptions);
  return `scrypt:${salt}:${key.toString('hex')}`;
}

function accounts() {
  try {
    const configured = JSON.parse(process.env.ADMIN_ACCOUNTS || '[]');
    if (!Array.isArray(configured) || !configured.length) return [];
    const normalized = configured.map(account => ({ email: String(account.email || '').trim().toLowerCase(), passwordHash: account.passwordHash }));
    if (normalized.some(a => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email) || !/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(a.passwordHash || ''))) return [];
    if (new Set(normalized.map(a => a.email)).size !== normalized.length) return [];
    return normalized;
  } catch { return []; }
}

export function adminConfigured() { return accounts().length > 0; }

export async function authenticate(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || !password.length || password.length > 1024) return null;
  const account = accounts().find(a => a.email === email.trim().toLowerCase());
  // Unknown emails do the same expensive derivation to avoid an account-existence timing signal.
  const encoded = account?.passwordHash || `scrypt:${'0'.repeat(32)}:${'0'.repeat(128)}`;
  const [, salt, expected] = encoded.split(':');
  const actual = await deriveKey(password, salt, 64, scryptOptions);
  if (!timingSafeEqual(actual, Buffer.from(expected, 'hex')) || !account) return null;
  return account;
}

export function createSession(account, now = Date.now()) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = now + SESSION_MS;
  sessions.set(digest(token), { email: account.email, credential: digest(account.passwordHash), expiresAt });
  return { token, email: account.email, expiresAt };
}

function bearer(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

export function revokeSession(req) { sessions.delete(digest(bearer(req))); }

export function requireAdmin(req, res, next) {
  res.set('Cache-Control', 'no-store');
  if (!adminConfigured()) return res.status(503).json({ message: 'Admin accounts are not configured' });
  const token = bearer(req);
  const key = digest(token);
  const session = sessions.get(key);
  const account = accounts().find(a => a.email === session?.email);
  if (!token || !session || session.expiresAt <= Date.now() || !account || session.credential !== digest(account.passwordHash)) {
    sessions.delete(key);
    return res.status(401).json({ message: 'Please sign in to your admin account' });
  }
  req.admin = { email: session.email };
  next();
}
