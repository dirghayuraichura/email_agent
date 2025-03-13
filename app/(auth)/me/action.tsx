'use server';

import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "../../../lib/server/token-utils";

const prisma = new PrismaClient();

export async function getCurrentUser(accessToken: string) {
  try {
    if (!accessToken) {
      return { error: 'Access token is required' };
    }

    // Verify the token
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