# Authly

## Modern Authentication System

A comprehensive authentication system built with Next.js and Better Auth, featuring email/password authentication, passkeys (WebAuthn), magic links, OAuth integration, and robust security features.

### Authentication Flows

```mermaid
sequenceDiagram
    participant User
    participant Client as Client/UI
    participant Middleware as API Middleware
    participant Route as Auth Route
    participant BetterAuth as Better Auth
    participant DB as Database
    participant Resend as Resend Email

    note over User,Resend: Sign-Up with Email Verification
    User->>Client: Enter email & password
    Client->>Route: POST /api/auth/signup
    Middleware->>Middleware: Check rate limit & bot
    Middleware->>Route: Allow request
    Route->>BetterAuth: Sign up with email/password
    BetterAuth->>DB: Create user, generate token
    BetterAuth->>Resend: Send verification email
    Resend->>User: Verification link email
    Client->>Client: Show "Check your email"

    note over User,Resend: Passkey Registration
    User->>Client: Click "Register Passkey"
    Client->>Route: GET /api/passkey/check-returning-user
    Middleware->>Middleware: Check IP rate limit
    Route->>DB: Query session & user
    Route->>Client: Return { hasPasskey, user }
    Client->>BetterAuth: Add passkey
    BetterAuth->>DB: Store passkey credentials
    Client->>Client: Redirect to home

    note over User,Middleware: Rate Limit & Bot Detection
    User->>Client: Make API request
    Middleware->>Middleware: Extract user-agent
    Middleware->>Middleware: Check against bot patterns
    alt Bot detected
        Middleware->>Client: Return 403 Forbidden
    else Rate limit exceeded
        Middleware->>Client: Return 429 Too Many Requests
    else Allowed
        Middleware->>Route: Add headers, forward
        Route->>Client: Response + x-ratelimit-remaining
    end
```

## Features

- **Email/Password Authentication** - Secure user registration and login with bcrypt password hashing
- **Email Verification** - Automatic email verification on signup with customizable expiration
- **Password Reset** - Secure password reset flow with time-limited tokens
- **Magic Link Authentication** - Passwordless authentication via email links
- **Passkey Support (WebAuthn)** - Modern passwordless authentication using WebAuthn standards
- **Google OAuth Integration** - Social authentication with Google
- **Rate Limiting & Bot Detection** - Built-in middleware for API protection
- **Session Management** - Secure session handling with JWT tokens and cookie-based sessions
- **CORS Support** - Configurable trusted origins for cross-origin requests

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **PostgreSQL** (v14 or higher) - Can be run via Docker
- **Docker Desktop** (for local development database)
- **Yarn** package manager

### Required Service Accounts

You'll need to set up accounts for the following services:

