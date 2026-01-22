'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Chrome, Copy, Trash2, Key, Check, ExternalLink, Shield, Zap, Mail } from 'lucide-react'

interface ApiToken {
  id: string
  name: string
  lastUsed: string | null
  createdAt: string
}

export default function SettingsPage() {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [newToken, setNewToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchTokens()
  }, [])

  async function fetchTokens() {
    try {
      const res = await fetch('/api/tokens')
      const data = await res.json()
      setTokens(data.tokens || [])
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    }
  }

  async function createToken() {
    setLoading(true)
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Browser Extension' })
      })
      const data = await res.json()
      if (data.token) {
        setNewToken(data.token)
        fetchTokens()
      }
    } catch (error) {
      console.error('Failed to create token:', error)
    }
    setLoading(false)
  }

  async function deleteToken(tokenId: string) {
    if (!confirm('Are you sure you want to revoke this token?')) return

    try {
      await fetch('/api/tokens', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      })
      fetchTokens()
    } catch (error) {
      console.error('Failed to delete token:', error)
    }
  }

  async function copyToken() {
    if (newToken) {
      await navigator.clipboard.writeText(newToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Manage your account and browser extension
        </p>
      </div>

      {/* Browser Extension Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Chrome className="h-5 w-5" />
            Browser Extension
          </CardTitle>
          <CardDescription>
            Analyze client emails directly from Gmail or Outlook with one click
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">One-Click Analysis</p>
                <p className="text-xs text-gray-500 mt-1">
                  Analyze emails without leaving your inbox
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Quick Scope Check</p>
                <p className="text-xs text-gray-500 mt-1">
                  Works even without a project setup
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Smart Linking</p>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-links emails to your projects
                </p>
              </div>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Setup Instructions</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span>
                <div>
                  <p className="font-medium">Install the Extension</p>
                  <p className="text-gray-500">
                    Get ScopeShield AI from the{' '}
                    <a
                      href="https://chromewebstore.google.com/search/ScopeShield%20AI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      Chrome Web Store
                    </a>
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</span>
                <div>
                  <p className="font-medium">Generate API Token</p>
                  <p className="text-gray-500">
                    Create a token below to connect your account
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</span>
                <div>
                  <p className="font-medium">Connect the Extension</p>
                  <p className="text-gray-500">
                    Click the extension icon, paste your token, and you&apos;re ready to go
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* API Tokens Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Tokens
          </CardTitle>
          <CardDescription>
            Generate tokens to connect the browser extension to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Token Display */}
          {newToken && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">
                Token created! Copy it now - it won&apos;t be shown again.
              </p>
              <div className="flex gap-2">
                <Input
                  value={newToken}
                  readOnly
                  className="font-mono text-sm bg-white"
                />
                <Button onClick={copyToken} variant="outline" size="sm">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Create Token Button */}
          <Button onClick={createToken} disabled={loading}>
            <Key className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Generate New Token'}
          </Button>

          {/* Existing Tokens */}
          {tokens.length > 0 && (
            <div className="border rounded-lg divide-y">
              {tokens.map((token) => (
                <div key={token.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm">{token.name}</p>
                    <p className="text-xs text-gray-500">
                      Created {new Date(token.createdAt).toLocaleDateString()}
                      {token.lastUsed && (
                        <> · Last used {new Date(token.lastUsed).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteToken(token.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {tokens.length === 0 && !newToken && (
            <p className="text-sm text-gray-500 text-center py-4">
              No tokens yet. Generate one to connect the browser extension.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Project Email Linking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Auto-Linking
          </CardTitle>
          <CardDescription>
            Link client email addresses to projects for automatic context
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            When you add a client&apos;s email to a project, the extension will automatically use that project&apos;s scope when analyzing their emails.
          </p>
          <Button variant="outline" asChild>
            <a href="/dashboard">
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage Projects
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
