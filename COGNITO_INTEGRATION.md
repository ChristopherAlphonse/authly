# AWS Cognito Integration with Better-Auth

## Overview

This project uses AWS Cognito as the primary authentication and authorization provider, with better-auth serving as a client-side wrapper. All authentication flows are handled by AWS Cognito.

## Changes Implemented

### 1. Fixed Lambda Entry Paths (`packages/cognito/src/ghProvider/index.ts`)
- Corrected Lambda function entry paths from `./api/` to `../lambda/`
- Affects: `user.ts`, `token.ts`, and `private.ts` Lambda handlers
- These Lambda functions power the GitHub OIDC provider integration with Cognito

### 2. Better-Auth Configuration (`app/src/lib/auth.ts`)
- Removed duplicate GitHub provider configuration (GitHub now flows through Cognito OIDC)
- Reconfigured Cognito as a social provider under `socialProviders.cognito`
- Required properties:
  - `clientId`: Cognito App Client ID
  - `clientSecret`: Cognito App Client Secret
  - `domain`: Cognito Hosted UI domain
  - `region`: AWS region
  - `userPoolId`: Cognito User Pool ID

### 3. CDK Stack Updates (`packages/cognito/src/index.ts`)
- Enabled `generateSecret: true` for the User Pool Client (required for OAuth flows)
- Added OAuth configuration with:
  - Authorization code grant flow
  - OpenID, email, and profile scopes
  - Callback URL for better-auth
- Exported Cognito domain as a CloudFormation output (`AuthlyCognitoDomain`)

## Required Environment Variables

### For the Next.js App (`app/.env`)

```env
# Cognito Configuration (exported from CDK stack)
COGNITO_USER_POOL_ID=<from CDK output: AuthlyUserPoolId>
COGNITO_CLIENT_ID=<from CDK output: AuthlyUserPoolClientId>
COGNITO_CLIENT_SECRET=<retrieve from AWS Console or Secrets Manager>
COGNITO_DOMAIN=<from CDK output: AuthlyCognitoDomain>
AWS_REGION=<from CDK output: AuthlyCognitoRegion>

# Alternative public naming convention (optional)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
NEXT_PUBLIC_COGNITO_CLIENT_SECRET=
NEXT_PUBLIC_COGNITO_DOMAIN=
NEXT_PUBLIC_AWS_REGION=

# Google OAuth (if using)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Better-Auth Configuration
BETTER_AUTH_URL=http://localhost:5173
BETTER_AUTH_CALLBACK_URL=http://localhost:5173/api/auth/callback/cognito
```

### For the CDK Stack (`packages/cognito/.env`)

```env
# GitHub OAuth Credentials
GITHUB_CLIENT_ID=<your GitHub OAuth app client ID>
GITHUB_CLIENT_SECRET=<your GitHub OAuth app client secret>

# Cognito Domain Prefix (optional, defaults to "authly-default")
COGNITO_DOMAIN_PREFIX=authly-default

# Better-Auth Callback URL
BETTER_AUTH_CALLBACK_URL=http://localhost:5173/api/auth/callback/cognito
```

## Authentication Flows

### GitHub OAuth via Cognito OIDC
1. User initiates sign-in through Cognito
2. Cognito redirects to custom API Gateway endpoints (powered by Lambda functions)
3. Lambda functions interact with GitHub OAuth APIs
4. User info is mapped to Cognito user attributes
5. Session tokens are issued by Cognito
6. Better-auth manages the session on the client side

### Email/Password + Email Verification
1. User signs up with email/password
2. Better-auth calls Cognito SignUp API
3. Verification email is sent via AWS SES
4. User clicks verification link
5. Better-auth confirms user with Cognito
6. Auto sign-in after verification (if enabled)

### Magic Link
1. Better-auth generates magic link
2. Link is sent via AWS SES
3. User clicks link
4. Better-auth validates and creates session with Cognito tokens

### Google OAuth
1. User initiates Google sign-in
2. OAuth flow redirects through Cognito
3. Google user info is mapped to Cognito attributes
4. Session tokens issued by Cognito

## Session Management

All session management is handled by AWS Cognito with the following configuration:
- Access token expiry: Defined in `SESSION_TIMEOUT.ACCESSTOKENEXPIRESIN`
- Refresh token expiry: Defined in `SESSION_TIMEOUT.REFRESHTOKENEXPIRESIN`
- Idle timeout: Defined in `SESSION_TIMEOUT.IDLETIMEOUT`
- Idle timeout warning: Defined in `SESSION_TIMEOUT.IDLETIMEOUTWARN`

Better-auth automatically handles token refresh with Cognito when access tokens expire.

## CDK Stack Deployment

After setting up the environment variables, deploy the CDK stack:

```bash
cd packages/cognito
cdk deploy
```

This will output the required values for:
- `AuthlyUserPoolId`
- `AuthlyUserPoolClientId`
- `AuthlyCognitoRegion`
- `AuthlyCognitoDomain`

**Note**: The client secret is not automatically output for security reasons. Retrieve it from the AWS Console:
1. Go to Amazon Cognito → User Pools
2. Select your user pool
3. Navigate to "App integration" → "App clients"
4. Click on your app client
5. Click "Show client secret"

## Testing

1. Ensure all environment variables are set
2. Deploy the CDK stack
3. Start the Next.js development server: `cd app && yarn dev`
4. Test authentication flows:
   - Email/password signup and verification
   - GitHub OAuth (via Cognito OIDC)
   - Google OAuth
   - Magic link

## Architecture Notes

- AWS Cognito handles all authentication and authorization
- Better-auth serves as a thin client wrapper for session management
- GitHub authentication uses a custom OIDC provider with API Gateway + Lambda
- All tokens are issued and validated by AWS Cognito
- User data is stored in both Cognito (primary) and PostgreSQL (via Drizzle adapter for session metadata)





