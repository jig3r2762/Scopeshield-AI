import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { extractTextFromPdf } from '@/lib/pdf'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { messages: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return NextResponse.json(projects)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const scopeSummary = formData.get('scopeSummary') as string
    const outOfScopeItems = formData.get('outOfScopeItems') as string | null
    const contractFile = formData.get('contract') as File | null

    if (!name || !scopeSummary) {
      return NextResponse.json(
        { error: 'Name and scope summary are required' },
        { status: 400 }
      )
    }

    let contractPdfUrl: string | null = null
    let contractText: string | null = null

    if (contractFile) {
      const bytes = await contractFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch {
        // Directory might already exist
      }

      // Sanitize filename - remove special characters
      const safeName = contractFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${Date.now()}-${safeName}`
      const filepath = path.join(uploadsDir, filename)

      // Save file
      try {
        await writeFile(filepath, new Uint8Array(buffer))
        contractPdfUrl = `/uploads/${filename}`
      } catch (writeError) {
        console.error('Failed to write file:', writeError)
        // Continue without saving file, but still extract text
      }

      // Extract text from PDF
      try {
        contractText = await extractTextFromPdf(buffer)
      } catch (error) {
        console.error('Failed to extract PDF text:', error)
        // Continue without extracted text
      }
    }

    const project = await prisma.project.create({
      data: {
        name,
        scopeSummary,
        outOfScopeItems,
        contractPdfUrl,
        contractText,
        userId: session.user.id
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
