// Lightweight session utilities to help the frontend schedule warnings and refreshes
// Assumptions:
// - The app's auth client provides access to the raw access token (JWT) via a callback you supply.
// - This module does not assume storage details (cookie, localStorage). Instead you provide a getter.
// Usage example:
// import { scheduleSessionTimers, clearSessionTimers } from '@/lib/session'
// const cancel = scheduleSessionTimers(() => getAccessTokenFromAuthClient(), { warnSeconds: 60 }, {
//   onWarn: (msLeft) => showWarnUI(msLeft),
//   onExpire: () => redirectToLogin(),
//   onRefresh: async () => { await authClient.refresh() }
// })

type Callbacks = {
  onWarn?: (msLeft: number) => void
  onExpire?: () => void
  onRefresh?: () => Promise<void> | void
}

type Options = {
  // how many seconds before token expiration to call onWarn (default: 60)
  warnSeconds?: number
}

let _warnTimer: ReturnType<typeof setTimeout> | null = null
let _expireTimer: ReturnType<typeof setTimeout> | null = null

function parseJwt(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

// Schedules a warning and expiration callbacks based on the access token's `exp` claim.
// tokenGetter: () => string | null - should return the current access token (JWT) or null
// options.warnSeconds - seconds before expiry to call onWarn
// returns a cancel function
export function scheduleSessionTimers(
  tokenGetter: () => string | null,
  options: Options,
  callbacks: Callbacks
) {
  clearSessionTimers()

  const token = tokenGetter()
  if (!token) return () => {}

  const payload = parseJwt(token)
  if (!payload || !payload.exp) return () => {}

  const expMs = payload.exp * 1000
  const now = Date.now()
  const msLeft = expMs - now

  const warnMs = (options.warnSeconds ?? 60) * 1000
  const warnAt = Math.max(0, msLeft - warnMs)
  const expireAt = Math.max(0, msLeft)

  if (warnAt <= 0) {
    // If already within warn window, call onWarn immediately
    callbacks.onWarn?.(msLeft)
  } else {
    _warnTimer = setTimeout(() => {
      callbacks.onWarn?.(expMs - Date.now())
    }, warnAt)
  }

  _expireTimer = setTimeout(async () => {
    // When expired, try to refresh if onRefresh was provided, otherwise call onExpire
    if (callbacks.onRefresh) {
      try {
        await callbacks.onRefresh()
        // After refresh, reschedule timers based on new token
        scheduleSessionTimers(tokenGetter, options, callbacks)
        return
      } catch {
        // fallthrough to expire
      }
    }
    callbacks.onExpire?.()
  }, expireAt)

  return () => clearSessionTimers()
}

export function clearSessionTimers() {
  if (_warnTimer) {
    clearTimeout(_warnTimer)
    _warnTimer = null
  }
  if (_expireTimer) {
    clearTimeout(_expireTimer)
    _expireTimer = null
  }
}

export function msUntilExpirationFromToken(token: string | null) {
  if (!token) return 0
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return 0
  return Math.max(0, payload.exp * 1000 - Date.now())
}
