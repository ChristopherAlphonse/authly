"use client"

import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

function parseHttpError(err: unknown): { status?: number; message?: string } {
  let status: number | undefined
  let message: string | undefined

  if (typeof err === "object" && err !== null) {
    const maybe = err as { [k: string]: unknown }

    const resp = maybe.response
    if (typeof resp === "object" && resp !== null) {
      const r = resp as { [k: string]: unknown }
      const s = r.status
      if (typeof s === "number") status = s

      const data = r.data
      if (typeof data === "object" && data !== null) {
        const d = data as { [k: string]: unknown }
        if (typeof d.message === "string") message = d.message
        else if (typeof d.error === "string") message = d.error
      }
    }

    if (status === undefined) {
      const s2 = maybe.status
      if (typeof s2 === "number") status = s2
    }

    if (status === undefined) {
      const s3 = maybe.statusCode
      if (typeof s3 === "number") status = s3
    }

    if (!message) {
      const m = maybe.message
      if (typeof m === "string") message = m
    }
  }

  return { status, message }
}

function uiMessageFromError(err: unknown): string {
  let rawMsg: string | undefined

  if (typeof err === "string") rawMsg = err
  else if (typeof err === "object" && err !== null) {
    const maybe = err as { [k: string]: unknown }
    if (typeof maybe.message === "string") rawMsg = maybe.message
    else {
      const resp = maybe.response
      if (typeof resp === "object" && resp !== null) {
        const r = resp as { [k: string]: unknown }
        const data = r.data
        if (typeof data === "object" && data !== null) {
          const d = data as { [k: string]: unknown }
          if (typeof d.message === "string") rawMsg = d.message
        }
      }
    }
  }

  if (typeof rawMsg === "string" && /network error|ECONNREFUSED|connect ECONNREFUSED|failed to fetch/i.test(rawMsg)) {
    return "Network error — couldn't reach the auth server. Check your connection and try again."
  }

  const { status, message } = parseHttpError(err)
  const msg = typeof message === "string" && message.trim().length ? message.trim() : undefined

  if (status === 403) return msg ?? "Access denied — your account may be blocked or require email verification. Check your email for a verification link."
  if (status === 401) return msg ?? "Incorrect email or password. Please try again."
  if (status === 404) return msg ?? "No account found for that email. Would you like to register?"
  if (status === 429) return msg ?? "Too many attempts — please wait a few minutes and try again."
  if (status && status >= 400 && status < 500) return msg ?? "Sign in failed. Check your input and try again."

  return msg ?? "Sign in failed due to a server or network issue."
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })


      let signInOk = false

      if (result === null || result === undefined) {
        signInOk = false
      } else if (typeof result === "boolean") {
        signInOk = result
      } else if (typeof result === "object") {
        const r = result as { [k: string]: unknown }
        if (typeof r.ok === "boolean") signInOk = r.ok
        else if (typeof r.success === "boolean") signInOk = r.success
        else if (typeof r.status === "number") signInOk = r.status >= 200 && r.status < 300
        else if (r.user || r.session) signInOk = true
      }

      if (!signInOk) {
        setError(uiMessageFromError(result as unknown))
        return
      }

      router.push("/")
    } catch (err: unknown) {
      setError(uiMessageFromError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "github",
      })
    } catch (err: unknown) {
      setError(uiMessageFromError(err))
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
      })
    } catch (err: unknown) {
      setError(uiMessageFromError(err))
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
            <CardDescription className="text-zinc-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-zinc-600 focus:ring-zinc-600"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-zinc-600 focus:ring-zinc-600"
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm text-center">{error}</div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-medium"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-2 text-zinc-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGitHubSignIn}
                  className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-zinc-400 text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-white hover:underline font-medium">
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
