import jwt from "jsonwebtoken";

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

interface TokenPayload {
  userId: string;
  role?: string;
}

export function generateTokens(user: User): { accessToken: string; refreshToken: string } {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!jwtSecret || !jwtRefreshSecret) {
      console.error("JWT secrets not configured:", { 
        jwtSecretExists: !!jwtSecret, 
        jwtRefreshSecretExists: !!jwtRefreshSecret 
      });
      throw new Error('JWT secrets not configured');
    }
    
    console.log("Generating tokens for user:", user.id);
    
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600 }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      jwtRefreshSecret,
      { expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN) || 86400 }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw error;
  }
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    if (!token) {
      console.error("No access token provided");
      throw new Error('No token provided');
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT secret not configured");
      throw new Error('JWT secret not configured');
    }
    
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("Access token verification error:", error);
    throw error;
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    if (!token) {
      console.error("No refresh token provided");
      throw new Error('No token provided');
    }
    
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
      console.error("JWT refresh secret not configured");
      throw new Error('JWT refresh secret not configured');
    }
    
    const decoded = jwt.verify(token, jwtRefreshSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("Refresh token verification error:", error);
    throw error;
  }
} 