'use server';

import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "@/lib/server/token-utils";

const prisma = new PrismaClient();

export async function getCurrentUser(accessToken?: string | null) {
  try {
    // If no access token is provided or it's empty, try to get the session token from cookies
    if (!accessToken) {
      const sessionToken = cookies().get('sessionToken')?.value;
      
      if (!sessionToken) {
        return { error: 'Not authenticated' };
      }
      
      // Find the session
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true }
      });
      
      if (!session || session.expires < new Date()) {
        return { error: 'Invalid or expired session' };
      }
      
      // Return the user without the password
      const { password: _, ...userWithoutPassword } = session.user;
      return { user: userWithoutPassword };
    }
    
    // If an access token is provided, verify it
    const decoded = verifyAccessToken(accessToken);
    
    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password and other sensitive fields
      },
    });
    
    if (!user) {
      return { error: 'User not found' };
    }
    
    return { user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { error: 'Invalid token' };
  }
} 