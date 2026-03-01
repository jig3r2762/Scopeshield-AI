import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeMessage } from '@/lib/ai/analyzer'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const analysis = await analyzeMessage(message.trim(), {
      scopeSummary: 'General freelance project scope — analyze the message for common scope creep patterns and language.',
      outOfScopeItems: null,
      contractText: null,
    })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Quick analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze message' }, { status: 500 })
  }
}
