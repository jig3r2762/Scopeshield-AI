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

  return NextResponse.json(project)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id
    }
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      name: body.name ?? project.name,
      scopeSummary: body.scopeSummary ?? project.scopeSummary,
      outOfScopeItems: body.outOfScopeItems ?? project.outOfScopeItems,
      revisionCount: body.revisionCount ?? project.revisionCount,
      maxRevisions: body.maxRevisions ?? project.maxRevisions,
      clientRiskScore: body.clientRiskScore ?? project.clientRiskScore,
      clientEmail: body.clientEmail !== undefined ? body.clientEmail : project.clientEmail
    }
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id
    }
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  await prisma.project.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
