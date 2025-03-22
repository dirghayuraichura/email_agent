'use server';

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateTokens } from "@/lib/server/token-utils";

export async function refreshToken(): Promise<{ 
  accessToken: string; 
  sessionToken: string; 
  success?: boolean;
} | { 
  error: string;
  success: false; 
}> {
  try {
    // Get the session token from the cookie
    const sessionToken = cookies().get('sessionToken')?.value;
    
    if (!sessionToken) {
      return { error: 'Not authenticated', success: false };
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
      
      return { error: 'Invalid or expired session', success: false };
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
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return { 
      accessToken: tokens.accessToken, 
      sessionToken: tokens.refreshToken,
      success: true
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    return { error: 'Internal server error', success: false };
  }
} 