import { NextRequest, NextResponse } from 'next/server'
import { validateApiToken } from '@/lib/api-token'

// CORS headers for extension
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
      { error: 'Missing authorization header' },
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

  return NextResponse.json(
    {
      id: user.id,
      name: user.name,
      email: user.email
    },
    { headers: corsHeaders }
  )
}
