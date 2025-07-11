"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { goApiClient } from "@/lib/go-api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function GoAPITest() {
  const { data: session } = authClient.useSession()
  const [apiResponse, setApiResponse] = useState<string>("")
  const [apiLoading, setApiLoading] = useState(false)

  const testGoAPI = async () => {
    setApiLoading(true)
    setApiResponse("")

    const response = await goApiClient.verifyAuth()

    if (response.error) {
      setApiResponse(`❌ Go API Error: ${response.error}`)
    } else {
      setApiResponse(`✅ Go API Success: ${JSON.stringify(response.data, null, 2)}`)
    }

    setApiLoading(false)
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Go API Auth</CardTitle>
        <CardDescription className="text-zinc-400">
          Test authentication against a Go API server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testGoAPI}
          disabled={!session || apiLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {apiLoading ? "Testing..." : "Test Go API"}
        </Button>

        {!session && (
          <p className="text-zinc-400 text-sm">
            Sign in to test the Go API
          </p>
        )}

        {apiResponse && (
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h3 className="font-semibold text-white mb-2">API Response</h3>
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap">
              {apiResponse}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
