'use server';

import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function logout() {
  try {
    // Get the session token from the cookie
    const sessionToken = cookies().get('sessionToken')?.value;
    
    if (!sessionToken) {
      return { error: 'Not authenticated' };
    }

    // Delete session
    await prisma.session.deleteMany({
      where: { sessionToken }
    });

    // Clear the session cookie
    cookies().delete('sessionToken');

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: 'Internal server error' };
  }
} 