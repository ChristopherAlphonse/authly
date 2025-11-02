# Deployment Checklist

Use this checklist to ensure everything is configured correctly for production deployment.

---

## Pre-Deployment

### 1. Code Ready
- [ ] All features working locally
- [ ] Tests passing
- [ ] Build succeeds: `yarn build`
- [ ] No linter errors
- [ ] Committed to Git
- [ ] Pushed to GitHub/GitLab/Bitbucket

### 2. Environment Variables Prepared
- [ ] Generated `BETTER_AUTH_SECRET` (use: `openssl rand -base64 32`)
- [ ] Have AWS credentials ready
- [ ] Have OAuth app credentials (GitHub, Google, etc.)
- [ ] Know which database provider you'll use

---

## Database Setup

Choose one and complete:

### Option A: Vercel Postgres
- [ ] Created database in Vercel dashboard
- [ ] Copied `POSTGRES_URL`
- [ ] Added to environment variables
- [ ] Ran migrations: `yarn db:push`

### Option B: Neon
- [ ] Created account at neon.tech
- [ ] Created project
- [ ] Copied connection string
- [ ] Added to environment variables
- [ ] Ran migrations: `yarn db:push`

### Option C: Supabase
- [ ] Created account at supabase.com
- [ ] Created project
- [ ] Copied pooler connection string
- [ ] Added to environment variables
- [ ] Ran migrations: `yarn db:push`

---

## Frontend Deployment (Vercel)

### 1. Vercel Setup
- [ ] Created Vercel account
- [ ] Connected Git repository
- [ ] Set root directory to `app`
- [ ] Framework preset: Next.js

### 2. Environment Variables
Copy from `.vercel-env-template.txt` and set in Vercel:

- [ ] `BETTER_AUTH_SECRET`
- [ ] `BETTER_AUTH_URL`
- [ ] `DATABASE_URL`
- [ ] `NODE_ENV=production`

**Optional (if using):**
- [ ] Cognito variables (after CDK deployment)
- [ ] GitHub OAuth variables
- [ ] Google OAuth variables
- [ ] AWS SES variables
- [ ] Go API URL (after backend deployment)

### 3. Deploy
- [ ] Clicked "Deploy"
- [ ] Build succeeded
- [ ] Site is live
- [ ] Recorded URL: `https://your-app.vercel.app`

---

## Backend Deployment (Railway)

### 1. Railway Setup
- [ ] Installed Railway CLI: `iwr https://railway.app/install.ps1 | iex`
- [ ] Logged in: `railway login`
- [ ] Initialized project: `cd api && railway init`

### 2. Configuration Files
- [ ] Created `api/railway.toml`
- [ ] Created `api/nixpacks.toml`

### 3. Environment Variables
Set in Railway dashboard:
- [ ] `PORT=8080`
- [ ] `ALLOWED_ORIGINS=https://your-app.vercel.app`

### 4. Deploy
- [ ] Ran: `railway up`
- [ ] Build succeeded
- [ ] API is responding
- [ ] Health check works: `curl https://your-api.up.railway.app/health`
- [ ] Recorded URL: `https://your-api.up.railway.app`

### 5. Update Frontend
- [ ] Added `GO_API_URL` to Vercel environment variables
- [ ] Added `NEXT_PUBLIC_GO_API_URL` to Vercel
- [ ] Redeployed frontend

---

## AWS Cognito Deployment

### 1. Configure CDK
Updated `packages/cognito/.env`:
- [ ] `GITHUB_CLIENT_ID`
- [ ] `GITHUB_CLIENT_SECRET`
- [ ] `COGNITO_DOMAIN_PREFIX` (unique name)
- [ ] `FRONT_END_URL` (Vercel URL)
- [ ] `BETTER_AUTH_CALLBACK_URL` (Vercel URL + /api/auth/callback/cognito)

### 2. Deploy
- [ ] Ran: `yarn cognito:bootstrap` (first time only)
- [ ] Ran: `yarn cognito:synth` (test)
- [ ] Ran: `yarn cognito:deploy`
- [ ] Recorded outputs:
  - [ ] `CognitoUserPoolId`
  - [ ] `CognitoUserPoolClientId`
  - [ ] `CognitoDomain`
  - [ ] `Region`

