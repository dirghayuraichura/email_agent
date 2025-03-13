'use server';

import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  try {
    if (!password) {
      console.error("No password provided for hashing");
      throw new Error("Password is required");
    }
    
    const saltRounds = 10;
    console.log("Hashing password");
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error("Password hashing error:", error);
    throw error;
  }
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  try {
    if (!password || !hashedPassword) {
      console.error("Missing password or hash for comparison", {
        passwordProvided: !!password,
        hashProvided: !!hashedPassword
      });
      throw new Error("Password and hash are required");
    }
    
    console.log("Comparing passwords");
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Password comparison error:", error);
    throw error;
  }
} 