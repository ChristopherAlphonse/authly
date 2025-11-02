# Deployment Guide

## Overview

This guide covers deploying Authly to production. The recommended approach is a **hybrid deployment**:
- **Frontend (Next.js)**: Vercel
- **Backend (Go API)**: Railway, Fly.io, or Render
- **Database**: Vercel Postgres, Neon, or Supabase
- **Infrastructure**: AWS (Cognito via CDK)

---

## Table of Contents

1. [Deploy Frontend to Vercel](#1-deploy-frontend-to-vercel)
2. [Deploy Backend to Railway](#2-deploy-backend-to-railway)
3. [Set Up Database](#3-set-up-database)
4. [Deploy AWS Cognito](#4-deploy-aws-cognito)
5. [Configure Environment Variables](#5-configure-environment-variables)
6. [Update OAuth Callbacks](#6-update-oauth-callbacks)
7. [Alternative Platforms](#7-alternative-platforms)

---

## 1. Deploy Frontend to Vercel

### Prerequisites
- [Vercel Account](https://vercel.com/signup) (free)
- GitHub/GitLab/Bitbucket repository

### Steps

#### A. Connect Repository

1. **Push your code to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git provider and repository

3. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `app`
   - **Build Command**: `yarn build`
   - **Output Directory**: `.next`
   - **Install Command**: `yarn install`

#### B. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# Better Auth
BETTER_AUTH_SECRET=your-32-character-secret-key-here
BETTER_AUTH_URL=https://your-app.vercel.app

# AWS Cognito
COGNITO_CLIENT_ID=your_cognito_client_id
COGNITO_CLIENT_SECRET=your_cognito_client_secret
COGNITO_DOMAIN=your-domain.auth.region.amazoncognito.com
COGNITO_USER_POOL_ID=your_user_pool_id
AWS_REGION=us-east-1

# Database (after setting up database)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# GitHub OAuth (if using)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AWS SES (if using email)
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret

# Node Environment
NODE_ENV=production
```

**Generate BETTER_AUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### C. Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at `https://your-app.vercel.app`

---

## 2. Deploy Backend to Railway

### Why Railway?
- ✅ Supports traditional Go servers
- ✅ Free tier: $5/month credit
- ✅ Automatic HTTPS
- ✅ Easy deployment

### Steps

#### A. Install Railway CLI

**Windows:**
```powershell
iwr https://railway.app/install.ps1 | iex
```

**Mac/Linux:**
```bash
curl -fsSL https://railway.app/install.sh | sh
```

#### B. Login and Initialize

```bash
railway login
cd api
railway init
```

#### C. Create `railway.toml` Configuration

Create `api/railway.toml`:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "./bin/authly-api"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 10

[[services]]
name = "authly-api"
```

#### D. Create `nixpacks.toml` for Build

Create `api/nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["go_1_21"]

[phases.build]
cmds = ["go build -o bin/authly-api ."]

[start]
cmd = "./bin/authly-api"
```

#### E. Set Environment Variables

```bash
# In Railway Dashboard or CLI:
railway variables set PORT=8080
railway variables set ALLOWED_ORIGINS=https://your-app.vercel.app
```

#### F. Deploy

```bash
railway up
```

Your API will be live at `https://your-api.up.railway.app`

#### G. Update Frontend API URL

In Vercel, add environment variable:
```bash
GO_API_URL=https://your-api.up.railway.app
```

---

## 3. Set Up Database

### Option A: Vercel Postgres (Recommended)

1. **In Vercel Dashboard:**
   - Go to Storage tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose region closest to your users

2. **Connect to Project:**
   - Select your Next.js project
   - Copy `POSTGRES_URL` connection string

3. **Add to Environment Variables:**
   ```bash
   DATABASE_URL=your_postgres_url_from_vercel
   ```

4. **Run Migrations:**
   ```bash
   cd app
   yarn db:push
   ```

### Option B: Neon (Serverless Postgres)

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to Vercel environment variables as `DATABASE_URL`

### Option C: Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string (use pooler for serverless)
5. Add to Vercel as `DATABASE_URL`

---

## 4. Deploy AWS Cognito

### Prerequisites
- AWS Account
- AWS CLI configured

### Steps

1. **Configure CDK Environment**
   
   In `packages/cognito/.env`:
   ```bash
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   COGNITO_DOMAIN_PREFIX=authly-prod-unique-name
   FRONT_END_URL=https://your-app.vercel.app
   BETTER_AUTH_CALLBACK_URL=https://your-app.vercel.app/api/auth/callback/cognito
   ```

2. **Bootstrap CDK** (first time only)
   ```bash
   yarn cognito:bootstrap
   ```

3. **Deploy Stack**
   ```bash
   yarn cognito:deploy
   ```

4. **Save Outputs**
   
   CDK will output:
   - `CognitoUserPoolId`
   - `CognitoUserPoolClientId`
   - `CognitoDomain`
   - `Region`
   
   Add these to Vercel environment variables!

---

## 5. Configure Environment Variables

### Complete Vercel Environment Variables

```bash
# Better Auth Core
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://your-app.vercel.app

# AWS Cognito (from CDK outputs)
COGNITO_CLIENT_ID=<from CDK output>
COGNITO_CLIENT_SECRET=<from AWS Console>
COGNITO_DOMAIN=<from CDK output>
COGNITO_USER_POOL_ID=<from CDK output>
AWS_REGION=<from CDK output>

# Database
DATABASE_URL=<from Vercel Postgres/Neon/Supabase>

# Backend API
GO_API_URL=https://your-api.up.railway.app
NEXT_PUBLIC_GO_API_URL=https://your-api.up.railway.app

# OAuth Providers (if using)
GITHUB_CLIENT_ID=<from GitHub>
GITHUB_CLIENT_SECRET=<from GitHub>
GOOGLE_CLIENT_ID=<from Google Cloud>
GOOGLE_CLIENT_SECRET=<from Google Cloud>

# AWS SES (if using email)
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your AWS key>
AWS_SECRET_ACCESS_KEY=<your AWS secret>

# Environment
NODE_ENV=production
```

### Railway Environment Variables (Go API)

```bash
PORT=8080
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## 6. Update OAuth Callbacks

### AWS Cognito

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Select your User Pool
3. App integration → App client
4. Update **Allowed callback URLs**:
   ```
   https://your-app.vercel.app/api/auth/callback/cognito
   ```
5. Update **Allowed sign-out URLs**:
   ```
   https://your-app.vercel.app
   ```

### GitHub OAuth

1. Go to https://github.com/settings/developers
2. Select your OAuth App
3. Update **Authorization callback URL**:
   ```
   https://your-app.vercel.app/api/auth/callback/github
   ```
4. Update **Homepage URL**:
   ```
   https://your-app.vercel.app
   ```

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Select your OAuth 2.0 Client
4. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```

---

## 7. Alternative Platforms

### Deploy Everything to Railway

**Pros:** Single platform, simpler management
**Cons:** Not as optimized for Next.js as Vercel

```bash
# Deploy both services
railway init
railway up
```

### Deploy to Fly.io

**Pros:** Great performance, edge deployment
**Cons:** More configuration required

See [Fly.io documentation](https://fly.io/docs/) for setup.

### Deploy to Render

**Pros:** Free tier, easy setup
**Cons:** Cold starts on free tier

See [Render documentation](https://render.com/docs) for setup.

---

## 8. Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend API deployed and responding
- [ ] Database connected and migrations run
- [ ] AWS Cognito deployed via CDK
- [ ] All environment variables set
- [ ] OAuth callback URLs updated
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS working
- [ ] CORS configured correctly
- [ ] Health checks passing
- [ ] Monitoring/logging set up

---

## 9. Testing Production

### Test Authentication Flow

1. Visit your production URL
2. Try signing up with email
3. Verify email works (if configured)
4. Try Cognito OAuth login
5. Try GitHub OAuth login (if configured)
6. Test protected routes
7. Verify Go API integration

### Test with curl

```bash
# Health check
curl https://your-api.up.railway.app/health

# Auth verification (need valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-api.up.railway.app/api/auth/verify
```

---

## 10. Troubleshooting

### Build Fails on Vercel

- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Ensure `DATABASE_URL` is set
- Check Node version compatibility

### OAuth Redirect Issues

- Verify callback URLs match exactly (no trailing slashes)
- Check environment variables are set
- Ensure HTTPS is used (not HTTP)
- Clear browser cache

### Database Connection Fails

- Check connection string format
- Verify database is accessible from Vercel
- Use connection pooling for serverless
- Check firewall/security group settings

### CORS Errors

- Update `ALLOWED_ORIGINS` in Go API
- Check Railway environment variables
- Verify origin header in requests

---

## 11. Continuous Deployment

### Automatic Deployments

**Vercel:**
- Automatically deploys on push to main branch
- Preview deployments for PRs
- No configuration needed

**Railway:**
- Automatically deploys on push
- Can configure branch deployments
- Set up in Railway dashboard

### Manual Deployment

```bash
# Redeploy frontend
vercel --prod

# Redeploy backend
railway up
```

---

## 12. Monitoring & Logs

### Vercel Logs

View in Vercel Dashboard → Deployments → View Logs

### Railway Logs

```bash
railway logs
```

Or view in Railway Dashboard

### AWS CloudWatch (for Cognito/CDK)

Monitor in AWS Console → CloudWatch

---

## Cost Estimates

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel | Hobby (free) | Pro $20/mo |
| Railway | $5 credit/mo | $5+/mo usage-based |
| Vercel Postgres | Free tier available | $0.10/10k rows |
| AWS Cognito | 50k MAU free | $0.0055/MAU after |
| AWS CDK | Free (pay for resources) | - |

**Estimated Monthly Cost (small app):** $0-10

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Better Auth Documentation](https://www.better-auth.com/docs)

