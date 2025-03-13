'use server';

import { z } from "zod";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../../lib/server/bcrypt";
import { generateTokens } from "../../../lib/server/token-utils";

const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function register(formData: FormData) {
  try {
    // Log the form data for debugging
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    
    console.log("Registration attempt:", { 
      name, 
      email, 
      passwordProvided: !!password 
    });
    
    const validatedFields = registerSchema.safeParse({
      name,
      email,
      password,
    });

    if (!validatedFields.success) {
      console.error("Validation error:", validatedFields.error.format());
      return { error: "Invalid fields. Please check your input." };
    }

    const { name: validatedName, email: validatedEmail, password: validatedPassword } = validatedFields.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedEmail }
    });

    if (existingUser) {
      console.log("Email already registered:", validatedEmail);
      return { error: "Email already registered" };
    }

    try {
      // Hash password
      const hashedPassword = await hashPassword(validatedPassword);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: validatedEmail,
          password: hashedPassword,
          name: validatedName || null,
          role: 'VIEWER' // Default role from schema
        }
      });

      const tokens = generateTokens(user);

      // Create session
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: tokens.refreshToken,
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
      return { 
        user: userWithoutPassword, 
        accessToken: tokens.accessToken,
        sessionToken: session.sessionToken 
      };
    } catch (processingError) {
      console.error("User creation error:", processingError);
      return { error: "Failed to create user account" };
    }
  } catch (error) {
    console.error('Register error:', error);
    return { error: 'Internal server error' };
  }
} 