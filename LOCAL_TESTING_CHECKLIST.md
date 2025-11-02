# ✅ Local Testing Checklist

## What You Can Test RIGHT NOW (Minimum Setup)

### ✅ Core Features (No Additional Setup)
- ✅ **Email/Password Authentication** - Works without any OAuth setup
- ✅ **Magic Link Authentication** - Works out of the box
- ✅ **Session Management** - Default Better Auth sessions
- ✅ **2FA Support** - Available (just not enabled by default)

### ✅ Database (Has Defaults)
- ✅ **Local PostgreSQL** via Docker - Default connection string built-in:
  ```bash
  DATABASE_URL=postgresql://authly:authly_dev_password@localhost:5433/authly
  ```
- ✅ **No env var needed** - Falls back to Docker defaults

### ✅ Better Auth URLs (Has Defaults)
- ✅ **baseURL** - Defaults to `http://localhost:5173`
- ✅ **trustedOrigins** - Includes localhost by default

---

## What You CAN Test Now

### 🎯 Basic Authentication (No OAuth Needed)
1. **Email/Password Sign Up**
   - Visit: `http://localhost:5173/signup`
   - Creates account
   - ⚠️ **Email verification won't send** (needs AWS SES)
   - ✅ **Account still created** and you can test login

2. **Magic Link Login**
   - Visit: `http://localhost:5173/login`
   - Use magic link option
   - ⚠️ **Magic link won't send** (needs AWS SES)

3. **Session Testing**
   - Login/logout works
   - Protected routes work
   - Session persistence works

---

## What's OPTIONAL (Add If You Want)

### 🔐 OAuth Providers (Optional)
- **Google OAuth** - Need: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **GitHub OAuth** - Need: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- **Cognito** - Need: `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `COGNITO_CLIENT_SECRET`, `COGNITO_DOMAIN`

### 📧 Email Verification (Optional)
- **AWS SES** - Need: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SES_FROM`
- Without it: Accounts are created but verification emails won't send
- **You can still test** - Just won't get verification emails

---

## Quick Start (Minimum Test)

```bash
# 1. Start local database
yarn docker:up

# 2. Setup database schema
yarn db:push

# 3. Start dev server
yarn dev

# 4. Test:
# - http://localhost:5173/signup (Email signup)
# - http://localhost:5173/login (Login)
```

**That's it!** Everything else is optional.

---

## Full Test Setup (All Features)

### Required Environment Variables (.env)

```bash
# === REQUIRED FOR BASIC TESTING ===
# (Actually, even these are optional - has defaults!)

# Database (optional - has default)
DATABASE_URL=postgresql://authly:authly_dev_password@localhost:5433/authly

# Better Auth (optional - has defaults)
BETTER_AUTH_URL=http://localhost:5173
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:5173

# === OPTIONAL - FOR FULL FEATURES ===

# AWS SES (for email verification)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_SES_FROM=your-verified-email@example.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Cognito (optional)
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id
COGNITO_CLIENT_SECRET=your-client-secret
COGNITO_DOMAIN=authly-default
```

---

## ✅ Summary

**YES, you can test locally RIGHT NOW with:**
- ✅ Zero environment variables (all has defaults)
- ✅ Just Docker for database
- ✅ Basic email/password auth works
- ✅ Magic link works (just won't send emails)
- ✅ Sessions work
- ✅ Protected routes work

**What won't work without setup:**
- ❌ Email verification sending (needs AWS SES)
- ❌ Magic link sending (needs AWS SES)
- ❌ OAuth providers (needs OAuth credentials)

**But you can still test the core auth flow!** 🎉

