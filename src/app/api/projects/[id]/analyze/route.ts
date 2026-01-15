import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeMessage } from '@/lib/ai/analyzer'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get the project
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Analyze the message
    const analysis = await analyzeMessage(message, {
      scopeSummary: project.scopeSummary,
      outOfScopeItems: project.outOfScopeItems,
      contractText: project.contractText
    })

    // Save the message and analysis
    const savedMessage = await prisma.message.create({
      data: {
        clientMessage: message,
        riskLevel: analysis.riskLevel,
        confidenceScore: analysis.confidenceScore,
        reasoning: analysis.reasoning,
        projectId: project.id,
        replies: {
          create: analysis.replies.map(reply => ({
            type: reply.type,
            content: reply.content
          }))
        }
      },
      include: {
        replies: true
      }
    })

    // Calculate client risk score based on all messages
    const allMessages = await prisma.message.findMany({
      where: { projectId: project.id }
    })

    // Risk score calculation:
    // - LIKELY_IN_SCOPE = 0 points
    // - POSSIBLY_SCOPE_CREEP = 15 points
    // - HIGH_RISK_SCOPE_CREEP = 30 points
    const riskPoints: Record<string, number> = {
      LIKELY_IN_SCOPE: 0,
      POSSIBLY_SCOPE_CREEP: 15,
      HIGH_RISK_SCOPE_CREEP: 30
    }

    const totalPoints = allMessages.reduce((sum, msg) => sum + (riskPoints[msg.riskLevel] || 0), 0)
    // Normalize to 0-100 scale, cap at 100
    const clientRiskScore = Math.min(100, Math.round(totalPoints / Math.max(1, allMessages.length) * 3))

    await prisma.project.update({
      where: { id: project.id },
      data: { clientRiskScore }
    })

    return NextResponse.json(savedMessage)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze message' },
      { status: 500 }
    )
  }
}
