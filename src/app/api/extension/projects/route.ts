import { NextRequest, NextResponse } from 'next/server'
import { validateApiToken } from '@/lib/api-token'
import { prisma } from '@/lib/prisma'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
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
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        clientEmail: true,
        clientRiskScore: true,
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(
      { projects },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500, headers: corsHeaders }
    )
  }
}
