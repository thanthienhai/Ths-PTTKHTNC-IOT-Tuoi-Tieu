// Authentication service
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../index';
import { SessionManager, getRedisClient } from '@irrigation/shared';
import { AppError } from '../middleware/errorHandler';

const sessionManager = new SessionManager(getRedisClient());

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
  refreshToken: string;
  expiresAt: Date;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

/**
 * Login user and generate tokens
 */
export async function login(credentials: LoginCredentials): Promise<AuthToken> {
  const { username, password } = credentials;

  // Find user
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email: username },
      ],
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  };

  const token = jwt.sign(tokenPayload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = jwt.sign(
    { userId: user.id },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  // Store session in Redis
  await sessionManager.storeSession(user.id, {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    loginAt: new Date(),
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  return {
    token,
    refreshToken,
    expiresAt,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthToken> {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true },
    });

    if (!user) {
      throw new AppError(401, 'User not found', 'USER_NOT_FOUND');
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    const token = jwt.sign(tokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    // Update session
    await sessionManager.storeSession(user.id, {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      refreshedAt: new Date(),
    });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      token,
      refreshToken: newRefreshToken,
      expiresAt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }
    throw error;
  }
}

/**
 * Logout user
 */
export async function logout(userId: string): Promise<void> {
  await sessionManager.deleteSession(userId);
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
