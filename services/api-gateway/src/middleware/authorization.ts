// Authorization middleware
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';
import { CacheManager, getRedisClient, CacheKeys } from '@irrigation/shared';

const cache = new CacheManager(getRedisClient());

export type UserRole = 'farmer' | 'manager' | 'agronomist' | 'technician' | 'admin';

/**
 * Role hierarchy (higher roles include permissions of lower roles)
 */
const roleHierarchy: Record<UserRole, number> = {
  farmer: 1,
  technician: 2,
  agronomist: 3,
  manager: 4,
  admin: 5,
};

/**
 * Check if user has required role
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated', 'UNAUTHORIZED'));
    }

    const userRole = req.user.role as UserRole;
    const userRoleLevel = roleHierarchy[userRole] || 0;

    const hasRole = roles.some(role => {
      const requiredLevel = roleHierarchy[role] || 0;
      return userRoleLevel >= requiredLevel;
    });

    if (!hasRole) {
      return next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'));
    }

    next();
  };
}

/**
 * Check if user has specific permission
 */
export function requirePermission(resource: string, action: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated', 'UNAUTHORIZED'));
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check cached permissions
    const cacheKey = CacheKeys.userPermissions(req.user.id);
    let permissions = await cache.get<any[]>(cacheKey);

    if (!permissions) {
      // Load permissions from user object
      permissions = req.user.permissions || [];
      await cache.set(cacheKey, permissions, 300); // Cache for 5 minutes
    }

    // Check if user has permission
    const hasPermission = permissions.some((perm: any) => {
      return perm.resource === resource && perm.actions.includes(action);
    });

    if (!hasPermission) {
      return next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'));
    }

    next();
  };
}

/**
 * Check if user owns the resource or has admin role
 */
export function requireOwnership(getUserIdFromResource: (req: AuthRequest) => string | Promise<string>) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated', 'UNAUTHORIZED'));
    }

    // Admin can access all resources
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      const resourceUserId = await getUserIdFromResource(req);

      if (resourceUserId !== req.user.id) {
        return next(new AppError(403, 'Access denied', 'FORBIDDEN'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user has access to farm
 */
export async function checkFarmAccess(userId: string, farmId: string): Promise<boolean> {
  const { prisma } = await import('../index');

  // Check if user owns the farm
  const farm = await prisma.farm.findFirst({
    where: {
      id: farmId,
      ownerId: userId,
    },
  });

  if (farm) {
    return true;
  }

  // Check if user has access through FarmAccess
  const access = await prisma.farmAccess.findFirst({
    where: {
      farmId,
      userId,
    },
  });

  return !!access;
}

/**
 * Require farm access middleware
 */
export function requireFarmAccess(getFarmId: (req: AuthRequest) => string | Promise<string>) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated', 'UNAUTHORIZED'));
    }

    // Admin has access to all farms
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      const farmId = await getFarmId(req);
      const hasAccess = await checkFarmAccess(req.user.id, farmId);

      if (!hasAccess) {
        return next(new AppError(403, 'Access denied to this farm', 'FORBIDDEN'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