1. **Resend** - For sending transactional emails
   - Sign up at [resend.com](https://resend.com)
   - Set up a domain at [resend.com/domains](https://resend.com/domains)
   - Get your API key from [resend.com/api-keys](https://resend.com/api-keys)

2. **Google OAuth** (Optional, for production)
   - Create OAuth credentials at [console.cloud.google.com/auth](https://console.cloud.google.com/auth)
   - Configure OAuth consent screen
   - Create OAuth 2.0 Client ID

## Quick Start

Follow these steps to get Authly up and running:

### 1. Clone the Repository

```bash
git clone https://github.com/ChristopherAlphonse/authly.git
cd authly
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Set Up Docker and PostgreSQL

Start the PostgreSQL database using Docker:

```bash
yarn docker:up
```

This will start a PostgreSQL container on port `5433` with:

- Database: `authly`
- User: `authly`
- Password: `authly_dev_password`

### 4. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

**Important:** Replace placeholder values with your actual credentials. See [Environment Variables](#environment-variables) for detailed descriptions.

### 5. Run Database Migrations

Set up the database schema:

```bash
yarn db:setup
```

This command will:

- Start Docker containers (if not already running)
- Push the database schema to PostgreSQL

### 6. Start the Development Server

```bash
yarn dev
```

This will start:

- **Next.js app** on [http://localhost:5173](http://localhost:5173)
- **Drizzle Studio** for database management at [https://local.drizzle.studio](https://local.drizzle.studio)

### 7. Verify Installation

1. Open [http://localhost:5173](http://localhost:5173) in your browser
2. Try signing up with a test email
3. Check your email for the verification link
4. Access Drizzle Studio to view database records

## Environment Variables

Complete reference of all environment variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BETTER_AUTH_SECRET` | ✅ Yes | Secret key for JWT token signing and encryption | `openssl rand -base64 32` |
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `RESEND_API_KEY` | ✅ Yes | Resend API key for sending emails | `re_xxxxxxxxxxxxx` |
| `EMAIL_SENDER_NAME` | ✅ Yes | Display name for email sender | `Authly` |
| `EMAIL_SENDER_ADDRESS` | ✅ Yes | Email address for sending (must be verified domain) | `noreply@yourdomain.com` |
| `GOOGLE_CLIENT_ID` | ⚠️ Production | Google OAuth client ID | `xxxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ⚠️ Production | Google OAuth client secret | `xxxxx` |
| `TELEMETRY_ENABLED` | ❌ No | Enable Better Auth telemetry (default: `true` in dev) | `true` or `false` |

### Getting Your Better Auth Secret

Generate a secure secret key:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Setting Up Resend

1. **Create Account**: Sign up at [resend.com](https://resend.com)
2. **Add Domain**: Go to [resend.com/domains](https://resend.com/domains) and add your domain
3. **Verify DNS**: Add the required DNS records to verify domain ownership
4. **Get API Key**: Navigate to [resend.com/api-keys](https://resend.com/api-keys) and create an API key
5. **Configure Sender**: Use a verified email address from your domain for `EMAIL_SENDER_ADDRESS`

### Setting Up Google OAuth

1. **Create Project**: Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Enable OAuth**: Navigate to APIs & Services > Credentials
3. **Create OAuth Client**: Create OAuth 2.0 Client ID
4. **Configure Consent Screen**: Set up OAuth consent screen
5. **Add Redirect URIs**: Add your callback URLs (e.g., `http://localhost:5173/api/auth/callback/google`)
6. **Copy Credentials**: Copy Client ID and Client Secret to your `.env` file

## Available Scripts

### Development

| Script | Description |
|--------|-------------|
| `yarn dev` | Start Next.js app and Drizzle Studio concurrently |
| `yarn dev:app` | Start only the Next.js development server (port 5173) |
| `yarn dev:studio` | Start only Drizzle Studio for database management |

### Database

| Script | Description |
|--------|-------------|
| `yarn db:generate` | Generate database migration files |
| `yarn db:migrate` | Run database migrations |
| `yarn db:push` | Push schema changes to database (dev) |
| `yarn db:push:prod` | Push schema changes to database (production) |
| `yarn db:setup` | Start Docker and push database schema |
| `yarn db:reset` | Drop and recreate database schema |
| `yarn db:studio` | Open Drizzle Studio (dev) |
| `yarn db:studio:prod` | Open Drizzle Studio (production) |

### Docker

| Script | Description |
|--------|-------------|
| `yarn docker:up` | Start Docker containers |
| `yarn docker:down` | Stop Docker containers |
| `yarn docker:logs` | View Docker container logs |
| `yarn docker:restart` | Restart Docker containers |

### Build & Production

| Script | Description |
|--------|-------------|
| `yarn build` | Build the application for production |
| `yarn start` | Start the production server |
| `yarn lint` | Run ESLint to check code quality |

### Code Quality

| Script | Description |
|--------|-------------|
| `yarn biome:check` | Check code with Biome (must return 0 errors) |
| `yarn biome:fix` | Auto-fix code issues with Biome |
| `yarn format` | Format code with Biome |

## Project Structure

```text
authly/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   │   └── [...all]/   # Better Auth catch-all route
│   │   │   └── passkey/        # Passkey management endpoints
│   │   ├── login/              # Login page
│   │   ├── signup/              # Signup page
│   │   ├── magic-link/         # Magic link page
│   │   ├── passkey/             # Passkey pages
│   │   ├── forgot-password/     # Password reset request
│   │   ├── reset-password/      # Password reset form
│   │   └── resend-verification/ # Resend email verification
│   ├── components/              # React components
│   │   ├── ui/                 # UI components (Button, Input, Card)
│   │   └── auth-status.tsx     # Authentication status component
│   ├── constants/              # Application constants
│   │   ├── app_constants.ts    # General constants
│   │   └── auth_constant.ts   # Authentication constants
│   ├── db/                     # Database configuration
│   │   ├── index.ts            # Database connection
│   │   └── schema.ts           # Drizzle ORM schema
│   ├── email/                  # Email templates
│   │   ├── magic-link.tsx      # Magic link email template
│   │   ├── reset-password.tsx  # Password reset email template
│   │   └── verify-email.tsx    # Email verification template
│   └── lib/                    # Core libraries
│       ├── auth.ts             # Better Auth configuration
│       ├── auth-client.ts      # Client-side auth utilities
│       └── utils.ts            # Utility functions
├── public/                      # Static assets
├── middleware.ts                # Next.js middleware (rate limiting, bot detection)
├── docker-compose.yml           # Docker configuration for PostgreSQL
├── drizzle.config.ts            # Drizzle ORM configuration
└── package.json                 # Dependencies and scripts
```

### Key Files

- **`src/lib/auth.ts`** - Main Better Auth configuration with all authentication providers and settings
- **`middleware.ts`** - API middleware for rate limiting and bot detection
- **`src/app/api/auth/[...all]/route.ts`** - Better Auth catch-all route handler with CORS support
- **`src/db/schema.ts`** - Database schema definitions using Drizzle ORM
- **`docker-compose.yml`** - PostgreSQL database configuration for local development

## API Endpoints

### Authentication Endpoints

All authentication endpoints are handled by Better Auth through the catch-all route `/api/auth/[...all]`.

#### User Registration

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### User Login

```http
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### User Logout

```http
POST /api/auth/sign-out
```

#### Email Verification

```http
GET /api/auth/verify-email?token=verification_token
```

#### Password Reset Request

```http
POST /api/auth/forget-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Password Reset

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "newpassword123"
}
```

#### Magic Link

```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Google OAuth

```http
GET /api/auth/sign-in/google
```

Redirects to Google OAuth consent screen.

### Passkey Endpoints

#### Check Returning User

```http
GET /api/passkey/check-returning-user
```

Checks if the current session user has a registered passkey.

**Response:**

```json
{
  "hasPasskey": true,
  "isReturningUser": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Rate Limit:** 30 requests per minute per IP

#### Check Passkey Status

```http
POST /api/passkey/has-passkeys
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "hasPasskey": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Admin Endpoint** (requires `PASSKEY_ADMIN_TOKEN`):

```http
POST /api/passkey/has-passkeys
Content-Type: application/json

{
  "adminToken": "your-admin-token"
}
```

**Response:**

```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    }
  ]
}
```

**Rate Limit:** 30 requests per minute per IP

### Rate Limiting

All API endpoints are protected by rate limiting middleware:

- **API Routes**: 20 requests per 10 seconds per IP
- **Passkey Endpoints**: 30 requests per minute per IP
- **Bot Detection**: Automatic blocking of known bot user-agents

Rate limit headers are included in responses:

- `x-ratelimit-remaining`: Number of requests remaining in the current window

## Development Workflow

### Daily Development Tasks

1. **Start Development Environment**

   ```bash
   yarn dev
   ```

2. **Access Drizzle Studio**

   - Open [https://local.drizzle.studio](https://local.drizzle.studio)
   - View and edit database records
   - Test queries

3. **Make Database Changes**

   ```bash
   # Edit src/db/schema.ts
   # Then push changes
   yarn db:push
   ```

4. **Run Code Quality Checks**

   ```bash
   yarn biome:check
   yarn biome:fix  # Auto-fix issues
   ```

5. **Test Authentication Flows**

   - Sign up → Email verification → Login
   - Password reset flow
   - Magic link authentication
   - Passkey registration and login
   - Google OAuth (if configured)

### Database Management

**View Database:**

```bash
yarn db:studio
```

**Reset Database:**

```bash
yarn db:reset
```

**Generate Migrations:**

```bash
yarn db:generate
```

## Architecture & Sequence Diagrams

### System Architecture

Authly uses a layered architecture:

1. **Client Layer** - Next.js pages and React components
2. **API Layer** - Next.js API routes with middleware
3. **Auth Layer** - Better Auth library handling authentication logic
4. **Database Layer** - PostgreSQL with Drizzle ORM
5. **Email Layer** - Resend for transactional emails



### Security Features

- **Rate Limiting**: Prevents brute force attacks and API abuse
- **Bot Detection**: Blocks known bot user-agents automatically
- **Secure Cookies**: HttpOnly, Secure, SameSite cookies for sessions
- **JWT Tokens**: Secure token-based authentication with rotation
- **Password Hashing**: bcrypt with salt rounds for password storage
- **CORS Protection**: Configurable trusted origins
- **Email Verification**: Required for account activation
- **Token Expiration**: Time-limited tokens for password reset and email verification

## Deployment

### Production Environment Setup

1. **Set Environment Variables**
   - Use your hosting platform's environment variable configuration
   - Ensure all required variables are set (see [Environment Variables](#environment-variables))
   - Use strong, randomly generated secrets

2. **Database Migration**

   ```bash
   NODE_ENV=production yarn db:push:prod
   ```

3. **Build Application**

   ```bash
   yarn build
   ```

4. **Start Production Server**

   ```bash
   yarn start
   ```

### Production Considerations

- **Database**: Use a managed PostgreSQL service (e.g., Vercel Postgres, Supabase, AWS RDS)
- **Email**: Ensure your Resend domain is verified and configured
- **OAuth**: Configure production redirect URIs in Google Cloud Console
- **CORS**: Update `TRUSTED_ORIGINS` in `src/lib/utils.ts` with your production domain
- **Secrets**: Use secure secret management (e.g., Vercel Environment Variables, AWS Secrets Manager)
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Consider using a distributed rate limiter (e.g., Redis) for multi-instance deployments

### Security Checklist

- [ ] All environment variables are set and secure
- [ ] `BETTER_AUTH_SECRET` is a strong, randomly generated value
- [ ] Database connection uses SSL in production
- [ ] CORS is configured with only trusted origins
- [ ] Email sender domain is verified in Resend
- [ ] Google OAuth redirect URIs are configured correctly
- [ ] HTTPS is enabled
- [ ] Rate limiting is configured appropriately
- [ ] Bot detection is enabled
- [ ] Session cookies are secure (HttpOnly, Secure, SameSite)

### Monitoring and Logging

- Monitor authentication success/failure rates
- Track rate limit violations
- Log bot detection events
- Monitor email delivery rates
- Set up alerts for database connection issues

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Resend Documentation](https://resend.com/docs)
- [WebAuthn/Passkeys Guide](https://webauthn.guide/)

---

**Need Help?** Check the troubleshooting section above or review the error logs for specific error messages.
