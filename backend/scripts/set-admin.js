import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Writable } from 'node:stream';
import { createInterface } from 'node:readline/promises';
import dotenv from 'dotenv';
import { hashPassword } from '../middleware/admin.js';

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run admin:set -- admin@example.com');
  process.exit(1);
}
if (!process.stdin.isTTY) {
  console.error('Run this command in an interactive terminal so your password can stay hidden.');
  process.exit(1);
}
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) { if (!muted) process.stdout.write(chunk, encoding); callback(); } });
const prompt = createInterface({ input: process.stdin, output, terminal: true });
try {
  process.stdout.write('New admin password (hidden): '); muted = true;
  const password = await prompt.question('');
  muted = false; process.stdout.write('\nConfirm password (hidden): '); muted = true;
  const confirmation = await prompt.question('');
  muted = false; process.stdout.write('\n');
  if (password.length < 10 || password.length > 1024 || password !== confirmation) throw new Error('Passwords must match and contain 10–1024 characters.');
  const file = fileURLToPath(new URL('../.env', import.meta.url));
  const original = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const env = dotenv.parse(original);
  const accounts = JSON.parse(env.ADMIN_ACCOUNTS || '[]');
  if (!Array.isArray(accounts)) throw new Error('ADMIN_ACCOUNTS must be a JSON array.');
  const updated = accounts.filter(account => account.email?.trim().toLowerCase() !== email);
  updated.push({ email, passwordHash: await hashPassword(password) });
  const lines = original.split(/\r?\n/).filter(line => !/^\s*(?:export\s+)?ADMIN_(?:TOKEN|ACCOUNTS)\s*=/.test(line));
  while (lines.at(-1) === '') lines.pop();
  fs.writeFileSync(file, lines.join('\n') + '\nADMIN_ACCOUNTS=' + JSON.stringify(updated) + '\n', { mode: 0o600 });
  fs.chmodSync(file, 0o600);
  console.log('Admin credentials saved locally. Restart the backend to apply them.');
} catch (error) {
  muted = false; console.error(error.message); process.exitCode = 1;
} finally { prompt.close(); }
