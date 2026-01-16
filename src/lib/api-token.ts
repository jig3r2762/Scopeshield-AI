import { prisma } from './prisma'
import crypto from 'crypto'

// Generate a secure API token
export function generateApiToken(): string {
  return `ss_${crypto.randomBytes(32).toString('hex')}`
}

// Validate API token and return user
export async function validateApiToken(token: string) {
  if (!token || !token.startsWith('ss_')) {
    return null
  }

  const apiToken = await prisma.apiToken.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!apiToken) {
    return null
  }

  // Update last used timestamp
  await prisma.apiToken.update({
    where: { id: apiToken.id },
    data: { lastUsed: new Date() }
  })

  return apiToken.user
}

// Create a new API token for user
export async function createApiToken(userId: string, name = 'Browser Extension') {
  if (!userId) {
    throw new Error('User ID is required to create API token')
  }

  const token = generateApiToken()

  const apiToken = await prisma.apiToken.create({
    data: {
      token,
      name,
      userId
    }
  })

  return { token, id: apiToken.id }
}


// Revoke an API token
export async function revokeApiToken(tokenId: string, userId: string) {
  await prisma.apiToken.deleteMany({
    where: {
      id: tokenId,
      userId
    }
  })
}

// Get user's API tokens
export async function getUserApiTokens(userId: string) {
  return prisma.apiToken.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      lastUsed: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
}
