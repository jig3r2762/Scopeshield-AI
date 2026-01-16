import { NextRequest, NextResponse } from 'next/server'
import { validateApiToken } from '@/lib/api-token'
import { prisma } from '@/lib/prisma'
import { analyzeMessage } from '@/lib/ai/analyzer'
import { ProjectContext } from '@/lib/ai/types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: corsHeaders }
    )
  }

  const token = authHeader.replace('Bearer ', '')
  const user = await validateApiToken(token)

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401, headers: corsHeaders }
    )
  }

  try {
    const { message, senderEmail, projectId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Try to find a project context
    let project = null
    let context: ProjectContext = {
      scopeSummary: '', // Empty for quick analyze
      outOfScopeItems: null,
      contractText: null
    }

    // If projectId provided, use that project
    if (projectId) {
      project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: user.id
        }
      })
    }
    // Otherwise try to find by sender email
    else if (senderEmail) {
      project = await prisma.project.findFirst({
        where: {
          userId: user.id,
          clientEmail: senderEmail.toLowerCase()
        }
      })
    }

    // Use project context if found
    if (project) {
      context = {
        scopeSummary: project.scopeSummary,
        outOfScopeItems: project.outOfScopeItems,
        contractText: project.contractText
      }
    }

    // Analyze the message
    const analysis = await analyzeMessage(message, context)

    // Build response
    const result = {
      riskLevel: analysis.riskLevel,
      confidenceScore: analysis.confidenceScore,
      reasoning: analysis.reasoning,
      replies: analysis.replies,
      clientMessage: message.substring(0, 200), // For history preview
      projectLinked: project ? { id: project.id, name: project.name } : null,
      isQuickAnalysis: !project
    }

    // If project found, save to database
    if (project) {
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
        }
      })

      // Update client risk score
      const allMessages = await prisma.message.findMany({
        where: { projectId: project.id }
      })

      const riskPoints: Record<string, number> = {
        LIKELY_IN_SCOPE: 0,
        POSSIBLY_SCOPE_CREEP: 15,
        HIGH_RISK_SCOPE_CREEP: 30
      }

      const totalPoints = allMessages.reduce((sum, msg) => sum + (riskPoints[msg.riskLevel] || 0), 0)
      const clientRiskScore = Math.min(100, Math.round(totalPoints / Math.max(1, allMessages.length) * 3))

      await prisma.project.update({
        where: { id: project.id },
        data: { clientRiskScore }
      })

      // @ts-expect-error - adding messageId to result
      result.savedMessageId = savedMessage.id
    }

    return NextResponse.json(result, { headers: corsHeaders })
  } catch (error) {
    console.error('Extension analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze message' },
      { status: 500, headers: corsHeaders }
    )
  }
}
