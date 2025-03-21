import { cookies } from 'next/headers'
import prisma from './prisma'

export async function getSession() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value

  if (!sessionToken) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true }
  })

  if (!session || session.expires < new Date()) {
    return null
  }

  return {
    userId: session.userId,
    user: session.user
  }
} 