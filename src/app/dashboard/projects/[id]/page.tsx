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
  TrendingUp,
  History,
  ChevronDown,
  ChevronUp,
  X,
  Menu
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
    shortLabel: 'Safe',
    variant: 'success' as const,
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  POSSIBLY_SCOPE_CREEP: {
    label: 'Potential Scope Creep',
    shortLabel: 'Caution',
    variant: 'warning' as const,
    icon: AlertCircle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  HIGH_RISK_SCOPE_CREEP: {
    label: 'Likely Outside Scope',
    shortLabel: 'Risk',
    variant: 'danger' as const,
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200'
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
  const [historyOpen, setHistoryOpen] = useState(true)
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false)
  const [analysisExpanded, setAnalysisExpanded] = useState(true)
  const [repliesExpanded, setRepliesExpanded] = useState(true)
  const [projectInfoExpanded, setProjectInfoExpanded] = useState(false)

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
      setAnalysisExpanded(true)
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

  const HistoryPanel = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : ''}`}>
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-gray-500" />
          <span className="font-semibold text-sm">History</span>
          {project.messages.length > 0 && (
            <Badge variant="secondary" className="text-xs">{project.messages.length}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {project.messages.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport('csv')}
                className="h-7 px-2"
                title="Export CSV"
              >
                <Download className="h-3 w-3" />
              </Button>
            </>
          )}
          {mobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileHistoryOpen(false)}
              className="h-7 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {project.messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No messages yet</p>
        ) : (
          <div className="space-y-2">
            {project.messages.map((msg) => {
              const risk = riskConfig[msg.riskLevel]
              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedMessage?.id === msg.id
                      ? `${risk.bg} ${risk.border} ring-1 ring-offset-1 ring-gray-300`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedMessage(msg)
                    setAnalysisExpanded(true)
                    if (mobile) setMobileHistoryOpen(false)
                  }}
                >
                  <p className="text-sm line-clamp-2 mb-2">{msg.clientMessage}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                    <Badge variant={risk.variant} className="text-xs">
                      {risk.shortLabel}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 border-b bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold truncate">{project.name}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile History Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileHistoryOpen(true)}
              className="lg:hidden"
            >
              <History className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">History</span>
              {project.messages.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{project.messages.length}</Badge>
              )}
            </Button>
            {/* Desktop History Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(!historyOpen)}
              className="hidden lg:flex"
            >
              <History className="h-4 w-4 mr-1" />
              {historyOpen ? 'Hide' : 'Show'} History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProjectInfoExpanded(!projectInfoExpanded)}
            >
              <FileText className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Info</span>
            </Button>
            <Link href={`/dashboard/projects/${id}/settings`}>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteProject}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Collapsible Project Info */}
        {projectInfoExpanded && (
          <div className="mt-3 pt-3 border-t grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Scope Summary</p>
              <p className="text-sm line-clamp-2">{project.scopeSummary}</p>
            </div>
            {project.outOfScopeItems && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Out of Scope</p>
                <p className="text-sm line-clamp-2">{project.outOfScopeItems}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Revisions</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{project.revisionCount ?? 0}/{project.maxRevisions ?? 3}</span>
                <Badge variant={(project.revisionCount ?? 0) >= (project.maxRevisions ?? 3) ? 'danger' : 'secondary'} className="text-xs">
                  {(project.revisionCount ?? 0) >= (project.maxRevisions ?? 3) ? 'Limit' : 'Active'}
                </Badge>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Client Risk</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{project.clientRiskScore ?? 0}</span>
                <Badge
                  variant={(project.clientRiskScore ?? 0) >= 70 ? 'danger' : (project.clientRiskScore ?? 0) >= 40 ? 'warning' : 'success'}
                  className="text-xs"
                >
                  {(project.clientRiskScore ?? 0) >= 70 ? 'High' : (project.clientRiskScore ?? 0) >= 40 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile History Drawer */}
      {mobileHistoryOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileHistoryOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl">
            <HistoryPanel mobile />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop History Sidebar */}
        {historyOpen && (
          <div className="hidden lg:flex w-72 flex-shrink-0 border-r bg-white flex-col">
            <HistoryPanel />
          </div>
        )}

        {/* Center Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {/* Analysis Form - Compact */}
            <Card>
              <CardContent className="p-4">
                {error && (
                  <div className="mb-3 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <Textarea
                  placeholder="Paste client message to analyze for scope creep..."
                  className="min-h-[100px] mb-3 text-sm resize-none"
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
              <>
                {/* Compact Risk Header */}
                <div className={`rounded-lg p-3 flex items-center justify-between ${riskConfig[selectedMessage.riskLevel].bg} ${riskConfig[selectedMessage.riskLevel].border} border`}>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = riskConfig[selectedMessage.riskLevel].icon
                      return <Icon className={`h-5 w-5 ${riskConfig[selectedMessage.riskLevel].color}`} />
                    })()}
                    <div>
                      <p className={`font-semibold ${riskConfig[selectedMessage.riskLevel].color}`}>
                        {riskConfig[selectedMessage.riskLevel].label}
                      </p>
                      <p className="text-xs text-gray-500">
                        Confidence: {formatConfidence(selectedMessage.confidenceScore).display}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyFullAnalysis}
                    className="flex-shrink-0"
                  >
                    {copiedId === 'full-analysis' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <ClipboardCopy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Client Message Preview */}
                <Card>
                  <CardHeader className="p-3 pb-0">
                    <p className="text-xs font-medium text-gray-500">Client Message</p>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.clientMessage}</p>
                  </CardContent>
                </Card>

                {/* Collapsible Analysis */}
                <Card>
                  <CardHeader
                    className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setAnalysisExpanded(!analysisExpanded)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Analysis</CardTitle>
                      {analysisExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  {analysisExpanded && (
                    <CardContent className="p-3 pt-0">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedMessage.reasoning}</p>
                    </CardContent>
                  )}
                </Card>

                {/* Collapsible Replies */}
                {selectedMessage.replies.length > 0 && (
                  <Card>
                    <CardHeader
                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setRepliesExpanded(!repliesExpanded)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-semibold">Suggested Replies</CardTitle>
                          <Badge variant="secondary" className="text-xs">{selectedMessage.replies.length}</Badge>
                        </div>
                        {repliesExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </CardHeader>
                    {repliesExpanded && (
                      <CardContent className="p-3 pt-0 space-y-3">
                        {selectedMessage.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="border rounded-lg p-3 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {replyTypeLabels[reply.type]}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyReply(reply.id, reply.content)}
                                className="h-7"
                              >
                                {copiedId === reply.id ? (
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
                    )}
                  </Card>
                )}
              </>
            )}

            {/* Empty State when no message selected */}
            {!selectedMessage && project.messages.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <Send className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Paste a client message above to analyze for scope creep</p>
              </div>
            )}

            {!selectedMessage && project.messages.length > 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <History className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Select a message from history or analyze a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
