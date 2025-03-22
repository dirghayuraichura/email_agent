import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('sessionToken')?.value

    if (sessionToken) {
      await deleteSession(sessionToken)
    }

    // Clear the session cookie
    cookieStore.delete('sessionToken')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
} 