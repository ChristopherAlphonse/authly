# Authly - Modern Authentication with Better Auth

A modern, full-stack authentication solution built with Next.js, Better Auth, and AWS Cognito.

## Overview

This implementation showcases a modern authentication flow with:

- **Frontend**: Next.js 15 with Better Auth
- **Authentication**: Multiple providers (Email, Cognito, GitHub, Google)
- **Database**: PostgreSQL with Drizzle ORM
- **Infrastructure**: AWS Cognito via CDK for OAuth
- **Deployment**: Optimized for Vercel

## Features

- ✅ Email/Password Authentication
- ✅ Magic Link Authentication
- ✅ AWS Cognito OAuth Integration
- ✅ GitHub OAuth (via Cognito)
- ✅ Google OAuth
- ✅ Email Verification (AWS SES)
- ✅ JWT Session Management
- ✅ Two-Factor Authentication
- ✅ API Key Support
- ✅ Protected Routes
- ✅ Session Management

## Project Structure

```
authly/
├── app/                    # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Auth configuration
│   │   ├── db/            # Database schema & migrations
│   │   └── email/         # Email templates (AWS SES)
│   └── package.json
├── packages/
│   └── cognito/           # AWS CDK infrastructure
└── package.json
```

## Getting Started

> **New to the project? Start here:** [Quick Start Guide](QUICK_START.md)

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [Docker](https://www.docker.com/) and Docker Compose
- [AWS Account](https://aws.amazon.com/) (for Cognito/SES - optional)
- [ngrok](https://ngrok.com/) (for OAuth development - optional)

### Quick Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd authly
   yarn install
   cd app && yarn install && cd ..
   ```

2. **Set up PostgreSQL with Docker**
   ```bash
   yarn docker:up
   ```

   This starts PostgreSQL on `localhost:5433` with:
   - Database: `authly`
   - User: `authly`
   - Password: `authly_dev_password`

3. **Configure environment variables**

   Create `app/.env.local`:
   ```bash
   # Required
   DATABASE_URL=postgresql://authly:authly_dev_password@localhost:5433/authly
   BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
   BETTER_AUTH_URL=http://localhost:5173

   # Optional: AWS Cognito (if using)
   COGNITO_CLIENT_ID=your_cognito_client_id
   COGNITO_CLIENT_SECRET=your_cognito_client_secret
   COGNITO_DOMAIN=your-domain-prefix.auth.region.amazoncognito.com
   COGNITO_USER_POOL_ID=your_user_pool_id
   AWS_REGION=us-east-1

   # Optional: Email (if using AWS SES)
   AWS_SES_FROM=noreply@yourdomain.com
   AWS_SES_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   ```

4. **Initialize the database**
   ```bash
   yarn db:setup
   ```

5. **Run the application**
   ```bash
   yarn dev
   ```

   The app will be available at `http://localhost:5173`

## Development Scripts

- `yarn dev` - Run Next.js development server
- `yarn build` - Build for production
- `yarn start` - Start production server

### Database Management

- `yarn db:setup` - Start Docker PostgreSQL and push schema
- `yarn db:studio` - Open Drizzle Studio (database GUI)
- `yarn docker:up` - Start PostgreSQL in Docker
- `yarn docker:down` - Stop PostgreSQL container
- `yarn docker:logs` - View PostgreSQL logs

### AWS Cognito Infrastructure

Deploy authentication infrastructure with AWS CDK:

```bash
# Install dependencies
yarn cognito:install

# Bootstrap CDK (first time only)
yarn cognito:bootstrap

# Deploy Cognito stack
yarn cognito:deploy

# Destroy stack (when done)
yarn cognito:destroy
```

See [COGNITO_INTEGRATION.md](./COGNITO_INTEGRATION.md) for detailed setup.

### OAuth Development with ngrok

OAuth providers require public URLs. Use ngrok to tunnel localhost during development.

**Note:** The ngrok guides have been removed. For OAuth setup:

1. Install ngrok: https://ngrok.com/download
2. Start ngrok: `ngrok http 5173`
3. Copy the ngrok URL
4. Update OAuth callback URLs in:
   - AWS Cognito Console
   - GitHub OAuth App settings
   - Google Cloud Console
5. Update environment variables with ngrok URL
6. Restart dev server

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Set root directory: `app`
   - Framework: Next.js

3. **Add Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables:
   ```bash
   BETTER_AUTH_SECRET=<generated-secret>
   BETTER_AUTH_URL=https://your-app.vercel.app
   DATABASE_URL=<your-database-url>
   ```

   Optional (if using):
   - Cognito variables
   - OAuth provider credentials
   - AWS SES credentials

4. **Set Up Database**
   
   Choose one:
   - **Vercel Postgres**: Storage → Create Database → Postgres
   - **Neon**: https://neon.tech
   - **Supabase**: https://supabase.com

5. **Deploy Cognito** (if using)
   ```bash
   # Configure packages/cognito/.env with production URLs
   yarn cognito:deploy
   ```

6. **Update OAuth Callbacks**
   - AWS Cognito: Add `https://your-app.vercel.app/api/auth/callback/cognito`
   - GitHub: Add `https://your-app.vercel.app/api/auth/callback/github`
   - Google: Add `https://your-app.vercel.app/api/auth/callback/google`

### Deployment Configuration

The project includes Vercel configuration files:
- `vercel.json` - Root configuration
- `app/vercel.json` - Next.js app configuration

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Authentication**: Better Auth
- **UI**: Tailwind CSS, shadcn/ui
- **Email**: React Email, AWS SES

### Backend
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Session**: JWT tokens
- **OAuth**: AWS Cognito, GitHub, Google

### Infrastructure
- **Hosting**: Vercel
- **Database**: Vercel Postgres / Neon / Supabase
- **Auth Infrastructure**: AWS Cognito (via CDK)
- **Email**: AWS SES

## Documentation

- [COGNITO_INTEGRATION.md](./COGNITO_INTEGRATION.md) - AWS Cognito setup guide
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [app/README.md](./app/README.md) - Frontend documentation

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret key for JWT signing (generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL` - Your application URL

### Optional - AWS Cognito
- `COGNITO_CLIENT_ID` - From AWS Cognito
- `COGNITO_CLIENT_SECRET` - From AWS Cognito
- `COGNITO_DOMAIN` - Your Cognito domain
- `COGNITO_USER_POOL_ID` - From AWS Cognito
- `AWS_REGION` - AWS region

### Optional - OAuth Providers
- `GITHUB_CLIENT_ID` - From GitHub OAuth App
- `GITHUB_CLIENT_SECRET` - From GitHub OAuth App
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

### Optional - Email (AWS SES)
- `AWS_SES_FROM` - Sender email address
- `AWS_SES_REGION` - AWS SES region
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials

## License

MIT

## Credits

Continuation of [dreamsofcode-io/authly](https://github.com/dreamsofcode-io/authly)
