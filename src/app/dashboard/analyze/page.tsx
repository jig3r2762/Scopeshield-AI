'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Send,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Copy,
  Loader2,
  Zap,
  ArrowRight,
  FolderOpen,
} from 'lucide-react'

interface ReplyOption {
  type: 'POLITE_BOUNDARY' | 'PAID_ADDON' | 'NEGOTIATION_FRIENDLY'
  content: string
}

interface AnalysisResult {
  riskLevel: 'LIKELY_IN_SCOPE' | 'POSSIBLY_SCOPE_CREEP' | 'HIGH_RISK_SCOPE_CREEP'
  confidenceScore: number
  reasoning: string
  replies: ReplyOption[]
}

const riskConfig = {
  LIKELY_IN_SCOPE: {
    label: 'Within Scope',
    variant: 'success' as const,
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  POSSIBLY_SCOPE_CREEP: {
    label: 'Potential Scope Creep',
    variant: 'warning' as const,
    icon: AlertCircle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  HIGH_RISK_SCOPE_CREEP: {
    label: 'Likely Outside Scope',
    variant: 'danger' as const,
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
}

const replyTypeLabels = {
  POLITE_BOUNDARY: 'Polite Boundary',
  PAID_ADDON: 'Paid Add-on',
  NEGOTIATION_FRIENDLY: 'Flexible Option',
}

export default function QuickAnalyzePage() {
  const [message, setMessage] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!message.trim()) return

    setAnalyzing(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/analyze/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to analyze message')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const risk = result ? riskConfig[result.riskLevel] : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-5 w-5 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Quick Analyze</h1>
        </div>
        <p className="text-gray-500 text-sm md:text-base">
          Paste any client message to instantly check for scope creep — no project needed.
        </p>
      </div>

      {/* Input Card */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <Textarea
            placeholder="Paste a client message here... e.g. 'Can you also add a blog section? It shouldn't take long.'"
            className="min-h-[140px] text-sm resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={analyzing}
          />
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || !message.trim()}
            className="w-full sm:w-auto"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Analyze Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && risk && (
        <div className="space-y-4">
          {/* Risk Banner */}
          <div className={`rounded-lg p-4 flex items-center gap-3 ${risk.bg} ${risk.border} border`}>
            {(() => {
              const Icon = risk.icon
              return <Icon className={`h-6 w-6 flex-shrink-0 ${risk.color}`} />
            })()}
            <div>
              <p className={`font-semibold ${risk.color}`}>{risk.label}</p>
              <p className="text-xs text-gray-500">
                Confidence: {Math.min(result.confidenceScore, 95)}%
              </p>
            </div>
          </div>

          {/* Analysis */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.reasoning}</p>
            </CardContent>
          </Card>

          {/* Suggested Replies */}
          {result.replies.length > 0 && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Suggested Replies</CardTitle>
                  <Badge variant="secondary" className="text-xs">{result.replies.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {result.replies.map((reply, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {replyTypeLabels[reply.type]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(`reply-${index}`, reply.content)}
                        className="h-7"
                      >
                        {copiedId === `reply-${index}` ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-xs">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            <span className="text-xs">Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{reply.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upsell to create project */}
          <Card className="border-dashed bg-blue-50/50 border-blue-200">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Want more accurate results?</p>
                  <p className="text-xs text-gray-500">
                    Create a project with your scope and contract details for context-aware analysis.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/projects/new" className="flex-shrink-0">
                <Button size="sm" variant="outline">
                  New Project
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
