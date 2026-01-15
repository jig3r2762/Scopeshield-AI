import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id
    },
    include: {
      messages: {
        include: {
          replies: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const riskLabels: Record<string, string> = {
    LIKELY_IN_SCOPE: 'Within Scope',
    POSSIBLY_SCOPE_CREEP: 'Potential Scope Creep',
    HIGH_RISK_SCOPE_CREEP: 'Likely Outside Scope'
  }

  if (format === 'csv') {
    // Generate CSV
    const headers = ['Date', 'Client Message', 'Risk Level', 'Confidence', 'Reasoning']
    const rows = project.messages.map(msg => [
      new Date(msg.createdAt).toLocaleString(),
      `"${msg.clientMessage.replace(/"/g, '""')}"`,
      riskLabels[msg.riskLevel],
      `${msg.confidenceScore}%`,
      `"${msg.reasoning.replace(/"/g, '""')}"`
    ])

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${project.name}-history.csv"`
      }
    })
  } else if (format === 'json') {
    // Generate JSON export
    const exportData = {
      project: {
        name: project.name,
        scopeSummary: project.scopeSummary,
        outOfScopeItems: project.outOfScopeItems,
        exportedAt: new Date().toISOString()
      },
      messages: project.messages.map(msg => ({
        date: msg.createdAt,
        clientMessage: msg.clientMessage,
        riskLevel: riskLabels[msg.riskLevel],
        confidence: msg.confidenceScore,
        reasoning: msg.reasoning,
        suggestedReplies: msg.replies.map(r => ({
          type: r.type,
          content: r.content
        }))
      })),
      summary: {
        totalMessages: project.messages.length,
        withinScope: project.messages.filter(m => m.riskLevel === 'LIKELY_IN_SCOPE').length,
        potentialScopeCreep: project.messages.filter(m => m.riskLevel === 'POSSIBLY_SCOPE_CREEP').length,
        likelyOutsideScope: project.messages.filter(m => m.riskLevel === 'HIGH_RISK_SCOPE_CREEP').length
      }
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${project.name}-history.json"`
      }
    })
  }

  return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
}
