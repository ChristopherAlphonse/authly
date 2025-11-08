## Getting Started

First, run the development server:

```bash
yarn && yarn dev
```

Open [:5173](http://localhost:5173/) with your browser to see the result.
Open [Drizzle Studio](https://local.drizzle.studio/) to see Postgres data

## Sequence Diagram(s)

```mermaid
sequenceDiagram
    participant User
    participant Client as Client/UI
    participant Middleware as API Middleware
    participant Route as Auth Route
    participant BetterAuth as Better Auth
    participant DB as Database
    participant Resend as Resend Email


    note over User,Resend: Sign-Up with Email Verification (New Flow)
    User->>Client: Enter email & password
    Client->>Route: POST /api/auth/signup
    Middleware->>Middleware: Check rate limit & bot
    Middleware->>Route: Allow request
    Route->>BetterAuth: Sign up with email/password
    BetterAuth->>DB: Create user, generate token
    BetterAuth->>Resend: Send verification email
    Resend->>User: Verification link email
    Client->>Client: Show "Check your email"
    end

    note over User,Resend: Passkey Registration (New Flow)
    User->>Client: Click "Register Passkey"
    Client->>Route: GET /api/passkey/check-returning-user
    Middleware->>Middleware: Check IP rate limit
    Route->>DB: Query session & user
    Route->>Client: Return { hasPasskey, user }
    Client->>BetterAuth: Add passkey
    BetterAuth->>DB: Store passkey credentials
    Client->>Client: Redirect to home
    end

    note over User,Middleware: Rate Limit & Bot Detection (New Middleware)
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
    end
```

# Checklist

rename .env.example to .env and add values

to get a better auth secret : <https://www.better-auth.com/docs/installation#set-environment-variables>
BASE URL IS ALREADY configured
go to for google social : <https://console.cloud.google.com/auth/>
go here for resend api key : <https://resend.com/api-keys> must setup a domain first <https://resend.com/domains>
