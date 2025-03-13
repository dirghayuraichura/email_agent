'use server';

import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { generateTokens } from "@/lib/server/token-utils";

const prisma = new PrismaClient();

export async function refreshToken(): Promise<{ accessToken: string; sessionToken: string; } | { error: string }> {
  try {
    // Get the session token from the cookie
    const sessionToken = cookies().get('sessionToken')?.value;
    
    if (!sessionToken) {
      return { error: 'Not authenticated' };
    }

    // Find valid session
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    });

    if (!session || session.expires < new Date()) {
      // Delete expired session
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      
      // Clear the session cookie
      cookies().delete('sessionToken');
      
      return { error: 'Invalid or expired session' };
    }

    const tokens = generateTokens(session.user);

    // Update session with new token
    await prisma.session.update({
      where: { id: session.id },
      data: {
        sessionToken: tokens.refreshToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });
    
    // Set the new session token as a cookie
    cookies().set('sessionToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return { 
      accessToken: tokens.accessToken, 
      sessionToken: tokens.refreshToken
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    return { error: 'Internal server error' };
  }
} 