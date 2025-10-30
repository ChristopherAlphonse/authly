# Quick Start Guide

Get Authly up and running in 5 minutes! 🚀

## TL;DR - One Command Setup

```bash
# 1. Install dependencies
npm install && cd app && yarn install && cd ..

# 2. Start PostgreSQL
npm run docker:up

# 3. Create .env file in app/ directory (see below)

# 4. Setup database and run
npm run db:setup && npm run dev
```

## The DATABASE_URL Explained

When using the Docker PostgreSQL setup, your `DATABASE_URL` should be:

```
postgresql://authly:authly_dev_password@localhost:5433/authly
```

This connects to the PostgreSQL database running in Docker (from the [postgres:14.19-alpine3.21](https://hub.docker.com/_/postgres) image).

### Breaking it down:

| Part | Value | Description |
|------|-------|-------------|
| Protocol | `postgresql://` | PostgreSQL connection protocol |
| Username | `authly` | Database user (set in docker-compose.yml) |
| Password | `authly_dev_password` | Database password (set in docker-compose.yml) |
| Host | `localhost` | Database host (Docker exposes it to localhost) |
| Port | `5433` | PostgreSQL port (using 5433 to avoid conflicts) |
| Database | `authly` | Database name (created automatically) |

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Frontend dependencies
cd app
yarn install
cd ..
```

### 2. Start PostgreSQL with Docker

```bash
npm run docker:up
```

This command:
- Downloads the `postgres:14.19-alpine3.21` Docker image
- Creates and starts a PostgreSQL container
- Exposes PostgreSQL on port `5432`
- Creates the `authly` database automatically

### 3. Configure Environment Variables

Create `app/.env` file:

```bash
# Navigate to app directory
cd app

# Create .env file
# Windows (PowerShell):
New-Item -Path .env -ItemType File

# Mac/Linux:
touch .env
```

Add this content to `app/.env`:

```env
DATABASE_URL=postgresql://authly:authly_dev_password@localhost:5432/authly
BETTER_AUTH_SECRET=change-this-to-a-random-secret-key
BETTER_AUTH_URL=http://localhost:5173
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 4. Initialize Database

```bash
# From root directory
npm run db:setup
```

### 5. Start Development Servers

```bash
npm run dev
```

This starts:
- **Go Backend**: http://localhost:8080
- **Next.js Frontend**: http://localhost:5173

## Verify Everything Works

1. **Check Docker is running:**
   ```bash
   docker ps
   ```
   You should see `authly-postgres` running.

2. **Check backend health:**
   Open http://localhost:8080/health in your browser.

3. **Check frontend:**
   Open http://localhost:5173 in your browser.

## Common Commands

```bash
# Development
npm run dev                 # Run both backend and frontend
npm run dev:backend         # Run only Go API
npm run dev:frontend        # Run only Next.js app

# Docker Management
npm run docker:up           # Start PostgreSQL
npm run docker:down         # Stop PostgreSQL
npm run docker:logs         # View PostgreSQL logs
npm run docker:restart      # Restart PostgreSQL

# Database
npm run db:setup            # Initialize database schema
npm run db:studio           # Open database GUI
```

## Troubleshooting

### "Cannot connect to database"

1. Check if PostgreSQL is running:
   ```bash
   docker ps
   ```

2. Check PostgreSQL logs:
   ```bash
   npm run docker:logs
   ```

3. Restart PostgreSQL:
   ```bash
   npm run docker:restart
   ```

### "Port 5432 already in use"

You have another PostgreSQL instance running. Either:
- Stop your local PostgreSQL service, or
- Change the port in `docker-compose.yml`:
  ```yaml
  ports:
    - "5433:5432"  # Use port 5433 instead
  ```
  Then update `DATABASE_URL` to use port `5433`.

### ".env file not found"

Make sure you create the `.env` file in the `app/` directory (not the root directory).

```bash
cd app
ls -la .env  # Mac/Linux
dir .env     # Windows
```

## What's Next?

- ✅ Read the [Complete Setup Guide](SETUP.md) for detailed information
- ✅ Check [Environment Variables Documentation](ENV_TEMPLATE.md) for all configuration options
- ✅ Review the [Frontend README](app/README.md) and [Backend README](api/README.md)
- ✅ Learn about Better-Auth at https://www.better-auth.com/

## Need Help?

- **Detailed Setup**: See [SETUP.md](SETUP.md)
- **Environment Variables**: See [ENV_TEMPLATE.md](ENV_TEMPLATE.md)
- **Docker Issues**: Check [Docker Documentation](https://docs.docker.com/)
- **PostgreSQL**: See [Official PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

---

**Happy coding! 🎉**

