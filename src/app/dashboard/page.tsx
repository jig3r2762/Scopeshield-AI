import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  FolderOpen,
  MessageSquare,
  Clock,
  Zap,
  AlertTriangle,
  BarChart2,
  CalendarDays,
  ArrowRight,
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const projects = await prisma.project.findMany({
    where: { userId: session!.user.id },
    include: {
      _count: {
        select: { messages: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  // Stats: query all messages for this user
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalMessages, highRiskCount, thisMonthCount] = await Promise.all([
    prisma.message.count({
      where: { project: { userId: session!.user.id } }
    }),
    prisma.message.count({
      where: {
        project: { userId: session!.user.id },
        riskLevel: 'HIGH_RISK_SCOPE_CREEP'
      }
    }),
    prisma.message.count({
      where: {
        project: { userId: session!.user.id },
        createdAt: { gte: startOfMonth }
      }
    }),
  ])

  const showStats = totalMessages > 0

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Projects</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Manage your projects and analyze client messages
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/analyze">
            <Button variant="outline" className="w-full sm:w-auto">
              <Zap className="h-4 w-4 mr-2" />
              Quick Analyze
            </Button>
          </Link>
          <Link href="/dashboard/projects/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Bar — only shown after first analysis */}
      {showStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FolderOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-gray-500">Total Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <BarChart2 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMessages}</p>
                <p className="text-xs text-gray-500">Total Analyses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highRiskCount}</p>
                <p className="text-xs text-gray-500">High Risk Messages</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{thisMonthCount}</p>
                <p className="text-xs text-gray-500">This Month</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {projects.length === 0 ? (
        /* Onboarding empty state */
        <Card className="border-dashed">
          <CardContent className="py-12 px-6">
            <div className="max-w-lg mx-auto text-center mb-10">
              <h3 className="text-xl font-semibold mb-2">Welcome to ScopeShield AI</h3>
              <p className="text-gray-500 text-sm">
                Follow these steps to protect your projects from scope creep.
              </p>
            </div>
            <div className="max-w-xl mx-auto grid gap-4 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-gray-50 border">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-sm">Create a Project</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Add your project scope, deliverables, and what&apos;s out of scope.
                  </p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-gray-50 border">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-sm">Define Your Scope</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your contract or describe what&apos;s included vs. excluded.
                  </p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-gray-50 border">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-sm">Paste a Client Message</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Get instant AI analysis and ready-to-send boundary replies.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              <Link href="/dashboard/projects/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first project
                </Button>
              </Link>
              <Link href="/dashboard/analyze">
                <Button variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Try Quick Analyze
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    {project.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.scopeSummary.substring(0, 100)}
                    {project.scopeSummary.length > 100 ? '...' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {project._count.messages} messages
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
