import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createApiToken, getUserApiTokens, revokeApiToken } from '@/lib/api-token'

// Get user's API tokens
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    const tokens = await getUserApiTokens(user.id)
    return NextResponse.json({ tokens })
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 })
  }
}

// Create new API token
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    const { name = 'Browser Extension' } = await request.json().catch(() => ({}))

    const result = await createApiToken(user.id, name)

    return NextResponse.json({
      token: result.token,
      id: result.id,
      message: "Token created. Copy it now - it won't be shown again."
    })
  } catch (error) {
    console.error('Error creating token:', error)
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
  }
}

// Delete API token
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    const { tokenId } = await request.json()

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID required' }, { status: 400 })
    }

    await revokeApiToken(tokenId, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting token:', error)
    return NextResponse.json({ error: 'Failed to delete token' }, { status: 500 })
  }
}
