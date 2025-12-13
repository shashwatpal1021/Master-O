# if you changed dependencies
npm install

# regenerate Prisma client if you changed schema (optional)
npx prisma generate

# create an admin user (script)
node scripts/create-admin.js

# start server (foreground)
node src/server.js
# or for development (if setup)
npm run dev


# register
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'

# login
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"password123"}'

# Notes about refresh tokens
 - Refresh tokens are now stored hashed in the database (`RefreshToken` model) for per-device sessions.
- `/api/auth/refresh` rotates the refresh token (issues a new one and revokes the old one).
- `/api/auth/logout` revokes the presented refresh token.

# Tests (dev)
- Install dev deps: `npm install --save-dev jest supertest`
- Run tests: `npm test`

# list users
curl http://localhost:4000/api/auth/users

# get tasks (with token)
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/tasks

# create task (admin)
curl -X POST -H "Authorization: Bearer <admin_token>" -H "Content-Type: application/json" -d '{"title":"Test","description":"desc","status":"PENDING","userId":2,"due_date":"2026-01-01T00:00:00Z"}' http://localhost:4000/api/tasks

---

## Notes about refresh tokens (new)

 - The project now uses **per-device refresh tokens** stored in the database in the `RefreshToken` table.
 - Refresh tokens are stored as SHA-256 hashes (`tokenHash`) to avoid storing raw tokens in the DB.
- Login flow:
	- Issues an access token cookie (`access_token`, short-lived, 15m) and a refresh token cookie (`refresh_token`, long-lived, 7 days).
	- A record is created in `RefreshToken` with the hash, expiry date and a reference to the `User`.
 - Refresh flow:
	- `POST /api/auth/refresh` reads the `refresh_token` cookie, verifies the DB entry, and returns a new access token cookie.
	- Note: we do not rotate refresh tokens on refresh; refresh tokens are single-use until they expire or are revoked via logout.
- Logout flow:
	- `POST /api/auth/logout` will revoke the presented refresh token (so it cannot be used again) and clear the cookies.

## Developer notes

- Migrations: after pulling changes, run:

```bash
npx prisma migrate dev --name add_refresh_tokens
npx prisma generate
```


If you'd like, I can add endpoints to list and revoke active sessions per user (session management) and add more exhaustive tests for corner cases.
