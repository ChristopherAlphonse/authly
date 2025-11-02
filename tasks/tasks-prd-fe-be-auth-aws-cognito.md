## Relevant Files

- `app/src/lib/auth.ts` - Main auth configuration using better-auth with Cognito integration.
- `app/src/email/aws-ses/index.tsx` - Handles sending verification and transactional emails via AWS SES.
- `app/src/email/aws-ses/password-reset-email.tsx` - React Email template for password reset emails.
- `app/src/email/aws-ses/welcome-email.tsx` - React Email template for welcome/verification emails.
- `app/src/email/aws-ses/verification-email.tsx` - React Email template for email verification.
- `app/src/components/` - Directory for UI components (login, signup, password reset, etc.).
- `app/src/app/login/` - Login page.
- `app/src/app/signup/` - Signup page.
- `app/src/app/api/auth/[...all]/route.ts` - Better Auth API routes.
- `app/.env.local` - Environment variables for Cognito, SES, database, etc.

## Tasks

- [ ] 1.0 Integrate AWS Cognito with better-auth (`feature/cognito-better-auth`)
  - [ ] 1.1 Add Cognito config to `.env` and document required variables (`feature/cognito-env-vars`)
  - [ ] 1.2 Update `app/src/lib/auth.ts` to use Cognito as the provider (`feature/cognito-auth-config`)
  - [ ] 1.3 Add unit tests for Cognito integration in `auth.test.ts` (`feature/cognito-auth-tests`)

- [ ] 2.0 Implement all authentication flows (email/password, magic link, FIDO2/WebAuthn, SAML SSO) (`feature/auth-flows`)
  - [ ] 2.1 Implement email/password login and registration UI (`feature/email-password-ui`)
  - [ ] 2.2 Implement magic link login UI and backend logic (`feature/magic-link-ui`)
  - [ ] 2.3 Implement FIDO2/WebAuthn login UI and backend logic (`feature/webauthn-ui`)
  - [ ] 2.4 Implement SAML SSO login UI and backend logic (`feature/saml-sso-ui`)
  - [ ] 2.5 Add tests for all auth flows (`feature/auth-flows-tests`)

- [ ] 3.0 Implement transactional email delivery with AWS SES and React Email (`feature/ses-react-email`)
  - [ ] 3.1 Add AWS SES config to `.env` and document required variables (`feature/ses-env-vars`)
    - [ ] 3.1.1 Install `@aws-sdk/client-ses` and `@react-email/render` in the app (`feature/ses-email-deps`)
  - [ ] 3.2 Implement `send-verification-email.tsx` using SES and React Email (`feature/ses-send-verification`)
  - [ ] 3.3 Add and test `password-reset-email.tsx` and `welcome-email.tsx` templates (`feature/email-templates`)
  - [ ] 3.4 Add tests for email sending logic (`feature/email-tests`)

- [ ] 4.0 Build and style all required auth UI screens/components (`feature/auth-ui`)
  - [ ] 4.1 Build login, signup, password reset, and welcome screens using existing styles (`feature/auth-ui-screens`)
  - [ ] 4.2 Add form validation and error display (`feature-auth-ui-validation`)
  - [ ] 4.3 Add tests for UI components (`feature/auth-ui-tests`)

- [ ] 5.0 Implement Better Auth session management with Cognito (`feature/better-auth-sessions`)
  - [ ] 5.1 Configure Better Auth to handle Cognito OAuth flow (`feature/better-auth-cognito`)
  - [ ] 5.2 Implement JWT token validation in Better Auth (`feature/better-auth-jwt`)
  - [ ] 5.3 Add tests for Better Auth session management (`feature/better-auth-tests`)

- [ ] 6.0 Enforce session expiration and refresh logic (`feature/session-expiry`)
  - [ ] 6.1 Configure session expiration in Cognito and better-auth (`feature/session-expiry-config`)
  - [ ] 6.2 Implement session refresh logic in Better Auth (`feature/session-refresh`)
    - [ ] 6.2.1 Set access token lifetime to 30 minutes (server and provider)
    - [ ] 6.2.2 Set refresh token lifetime to 24 hours (server and provider)
    - [ ] 6.2.3 Implement client-side session timers + warning UI (`feature/session-warning-ui`)
    - [ ] 6.2.4 Implement idle timeout (2-5 minutes) with Better Auth (`feature/session-idle-timeout`)
  - [ ] 6.3 Add tests for session expiration and refresh (`feature/session-expiry-tests`)

- [ ] 7.0 Provide detailed error handling and user feedback (`feature/auth-error-handling`)
  - [ ] 7.1 Implement error messages for all auth flows in UI (`feature/auth-error-ui`)
  - [ ] 7.2 Add logging for auth errors in backend (`feature/auth-error-logging`)
  - [ ] 7.3 Add tests for error handling (`feature/auth-error-tests`)

- [ ] 8.0 Create detailed flow diagrams for all major auth flows (`feature/auth-flow-diagrams`)
  - [ ] 8.1 Diagram: User registration/login (all methods) (`feature/diagram-registration-login`)
  - [ ] 8.2 Diagram: SSO (SAML) flow (`feature/diagram-sso`)
  - [ ] 8.3 Diagram: Session expiration/refresh (`feature/diagram-session-expiry`)
  - [ ] 8.4 Diagram: Email verification/password reset (`feature/diagram-email-flows`)