### 3. Get Client Secret
- [ ] Went to AWS Console → Cognito → User Pools
- [ ] Selected user pool
- [ ] App integration → App client
- [ ] Clicked "Show secret"
- [ ] Copied `COGNITO_CLIENT_SECRET`

### 4. Update Frontend
- [ ] Added Cognito variables to Vercel
- [ ] Redeployed frontend

---

## OAuth Configuration

### GitHub OAuth
- [ ] Created OAuth App at https://github.com/settings/developers
- [ ] Set Homepage URL: `https://your-app.vercel.app`
- [ ] Set Callback URL: `https://your-app.vercel.app/api/auth/callback/github`
- [ ] Copied Client ID and Secret
- [ ] Added to Vercel environment variables
- [ ] Updated `packages/cognito/.env` with GitHub credentials
- [ ] Redeployed Cognito stack: `yarn cognito:deploy`

### Google OAuth (if using)
- [ ] Created OAuth 2.0 Client in Google Cloud Console
- [ ] Added redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
- [ ] Copied Client ID and Secret
- [ ] Added to Vercel environment variables

### AWS Cognito Callbacks
- [ ] Went to AWS Console → Cognito → App integration
- [ ] Added callback URL: `https://your-app.vercel.app/api/auth/callback/cognito`
- [ ] Added sign-out URL: `https://your-app.vercel.app`
- [ ] Saved changes

---

## Testing

### Basic Functionality
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Backend health check: `https://your-api.up.railway.app/health`
- [ ] Database connection working

### Authentication Flow
- [ ] Can sign up with email
- [ ] Email verification works (if configured)
- [ ] Can log in with email/password
- [ ] Can log in with Cognito
- [ ] Can log in with GitHub (if configured)
- [ ] Can log in with Google (if configured)
- [ ] Can log out
- [ ] Session persists on refresh
- [ ] Protected routes work

### Integration
- [ ] Frontend can call Go API
- [ ] JWT verification works
- [ ] CORS configured correctly
- [ ] No console errors

---

## Post-Deployment

### Custom Domain (Optional)
- [ ] Added custom domain in Vercel
- [ ] Updated DNS records
- [ ] SSL certificate generated
- [ ] Updated all OAuth callback URLs to use custom domain
- [ ] Updated environment variables

### Monitoring
- [ ] Set up Vercel monitoring
- [ ] Set up Railway monitoring
- [ ] Configured AWS CloudWatch alerts
- [ ] Set up error tracking (Sentry, etc.)

### Performance
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] No performance warnings

### Security
- [ ] Environment variables secured
- [ ] HTTPS everywhere
- [ ] CORS properly configured
- [ ] Rate limiting configured (if needed)
- [ ] Security headers configured

---

## Documentation

- [ ] Updated README with production URLs
- [ ] Documented environment variables
- [ ] Created runbook for common issues
- [ ] Documented rollback procedure
- [ ] Team has access to all platforms

---

## Rollback Plan

If something goes wrong:

### Vercel
- [ ] Know how to roll back: Dashboard → Deployments → Previous → Promote to Production

### Railway
- [ ] Know how to roll back: Dashboard → Deployments → Previous → Redeploy

### AWS Cognito
- [ ] Know how to destroy stack: `yarn cognito:destroy`
- [ ] Have backup of configuration

---

## Success Criteria

Your deployment is successful when:

- ✅ All checkboxes above are checked
- ✅ Users can sign up and log in
- ✅ All OAuth providers work
- ✅ No errors in production logs
- ✅ Performance metrics are good
- ✅ Team can access and monitor

---

## URLs to Keep

Record these for future reference:

```
Frontend: https://your-app.vercel.app
Backend: https://your-api.up.railway.app
Database: <your-database-url>
AWS Cognito: https://console.aws.amazon.com/cognito/
Vercel Dashboard: https://vercel.com/dashboard
Railway Dashboard: https://railway.app/dashboard
```

---

## Need Help?

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 📖 [Vercel Docs](https://vercel.com/docs)
- 📖 [Railway Docs](https://docs.railway.app/)
- 📖 [AWS Cognito Docs](https://docs.aws.amazon.com/cognito/)

---

**Congratulations on deploying to production! 🎉**

