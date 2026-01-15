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
        <p className="text-gray-500">Project not found</p>
        <Link href="/dashboard">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
          Back to Projects
        </Link>
        <div className="flex flex-col gap-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{project.name}</h1>
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/projects/${id}/settings`} className="flex-1 min-w-[120px] sm:flex-none">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
                Settings
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteProject}
              className="flex-1 min-w-[100px] sm:flex-none"
            >
              <Trash2 className="h-4 w-4 mr-2 flex-shrink-0" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Project Info Cards - Always full width on mobile */}
      <div className="mb-4 md:mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
          {/* Project Scope */}
          <Card className="w-full">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-semibold">Project Scope</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-sm text-gray-600 break-words whitespace-pre-wrap overflow-hidden">
                {project.scopeSummary}
              </p>
            </CardContent>
          </Card>

          {/* Out of Scope */}
          {project.outOfScopeItems && (
            <Card className="w-full">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-semibold">Out of Scope</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-sm text-gray-600 break-words whitespace-pre-wrap overflow-hidden">
                  {project.outOfScopeItems}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contract */}
          {project.contractPdfUrl && (
            <Card className="w-full">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-semibold">Contract</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <a
                  href={project.contractPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>View PDF</span>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Revisions */}
          <Card className="w-full">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <RotateCcw className="h-4 w-4 flex-shrink-0" />
                Revisions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-lg font-bold">
                  {project.revisionCount ?? 0} / {project.maxRevisions ?? 3}
                </span>
                <Badge
                  variant={(project.revisionCount ?? 0) >= (project.maxRevisions ?? 3) ? 'danger' : 'secondary'}
                  className="text-xs"
                >
                  {(project.revisionCount ?? 0) >= (project.maxRevisions ?? 3) ? 'Limit' : 'Active'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Client Risk */}
          <Card className="w-full">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                Client Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-lg font-bold">{project.clientRiskScore ?? 0}</span>
                <Badge
                  variant={
                    (project.clientRiskScore ?? 0) >= 70 ? 'danger' :
                    (project.clientRiskScore ?? 0) >= 40 ? 'warning' : 'success'
                  }
                  className="text-xs"
                >
                  {(project.clientRiskScore ?? 0) >= 70 ? 'High' :
                   (project.clientRiskScore ?? 0) >= 40 ? 'Medium' : 'Low'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {project.messages.length} messages analyzed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Grid - Desktop Only */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Message Analysis Form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Analyze Client Message</CardTitle>
              <CardDescription className="text-sm">
                Paste a client message to detect scope creep.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md break-words">
                  {error}
                </div>
              )}
              <Textarea
                placeholder="Paste the client's message here..."
                className="min-h-[120px] sm:min-h-[150px] text-base"
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
                    <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2 flex-shrink-0" />
                    Analyze Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Result */}
          {selectedMessage && (
            <Card className="w-full">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg">Analysis Result</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyFullAnalysis}
                    >
                      {copiedId === 'full-analysis' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600 flex-shrink-0" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <ClipboardCopy className="h-4 w-4 mr-1 flex-shrink-0" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Badge variant={riskConfig[selectedMessage.riskLevel].variant}>
                      {riskConfig[selectedMessage.riskLevel].label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const Icon = riskConfig[selectedMessage.riskLevel].icon
                      return <Icon className={`h-5 w-5 flex-shrink-0 ${riskConfig[selectedMessage.riskLevel].color}`} />
                    })()}
                    <span className="font-medium text-sm sm:text-base">
                      Confidence: {formatConfidence(selectedMessage.confidenceScore).display}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                    <p className="text-sm break-words whitespace-pre-wrap overflow-hidden">
                      {selectedMessage.reasoning}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    This is a risk assessment to help guide your response.
                  </p>
                </div>

                {selectedMessage.replies.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm sm:text-base">Suggested Replies</h4>
                    <div className="space-y-3">
                      {selectedMessage.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {replyTypeLabels[reply.type]}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyReply(reply.id, reply.content)}
                            >
                              {copiedId === reply.id ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-600 flex-shrink-0" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1 flex-shrink-0" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 break-words overflow-hidden">
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
            <Card className="w-full">
              <CardHeader>
                <div className="flex flex-col gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Message History</CardTitle>
                    <CardDescription className="text-sm">
                      Previously analyzed messages
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('csv')}
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="h-4 w-4 mr-1 flex-shrink-0" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('json')}
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="h-4 w-4 mr-1 flex-shrink-0" />
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
                      className={`border rounded-lg p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedMessage?.id === msg.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <div className="flex flex-col gap-2">
                        <p className="text-sm break-words line-clamp-2 overflow-hidden">
                          {msg.clientMessage}
                        </p>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </div>
                          <Badge variant={riskConfig[msg.riskLevel].variant} className="text-xs">
                            {msg.riskLevel === 'LIKELY_IN_SCOPE' ? 'Safe' :
                             msg.riskLevel === 'POSSIBLY_SCOPE_CREEP' ? 'Caution' : 'Risk'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Desktop Only */}
        <div className="hidden lg:block space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Project Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 break-words whitespace-pre-wrap">
                {project.scopeSummary}
              </p>
            </CardContent>
          </Card>

          {project.outOfScopeItems && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Out of Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 break-words whitespace-pre-wrap">
                  {project.outOfScopeItems}
                </p>
              </CardContent>
            </Card>
          )}

          {project.contractPdfUrl && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={project.contractPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  View Contract PDF
                </a>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <RotateCcw className="h-4 w-4 flex-shrink-0" />
                Revisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
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
                <p className="text-xs text-gray-500 mt-2">
                  Additional revisions should be billed separately.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                Client Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl font-bold">{project.clientRiskScore ?? 0}</span>
                <Badge
                  variant={
                    (project.clientRiskScore ?? 0) >= 70 ? 'danger' :
                    (project.clientRiskScore ?? 0) >= 40 ? 'warning' : 'success'
                  }
                >
                  {(project.clientRiskScore ?? 0) >= 70 ? 'High Risk' :
                   (project.clientRiskScore ?? 0) >= 40 ? 'Medium Risk' : 'Low Risk'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Based on {project.messages.length} analyzed messages
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
