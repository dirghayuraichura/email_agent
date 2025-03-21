import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { createSession } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create session
    await createSession(user.id)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 