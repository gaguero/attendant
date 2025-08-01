import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import {
  CreateUserDto,
  UpdateUserDto,
  UserListQueryDto,
  UserRole,
} from '@attendandt/shared';

const router = Router();

/**
 * GET /users
 * List users with pagination and filtering
 * Requires: ADMIN or MANAGER role
 */
router.get('/', requireAuth, requireRole(UserRole.ADMIN, UserRole.STAFF), async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const validatedQuery = UserListQueryDto.parse({
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      role: req.query.role ? req.query.role : undefined,
      search: req.query.search ? req.query.search : undefined,
    });

    const { page, limit, role, search } = validatedQuery;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    logger.info('Users retrieved successfully', {
      requestedBy: req.user?.id,
      count: users.length,
      totalCount,
      page,
      limit,
      filters: { role, search },
    });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
    });
  } catch (error) {
    logger.error('Error retrieving users', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestedBy: req.user?.id,
      query: req.query,
    });

    if (error instanceof Error && error.message.includes('validation')) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve users',
    });
  }
});

/**
 * GET /users/:id
 * Get a specific user by ID
 * Requires: Authentication (users can see their own profile, ADMIN/MANAGER can see any)
 */
router.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is requesting their own profile or has admin/manager role
    const isOwnProfile = req.user?.id === id;
    const hasAdminAccess = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.STAFF;

    if (!isOwnProfile && !hasAdminAccess) {
      logger.warn('Unauthorized user profile access attempt', {
        requestedBy: req.user?.id,
        targetUserId: id,
        userRole: req.user?.role,
      });

      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only access your own profile',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn('User not found', {
        requestedBy: req.user?.id,
        targetUserId: id,
      });

      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'User not found',
      });
      return;
    }

    logger.info('User retrieved successfully', {
      requestedBy: req.user?.id,
      targetUserId: id,
      isOwnProfile,
    });

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { user },
    });
  } catch (error) {
    logger.error('Error retrieving user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestedBy: req.user?.id,
      targetUserId: req.params.id,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve user',
    });
  }
});

/**
 * POST /users
 * Create a new user
 * Requires: ADMIN role
 */
router.post('/', requireAuth, requireRole(UserRole.ADMIN), async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = CreateUserDto.parse(req.body);
    const { email, firstName, lastName, role, authId } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      logger.warn('User creation failed: Email already exists', {
        email: email.toLowerCase(),
        requestedBy: req.user?.id,
      });

      res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'A user with this email address already exists',
      });
      return;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || UserRole.STAFF,
        passwordHash: authId || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('User created successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user },
    });
  } catch (error) {
    logger.error('Error creating user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestedBy: req.user?.id,
      body: req.body,
    });

    if (error instanceof Error && error.message.includes('validation')) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create user',
    });
  }
});

/**
 * PUT /users/:id
 * Update a user
 * Requires: Authentication (users can update their own profile, ADMIN can update any)
 */
router.put('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is updating their own profile or has admin role
    const isOwnProfile = req.user?.id === id;
    const hasAdminAccess = req.user?.role === UserRole.ADMIN;

    if (!isOwnProfile && !hasAdminAccess) {
      logger.warn('Unauthorized user update attempt', {
        requestedBy: req.user?.id,
        targetUserId: id,
        userRole: req.user?.role,
      });

      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only update your own profile',
      });
      return;
    }

    // Validate request body
    const validatedData = UpdateUserDto.parse(req.body);
    const updateData: any = {};

    // Only allow certain fields to be updated based on role
    if (validatedData.email && validatedData.email !== req.user?.email) {
      // Check if new email already exists
      const existingUser = await prisma.user.findUnique({
        where: { 
          email: validatedData.email.toLowerCase(),
          NOT: { id },
        },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'A user with this email address already exists',
        });
        return;
      }

      updateData.email = validatedData.email.toLowerCase();
    }

    if (validatedData.firstName !== undefined) {
      updateData.firstName = validatedData.firstName;
    }

    if (validatedData.lastName !== undefined) {
      updateData.lastName = validatedData.lastName;
    }

    // Only admins can update roles and passwordHash
    if (hasAdminAccess) {
      if (validatedData.role !== undefined) {
        updateData.role = validatedData.role;
      }
      if (validatedData.authId !== undefined) {
        updateData.passwordHash = validatedData.authId;
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'User not found',
      });
      return;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('User updated successfully', {
      userId: user.id,
      updatedBy: req.user?.id,
      isOwnProfile,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    logger.error('Error updating user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestedBy: req.user?.id,
      targetUserId: req.params.id,
      body: req.body,
    });

    if (error instanceof Error && error.message.includes('validation')) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update user',
    });
  }
});

/**
 * DELETE /users/:id
 * Soft delete a user (updates a deletedAt field or similar)
 * Requires: ADMIN role
 */
router.delete('/:id', requireAuth, requireRole(UserRole.ADMIN), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user?.id === id) {
      logger.warn('Admin attempted to delete their own account', {
        userId: req.user.id,
        email: req.user.email,
      });

      res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'You cannot delete your own account',
      });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'User not found',
      });
      return;
    }

    // For now, we'll do a hard delete since we don't have a deletedAt field
    // In production, implement soft delete with a deletedAt timestamp
    await prisma.user.delete({
      where: { id },
    });

    logger.info('User deleted successfully', {
      deletedUserId: id,
      deletedBy: req.user?.id,
      deletedUserEmail: existingUser.email,
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestedBy: req.user?.id,
      targetUserId: req.params.id,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete user',
    });
  }
});

/**
 * POST /users/:id/reset-password
 * Admin endpoint to reset a user's password
 * Requires: ADMIN role
 */
router.post('/:id/reset-password', requireAuth, requireRole(UserRole.ADMIN), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'New password must be at least 6 characters long',
      });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'User not found',
      });
      return;
    }

    // Hash new password
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password (stored in passwordHash for now)
    await prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    });

    logger.info('Password reset successfully', {
      userId: id,
      resetBy: req.user?.id,
      targetUserEmail: existingUser.email,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    logger.error('Error resetting password', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestedBy: req.user?.id,
      targetUserId: req.params.id,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to reset password',
    });
  }
});

export default router; 