import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5173",
  // enable jwt plugin (keeps client aware of token/claims). The createAuthClient
  // implementation usually exposes methods to read/refresh tokens; see docs.
  plugins: [jwtClient()],
  // Optional: configure client-side refresh behavior if supported by better-auth
  // e.g. autoRefresh: true
})

export default authClient

