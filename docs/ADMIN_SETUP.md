# Admin sign-in and local database

Open http://localhost:5173/admin and sign in using your admin email and password. Admins have the same access to rug editing and review moderation. Login does not require MongoDB; rug, order and review operations do.

Account configuration lives only in the ignored `backend/.env` file, in `ADMIN_ACCOUNTS`. Each entry has an email and a salted scrypt password hash. No passwords or account hashes are committed to GitHub. Configure the accounts separately on any deployed server.

To create an admin or change its password, run from the project root:

```bash
npm run admin:set --prefix backend -- admin@example.com
```

Enter and confirm the password at the hidden prompts. Restart the backend after changing accounts. Removing an entry disables that account. The old shared `ADMIN_TOKEN` no longer grants access.

Sessions last one hour and stay in browser memory. Refreshing the page requires signing in again. Signing out revokes that session on the server. Restarting the backend revokes all sessions. Changing account credentials invalidates existing sessions. Login accepts five attempts per source IP per 15 minutes; restarting clears this development in-memory limiter. Multiple app instances require a shared session/rate-limit store before deployment. Use HTTPS for a public deployment.

## Start local MongoDB

With Docker running, from the project root:

```bash
docker compose up -d mongodb
```

The development database binds only to `127.0.0.1:27017` and stores data in a persistent named Docker volume. This local-only configuration has no database password; use authenticated, access-controlled database hosting for production.

Ensure `backend/.env` includes:

```env
MONGO_URI=mongodb://127.0.0.1:27017/kashif-rugs
FRONTEND_ORIGIN=http://localhost:5173
PORT=5000
```

Restart `npm start` after the database is ready. `/api/health` reports database connectivity. Catalog, order and review APIs return a clear 503 while disconnected instead of waiting on database queries.

Stop the database without deleting its data:

```bash
docker compose stop mongodb
```

Do not remove its Docker volume unless you intend to delete the local store data.

## Verification

```bash
npm test --prefix backend
npm run build --prefix frontend
```

Tests cover independent admin logins, wrong passwords, generic unknown-account errors, login throttling, expiring/revoked sessions, password-change invalidation, private order reads and server-calculated prices. Test fixtures do not use real admin credentials.
