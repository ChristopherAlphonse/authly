# Session helpers

This folder contains helper utilities for session management used by the frontend.

Files:

- `session.ts` - lightweight timer utilities to schedule session expiration warnings and attempts to refresh tokens.

Integration notes:

- Provide a `tokenGetter` function that returns the current access token (JWT) to `scheduleSessionTimers`.
- Provide an `onRefresh` callback that uses your `authClient` to call the refresh endpoint and replace tokens.
- Call `scheduleSessionTimers` once the user is authenticated and again after a successful refresh to reschedule timers.

Security notes:

- Keep refresh calls server-backed when possible to avoid exposing long-lived secrets in the browser.
