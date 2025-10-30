# Complete Setup Guide

This guide will walk you through setting up the Authly project from scratch.

## Step-by-Step Setup

### 1. Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) v20 or later
- [Go](https://golang.org/) v1.21 or later
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Windows/Mac) or Docker Engine (for Linux)
- [Yarn](https://yarnpkg.com/) package manager

### 2. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install frontend dependencies
cd app
yarn install
cd ..
```

### 3. Start PostgreSQL Database

Start the PostgreSQL database using Docker Compose:

```bash
npm run docker:up
```

This command:
- Pulls the [postgres:14.19-alpine3.21](https://hub.docker.com/_/postgres) Docker image
- Creates a PostgreSQL container named `authly-postgres`
- Exposes PostgreSQL on port `5432`
- Creates a database named `authly` with user `authly`

**Database Connection Details:**
- **Host**: `localhost`
- **Port**: `5433` (using 5433 to avoid conflicts with local PostgreSQL)
- **Database**: `authly`
- **Username**: `authly`
- **Password**: `authly_dev_password`
- **Connection String**: `postgresql://authly:authly_dev_password@localhost:5433/authly`

To verify the database is running:
```bash
npm run docker:logs
```

### 4. Configure Environment Variables

Create a `.env` file in the `app` directory:

```bash
cd app
```

Create `app/.env` with the following content:

```env
# Database Configuration
DATABASE_URL=postgresql://authly:authly_dev_password@localhost:5433/authly

# Better Auth Configuration
BETTER_AUTH_SECRET=change-this-to-a-random-secret-key
BETTER_AUTH_URL=http://localhost:5173

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Important**: Change `BETTER_AUTH_SECRET` to a random string in production!

### 5. Initialize the Database Schema

Push the database schema to PostgreSQL:

```bash
cd ..
npm run db:setup
```

This command:
1. Ensures PostgreSQL is running
2. Pushes the Drizzle ORM schema to the database

### 6. Start the Application

Start both the backend and frontend:

```bash
npm run dev
```

This will start:
- **Backend Go API**: http://localhost:8080
- **Frontend Next.js App**: http://localhost:5173

### 7. Verify Setup

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend Health Check**: http://localhost:8080/health

## Additional Commands

### Docker Commands

```bash
# Start PostgreSQL
npm run docker:up

# Stop PostgreSQL
npm run docker:down

# View PostgreSQL logs
npm run docker:logs

# Restart PostgreSQL
npm run docker:restart
```

### Database Commands

```bash
# Open Drizzle Studio (Database GUI)
npm run db:studio

# Generate new migration
cd app
yarn db:generate

# Push schema changes
yarn db:push
```

### Development Commands

```bash
# Run both backend and frontend
npm run dev

# Run only backend
npm run dev:backend

# Run only frontend
npm run dev:frontend
```

## Troubleshooting

### PostgreSQL Connection Issues

If you get database connection errors:

1. **Check if PostgreSQL is running:**
   ```bash
   docker ps
   ```
   You should see `authly-postgres` in the list.

2. **Check PostgreSQL logs:**
   ```bash
   npm run docker:logs
   ```

3. **Restart PostgreSQL:**
   ```bash
   npm run docker:restart
   ```

4. **Verify connection string:**
   Ensure your `app/.env` file has the correct `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://authly:authly_dev_password@localhost:5433/authly
   ```

### Port Already in Use

If port 5432 is already in use by another PostgreSQL instance:

1. **Option 1**: Stop your local PostgreSQL service
2. **Option 2**: Change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - "5433:5432"  # Changed from 5432:5432
   ```
   Then update your `DATABASE_URL` to use port `5433`.

### Docker Not Starting

- Ensure Docker Desktop/Engine is running
- Check Docker status: `docker --version`
- Check Docker Compose: `docker-compose --version`

## Production Considerations

When deploying to production:

1. **Change default credentials** in `docker-compose.yml`
2. **Use strong passwords** for PostgreSQL
3. **Set a strong `BETTER_AUTH_SECRET`**
4. **Use environment variables** for sensitive data
5. **Enable SSL** for PostgreSQL connections
6. **Consider managed database services** (AWS RDS, Google Cloud SQL, etc.)

## Next Steps

- Read the [Frontend README](app/README.md) for frontend-specific documentation
- Read the [Backend README](api/README.md) for backend-specific documentation
- Explore the Better-Auth documentation at https://www.better-auth.com/

