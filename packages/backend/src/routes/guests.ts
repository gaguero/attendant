import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireStaff } from '../middleware/rbac.js';
import { guestListCache, invalidateGuestsCache } from '../middleware/cache.middleware.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { CreateGuestDto, UpdateGuestDto } from '@attendandt/shared';

const router = Router();

// Middleware to apply to all guest routes
router.use(requireAuth, requireStaff);

/**
 * GET /guests
 * Get a paginated list of guests with caching
 */
router.get('/', guestListCache, async (req, res): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [guests, total] = await Promise.all([
      prisma.guest.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.guest.count({ where }),
    ]);
    res.status(200).json({
      success: true,
      data: guests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Failed to get guests', { error });
    res.status(500).json({ success: false, error: 'Failed to retrieve guests' });
    return;
  }
});

/**
 * POST /guests
 * Create a new guest profile
 */
router.post('/', async (req, res): Promise<void> => {
  try {
    const validatedData = CreateGuestDto.parse(req.body);
    const guest = await prisma.guest.create({
      data: {
        ...validatedData,
        createdById: req.user!.id,
      },
    });
    
    // Invalidate guests cache after creation
    invalidateGuestsCache(req.user!.id);
    
    res.status(201).json({ success: true, data: guest });
  } catch (error) {
    logger.error('Failed to create guest', { error });
    res.status(400).json({ success: false, error: 'Invalid guest data provided' });
    return;
  }
});

/**
 * GET /guests/:id
 * Get a single guest profile by ID
 */
router.get('/:id', async (req, res): Promise<void> => {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id: req.params.id },
    });
    if (!guest) {
      return res.status(404).json({ success: false, error: 'Guest not found' });
    }
    res.status(200).json({ success: true, data: guest });
    return;
  } catch (error) {
    logger.error(`Failed to get guest ${req.params.id}`, { error });
    res.status(500).json({ success: false, error: 'Failed to retrieve guest' });
    return;
  }
});

/**
 * PUT /guests/:id
 * Update a guest's profile
 */
router.put('/:id', async (req, res): Promise<void> => {
  try {
    const validatedData = UpdateGuestDto.parse(req.body);
    const guest = await prisma.guest.update({
      where: { id: req.params.id },
      data: validatedData,
    });
    
    // Invalidate guests cache after update
    invalidateGuestsCache(req.user!.id);
    
    res.status(200).json({ success: true, data: guest });
    return;
  } catch (error) {
    logger.error(`Failed to update guest ${req.params.id}`, { error });
    res.status(400).json({ success: false, error: 'Invalid data for update' });
    return;
  }
});

/**
 * DELETE /guests/:id
 * Delete a guest's profile
 */
router.delete('/:id', async (req, res): Promise<void> => {
  try {
    await prisma.guest.delete({
      where: { id: req.params.id },
    });
    
    // Invalidate guests cache after deletion
    invalidateGuestsCache(req.user!.id);
    
    res.status(204).send();
    return;
  } catch (error) {
    logger.error(`Failed to delete guest ${req.params.id}`, { error });
    res.status(500).json({ success: false, error: 'Failed to delete guest' });
    return;
  }
});

export default router; 