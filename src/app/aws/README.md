# AWS Infrastructure (CDK)

This directory contains AWS CDK infrastructure code for deploying authentication services.

## What Gets Deployed

### 1. **AWS Cognito User Pool**
- User authentication and management
- Email-based sign-in
- OAuth2/OIDC flows
- Hosted UI domain

### 2. **GitHub OAuth Integration**
- Custom OIDC provider for GitHub authentication
- API Gateway with 3 Lambda functions:
  - `GET /user` - Fetch GitHub user profile
  - `POST /token` - Exchange OAuth code for tokens
  - `GET /private` - Protected endpoint (Cognito authorized)

### 3. **Outputs**
After deployment, you'll get:
- Cognito User Pool ID
- Cognito Client ID
- Cognito Domain
- AWS Region
- API Gateway URL

## Deployment Commands

```bash
# Bootstrap CDK (first time only)
yarn cdk:bootstrap

# Preview changes
yarn cdk:synth

# Deploy infrastructure
yarn cdk:deploy

# Destroy infrastructure
yarn cdk:destroy
```

## Environment Variables

Required for GitHub OAuth:
```env
GITHUB_CLIENT_ID=your_github_oauth_app_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_secret
BETTER_AUTH_CALLBACK_URL=http://localhost:5173/api/auth/callback/cognito
COGNITO_DOMAIN_PREFIX=your-unique-prefix
```

## File Structure

```
src/app/aws/
├── index.ts           # Main Cognito stack definition
├── ghProvider/
│   └── index.ts       # GitHub OIDC provider setup
└── lambda/
    ├── user.ts        # GitHub user info endpoint
    ├── token.ts       # OAuth token exchange
    └── private.ts     # Protected test endpoint
```

## How It Works

1. User initiates GitHub login via Cognito Hosted UI
2. Cognito redirects to custom GitHub OIDC provider
3. API Gateway + Lambda handle GitHub OAuth flow
4. Tokens are returned to Cognito
5. User session is created in your app

