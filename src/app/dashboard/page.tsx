import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FolderOpen, MessageSquare, Clock } from 'lucide-react'

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your projects and analyze client messages
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Create your first project to start analyzing client messages for scope creep.
            </p>
            <Link href="/dashboard/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create your first project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
