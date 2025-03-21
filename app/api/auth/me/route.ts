import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Log cookies for debugging
    const cookieHeader = request.headers.get('cookie') || 'No cookies'
    console.log('ME endpoint - Cookies:', cookieHeader)
    
    const session = await getSession()
    console.log('ME endpoint - Session:', session)
    
    if (!session?.userId) {
      console.log('ME endpoint - No session userId found')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!user) {
      console.log('ME endpoint - User not found for ID:', session.userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('ME endpoint - User found:', user.email)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('ME endpoint - Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 