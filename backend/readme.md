# Employee Task Tracker API

A RESTful API for managing employee tasks with authentication and role-based access control.

## Prerequisites

- Docker and Docker Compose (for containerized setup)
- Node.js 18+ and npm (for local development)
- PostgreSQL (for local development without Docker)

## Setup with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee-task-tracker/backend
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

3. **Build and start the services**
   ```bash
   docker compose up --build
   ```
   This will:
   - Start a PostgreSQL database
   - Run database migrations
   - Start the Node.js application

4. **Access the API**
   - API will be available at `http://localhost:4000`
   - PostgreSQL will be available at `localhost:5432` (if you need direct database access)

## Local Development (Without Docker)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your local database credentials.

3. **Start the development server**
   ```bash
   # Install dependencies
   npm install

   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # Create an admin user (optional)
   node scripts/create-admin.js

   # Start the development server
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (revoke refresh token)



## Database

This project uses Prisma ORM with PostgreSQL. The database schema is defined in `prisma/schema.prisma`.

### Migrations

To create and apply a new migration:
```bash
npx prisma migrate dev --name your_migration_name
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - JWT token expiration time (e.g., '1d')
- `NODE_ENV` - Environment (development/production)
- `PORT` - Port to run the server on (default: 4000)

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Refresh tokens are stored hashed in the database
- Role-based access control (RBAC) for API endpoints

## License

[Your License Here]

# Tests (dev)
- Install dev deps: `npm install --save-dev jest supertest`
- Run tests: `npm test`

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
