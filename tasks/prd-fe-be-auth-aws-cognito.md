
# Product Requirements Document (PRD): FE+BE Auth with AWS Cognito, better-auth, SES, SSO, and Session Expiry

## 1. Introduction/Overview
This feature implements a robust authentication system for the Authly platform, leveraging AWS Cognito as the primary identity provider. The frontend uses the `better-auth` client to interact with the backend, which proxies all authentication and user management requests to Cognito. The system supports modern authentication methods (email/password, magic link, FIDO2/WebAuthn, SAML SSO), secure session management, and AWS SES for transactional emails. The goal is to provide a secure, scalable, and user-friendly authentication experience, with all user/session data managed by Cognito.

## 2. Goals
1. Use AWS Cognito as the single source of truth for user authentication, SSO, and session management.
2. Integrate `better-auth` as the frontend auth client, with the backend proxying all auth requests to Cognito.
3. Support multiple authentication methods: email/password, magic link, FIDO2/WebAuthn, and SAML SSO.
4. Use AWS SES (with React Email) for all transactional emails (verification, password reset, etc.).
5. Ensure session expiration and refresh are handled securely and transparently.
6. Maintain existing UI/UX styles and components.
7. Provide detailed flow diagrams for all major auth flows.
8. Deliver a working demo/POC covering login, logout, registration, profile management, and SSO.

## 3. User Stories
- As a new user, I want to sign up with email/password, magic link, or SSO so I can access the platform securely.
- As a returning user, I want to log in using my preferred method (password, magic link, FIDO2/WebAuthn, SSO).
- As a user, I want to receive verification and password reset emails reliably.
- As a user, I want my session to expire after a set period and be prompted to re-authenticate.
- As an admin, I want all authentication and user management to be handled by Cognito for compliance and security.

## 4. Functional Requirements
1. The frontend must use `better-auth` for all authentication flows.
2. The backend must proxy all authentication and user management requests to AWS Cognito.
3. The system must support:
   - Email/password login and registration
   - Magic link (passwordless) login
   - FIDO2/WebAuthn (biometric/hardware key) login
   - SAML 2.0 SSO via Cognito
4. The system must send verification and password reset emails using AWS SES and React Email.
5. The system must enforce session expiration (default: 3 days) and support session refresh.
6. The system must use existing UI components and styles for all auth-related screens.
7. The system must provide detailed error handling and user feedback for all auth flows.
8. The system must log out users and clear sessions on expiration or manual logout.
9. The system must support user profile management (view/update basic info).

## 5. Non-Goals (Out of Scope)
- Local database storage of user credentials (all user data is managed by Cognito).
- Custom UI design outside of existing codebase styles/components.
- Advanced analytics, localization, or compliance features (unless required by Cognito).
- Direct SMTP email sending (all email via AWS SES).

## 6. Design Considerations
- All UI must use the existing component library and styles (e.g., Card, Button, etc.).
- Flow diagrams (to be attached) will detail:
  - User registration/login (all methods)
  - SSO (SAML) flow
  - Session expiration/refresh
  - Email verification/password reset
- See [better-auth installation docs](https://www.better-auth.com/docs/installation) and [React Email AWS SES integration](https://react.email/docs/integrations/aws-ses) for implementation details.

## 7. Technical Considerations
- All authentication logic is handled by AWS Cognito; backend acts as a proxy.
- Use environment variables for all sensitive config (Cognito, SES, etc.).
- Use `@aws-sdk/client-ses` and `@react-email/render` for email delivery.
- Ensure session expiration is enforced both client- and server-side.
- Go backend must validate Cognito tokens for protected API routes.
- SAML and WebAuthn are configured in Cognito, not in local plugins.

## 8. Success Metrics
- 100% of authentication and user management requests are handled by Cognito.
- All supported auth methods (email/password, magic link, FIDO2/WebAuthn, SAML SSO) are available and tested.
- Transactional emails are reliably delivered via AWS SES.
- Sessions expire and refresh as expected; users are logged out on expiration.
- Demo/POC passes all acceptance criteria and user stories.

## 9. Open Questions
- Are there any compliance or audit requirements for logging auth events?
- Should MFA (multi-factor authentication) be enforced for all users or only some?
- Should the system support additional social providers via Cognito?
- What is the desired user experience for session expiration (e.g., silent refresh vs. forced re-login)?

---
_Last updated: 2025-10-29_
