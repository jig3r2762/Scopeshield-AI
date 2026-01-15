'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Send,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Copy,
  Clock,
  FileText,
  Settings,
  Loader2,
  Trash2,
  Download,
  ClipboardCopy,
  RotateCcw,
  TrendingUp
} from 'lucide-react'

interface Reply {
  id: string
  type: 'POLITE_BOUNDARY' | 'PAID_ADDON' | 'NEGOTIATION_FRIENDLY'
  content: string
}

interface Message {
  id: string
  clientMessage: string
  riskLevel: 'LIKELY_IN_SCOPE' | 'POSSIBLY_SCOPE_CREEP' | 'HIGH_RISK_SCOPE_CREEP'
  confidenceScore: number
  reasoning: string
  createdAt: string
  replies: Reply[]
}

interface Project {
  id: string
  name: string
  scopeSummary: string
  outOfScopeItems: string | null
  contractPdfUrl: string | null
  revisionCount: number
  maxRevisions: number
  clientRiskScore: number
  messages: Message[]
}

const riskConfig = {
  LIKELY_IN_SCOPE: {
    label: 'Within Scope',
    variant: 'success' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  },
  POSSIBLY_SCOPE_CREEP: {
    label: 'Potential Scope Creep',
    variant: 'warning' as const,
    icon: AlertCircle,
    color: 'text-yellow-600'
  },
  HIGH_RISK_SCOPE_CREEP: {
    label: 'Likely Outside Scope',
    variant: 'danger' as const,
    icon: AlertTriangle,
    color: 'text-red-600'
  }
}

const replyTypeLabels = {
  POLITE_BOUNDARY: 'Polite Boundary',
  PAID_ADDON: 'Paid Add-on',
  NEGOTIATION_FRIENDLY: 'Flexible Option'
}

