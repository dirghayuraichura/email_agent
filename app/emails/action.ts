import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'

// Get the current user
export async function getCurrentUser() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      throw new Error('Authentication required')
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
      throw new Error('User not found')
    }

    return user
  } catch (error) {
    console.error("Authentication error:", error)
    throw new Error("Authentication failed. Please sign in again.")
  }
} 