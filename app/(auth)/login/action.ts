'use server';

import { z } from "zod";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { comparePasswords } from "../../../lib/server/bcrypt";
import { generateTokens } from "../../../lib/server/token-utils";

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Define User interface based on Prisma schema
interface User {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function login(formData: FormData) {
  try {
    // Log the form data for debugging
    const email = formData.get("email");
    const password = formData.get("password");
    
    console.log("Login attempt:", { email, passwordProvided: !!password });
    
    const validatedFields = loginSchema.safeParse({
      email,
      password,
    });

    if (!validatedFields.success) {
      console.error("Validation error:", validatedFields.error.format());
      return { error: "Invalid fields. Please check your email and password." };
    }

    const user = await prisma.user.findUnique({
      where: { email: validatedFields.data.email }
    });

    if (!user) {
      console.log("User not found:", validatedFields.data.email);
      return { error: "Invalid credentials" };
    }
    
    if (!user.password) {
      console.log("User has no password:", user.id);
      return { error: "Invalid credentials" };
    }

    const isValidPassword = await comparePasswords(validatedFields.data.password, user.password);
    if (!isValidPassword) {
      console.log("Invalid password for user:", user.id);
      return { error: "Invalid credentials" };
    }

    try {
      const tokens = generateTokens(user);
      
      // Create new session
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: tokens.refreshToken, // Use refreshToken as sessionToken
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });

      // Set the session token as a cookie
      cookies().set('sessionToken', session.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      const { password: _, ...userWithoutPassword } = user;
      
      // Return success with redirect path
      return { 
        success: true,
        user: userWithoutPassword, 
        accessToken: tokens.accessToken,
        sessionToken: session.sessionToken,
        redirect: '/dashboard'
      };
    } catch (tokenError) {
      console.error("Token generation error:", tokenError);
      return { error: "Authentication error" };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Internal server error' };
  }
} 