// Format confidence with cap at 95% and ranges
function formatConfidence(score: number): { level: string; display: string } {
  const cappedScore = Math.min(score, 95)
  if (cappedScore >= 85) return { level: 'Very High', display: `Very High (${cappedScore}%)` }
  if (cappedScore >= 70) return { level: 'High', display: `High (${cappedScore}%)` }
  return { level: 'Medium', display: `Medium (${cappedScore}%)` }
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to fetch project')
      }
      const data = await response.json()
      setProject(data)
    } catch {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!message.trim()) return

    setAnalyzing(true)
    setError('')

    try {
      const response = await fetch(`/api/projects/${id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to analyze message')
      }

      const newMessage = await response.json()
      setProject(prev => prev ? {
        ...prev,
        messages: [newMessage, ...prev.messages]
      } : null)
      setSelectedMessage(newMessage)
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCopyReply = async (replyId: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(replyId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      router.push('/dashboard')
    } catch {
      setError('Failed to delete project')
    }
  }

  const handleExport = (format: 'csv' | 'json') => {
    window.open(`/api/projects/${id}/export?format=${format}`, '_blank')
  }

  const handleCopyFullAnalysis = async () => {
    if (!selectedMessage) return

    const riskLabels: Record<string, string> = {
      LIKELY_IN_SCOPE: 'Within Scope',
      POSSIBLY_SCOPE_CREEP: 'Potential Scope Creep',
      HIGH_RISK_SCOPE_CREEP: 'Likely Outside Scope'
    }

    const repliesText = selectedMessage.replies.length > 0
      ? `\n\nSuggested Replies:\n${selectedMessage.replies.map(r => `- ${r.content}`).join('\n')}`
      : ''

    const fullText = `Client Message:
${selectedMessage.clientMessage}

Risk Assessment: ${riskLabels[selectedMessage.riskLevel]}
Confidence: ${formatConfidence(selectedMessage.confidenceScore).display}

Analysis:
${selectedMessage.reasoning}${repliesText}`

    await navigator.clipboard.writeText(fullText)
    setCopiedId('full-analysis')
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Project not found</p>
        <Link href="/dashboard">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold">{project.name}</h1>
          <div className="flex gap-2">
            <Link href={`/dashboard/projects/${id}/settings`} className="flex-1 sm:flex-none">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDeleteProject} className="flex-1 sm:flex-none">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6 order-2 lg:order-1">
          {/* Message Analysis Form */}
          <Card>
            <CardHeader>
              <CardTitle>Analyze Client Message</CardTitle>
              <CardDescription>
                Paste a client message to detect scope creep and get reply suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <Textarea
                placeholder="Paste the client's message here...

Example: 'Hey, quick question - can you also add a blog section to the website? It shouldn't take too long since you're already working on the pages.'"
                className="min-h-[150px]"
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

          {/* Analysis Result */}
          {selectedMessage && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Analysis Result</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyFullAnalysis}
                    >
                      {copiedId === 'full-analysis' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <ClipboardCopy className="h-4 w-4 mr-1" />
                          Copy All
                        </>
                      )}
                    </Button>
                    <Badge variant={riskConfig[selectedMessage.riskLevel].variant}>
                      {riskConfig[selectedMessage.riskLevel].label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Risk Assessment */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = riskConfig[selectedMessage.riskLevel].icon
                      return <Icon className={`h-5 w-5 ${riskConfig[selectedMessage.riskLevel].color}`} />
                    })()}
                    <span className="font-medium">
                      Confidence: {formatConfidence(selectedMessage.confidenceScore).display}
                    </span>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{selectedMessage.reasoning}</p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    This is a risk assessment to help guide your response — final decisions are always yours.
                  </p>
                </div>

                {/* Reply Suggestions */}
                {selectedMessage.replies.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Suggested Replies</h4>
                    <div className="space-y-3">
                      {selectedMessage.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">
                              {replyTypeLabels[reply.type]}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyReply(reply.id, reply.content)}
                            >
                              {copiedId === reply.id ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Message History */}
          {project.messages.length > 0 && (
            <Card>
              <CardHeader className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle>Message History</CardTitle>
                    <CardDescription>
                      Previously analyzed messages for this project
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('csv')}
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('json')}
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      JSON
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedMessage?.id === msg.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{msg.clientMessage}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(msg.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Badge variant={riskConfig[msg.riskLevel].variant} className="shrink-0">
                          {riskConfig[msg.riskLevel].label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Project Info */}
        <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{project.scopeSummary}</p>
            </CardContent>
          </Card>

          {project.outOfScopeItems && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Out of Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{project.outOfScopeItems}</p>
              </CardContent>
            </Card>
          )}

          {project.contractPdfUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={project.contractPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Contract PDF
                </a>
              </CardContent>
            </Card>
          )}

          {/* Revision Counter */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Revisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {project.revisionCount ?? 0} / {project.maxRevisions ?? 3}
                </span>
                <Badge
                  variant={(project.revisionCount ?? 0) >= (project.maxRevisions ?? 3) ? 'danger' : 'secondary'}
                >
                  {(project.revisionCount ?? 0) >= (project.maxRevisions ?? 3) ? 'Limit Reached' : 'Active'}
                </Badge>
              </div>
              {(project.revisionCount ?? 0) >= (project.maxRevisions ?? 3) && (
                <p className="text-xs text-muted-foreground mt-2">
                  Additional revisions should be billed separately.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Client Risk Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Client Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{project.clientRiskScore ?? 0}</span>
                <Badge
                  variant={
                    (project.clientRiskScore ?? 0) >= 70 ? 'danger' :
                    (project.clientRiskScore ?? 0) >= 40 ? 'warning' :
                    'success'
                  }
                >
                  {(project.clientRiskScore ?? 0) >= 70 ? 'High Risk' :
                   (project.clientRiskScore ?? 0) >= 40 ? 'Medium Risk' :
                   'Low Risk'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Based on {project.messages.length} analyzed messages
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
