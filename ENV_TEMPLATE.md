# Environment Variables Configuration

This document outlines all required and optional environment variables for the Authly project.

## Frontend Environment Variables (`app/.env`)

Create a file at `app/.env` with the following configuration:

```env
# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

# PostgreSQL connection string
# Format: postgresql://[user]:[password]@[host]:[port]/[database]
# When using Docker Compose (recommended for development):
DATABASE_URL=postgresql://authly:authly_dev_password@localhost:5433/authly

# For production, use a managed database service:
# DATABASE_URL=postgresql://user:password@your-production-db.com:5432/authly


# =============================================================================
# BETTER-AUTH CONFIGURATION
# =============================================================================

# Secret key for signing tokens and sessions
# IMPORTANT: Generate a strong random string for production!
# You can generate one with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-key-change-this-in-production

# Base URL for Better-Auth
# Development:
BETTER_AUTH_URL=http://localhost:5173
# Production (example):
# BETTER_AUTH_URL=https://your-domain.com


# =============================================================================
# NEXT.JS CONFIGURATION
# =============================================================================

# URL for the Go API backend
# Development:
NEXT_PUBLIC_API_URL=http://localhost:8080
# Production (example):
# NEXT_PUBLIC_API_URL=https://api.your-domain.com


# =============================================================================
# OPTIONAL CONFIGURATION
# =============================================================================

# Node environment (development, production, test)
NODE_ENV=development

# Next.js port (optional, defaults to 3000 but we use 5173)
# PORT=5173
```

## Docker Environment Variables (`docker-compose.yml`)

The `docker-compose.yml` file includes the following environment variables for PostgreSQL:

```yaml
environment:
  POSTGRES_USER: authly
  POSTGRES_PASSWORD: authly_dev_password
  POSTGRES_DB: authly
```

**For production**, you should:
1. Change these default values
2. Use Docker secrets or external environment files
3. Never commit production credentials to version control

## Backend Environment Variables (`api/`)

Currently, the Go backend doesn't require a `.env` file. However, if you need to configure environment variables for the Go API:

```bash
# Port for the Go API (default: 8080)
PORT=8080

# CORS allowed origins
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Quick Setup Commands

### 1. Create the frontend .env file:

**Windows (PowerShell):**
```powershell
cd app
New-Item -Path .env -ItemType File
# Then edit the file and add the configuration above
```

**Mac/Linux:**
```bash
cd app
cat > .env << 'EOF'
DATABASE_URL=postgresql://authly:authly_dev_password@localhost:5433/authly
BETTER_AUTH_SECRET=change-this-to-a-random-secret-key
BETTER_AUTH_URL=http://localhost:5173
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF
```

### 2. Generate a secure secret for production:

**Using OpenSSL:**
```bash
openssl rand -base64 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Database URL Format Explained

The `DATABASE_URL` follows this format:

```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

**Example breakdowns:**

### Local Development (Docker):
```
postgresql://authly:authly_dev_password@localhost:5433/authly
           │      │                     │         │     │
           │      │                     │         │     └─ Database name
           │      │                     │         └─ Port (5433 to avoid conflicts)
           │      │                     └─ Host
           │      └─ Password
           └─ Username
```

### Production with SSL:
```
postgresql://user:pass@prod-db.example.com:5432/authly?sslmode=require
```

### Common parameters:
- `sslmode=require` - Enforce SSL connection
- `sslmode=disable` - Disable SSL (not recommended for production)
- `connect_timeout=10` - Connection timeout in seconds
- `application_name=authly` - Application identifier

## Security Best Practices

1. **Never commit `.env` files** to version control
   - They are already in `.gitignore`

2. **Use different credentials** for each environment
   - Development, staging, production should all have different passwords

3. **Rotate secrets regularly** in production
   - Change `BETTER_AUTH_SECRET` periodically
   - Update database passwords on a schedule

4. **Use environment-specific configurations**
   - Development: Simple passwords, local database
   - Production: Strong passwords, managed database service, SSL enabled

5. **Consider using secret management tools**
   - HashiCorp Vault
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Cloud Secret Manager

## Verification

To verify your environment variables are loaded correctly:

1. **Check if DATABASE_URL is accessible:**
   ```bash
   cd app
   node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
   ```

2. **Test database connection:**
   ```bash
   npm run db:studio
   ```

3. **Check if the app can connect to PostgreSQL:**
   Start the dev server and check for any connection errors:
   ```bash
   npm run dev
   ```

## Troubleshooting

### "DATABASE_URL is not defined"
- Ensure `.env` file exists in the `app/` directory
- Check that the file is named exactly `.env` (not `.env.txt`)
- Restart your development server after creating/modifying `.env`

### "Connection refused" or "ECONNREFUSED"
- Ensure PostgreSQL Docker container is running: `docker ps`
- Check if port 5432 is accessible: `npm run docker:logs`
- Verify the connection string matches your Docker configuration

### "Invalid authentication"
- Double-check username and password in `DATABASE_URL`
- Ensure they match the values in `docker-compose.yml`
- Restart the PostgreSQL container: `npm run docker:restart`

