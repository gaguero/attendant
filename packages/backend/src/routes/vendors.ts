import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { requireAuth } from '../middleware/auth.js';
import { CreateVendorDto, UpdateVendorDto } from '@attendandt/shared';
import { VendorCategory } from '@attendandt/shared';

const router = Router();

// GET /vendors - list vendors
router.get('/', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const vendors = await prisma.vendor.findMany();
    res.json({ success: true, data: vendors });
    return;
  } catch (error) {
    logger.error('Failed to list vendors', { error });
    res.status(500).json({ success: false, error: 'Failed to list vendors' });
    return;
  }
});

// POST /vendors - create vendor
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = CreateVendorDto.parse(req.body);
    const vendor = await prisma.vendor.create({
      data: {
        ...validated,
        category: validated.category ?? VendorCategory.OTHER,
        createdById: req.user!.id,
      },
    });
    res.status(201).json({ success: true, data: vendor });
    return;
  } catch (error) {
    logger.error('Failed to create vendor', { error });
    res.status(400).json({ success: false, error: (error as Error).message });
    return;
  }
});

// GET /vendors/:id
router.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id } });
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }
    res.json({ success: true, data: vendor });
    return;
  } catch (error) {
    logger.error('Failed to get vendor', { error });
    res.status(500).json({ success: false, error: 'Failed to get vendor' });
    return;
  }
});

// PUT /vendors/:id
router.put('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = UpdateVendorDto.parse(req.body);
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: validated,
    });
    res.json({ success: true, data: vendor });
    return;
  } catch (error) {
    logger.error('Failed to update vendor', { error });
    res.status(400).json({ success: false, error: (error as Error).message });
    return;
  }
});

// DELETE /vendors/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.vendor.delete({ where: { id: req.params.id } });
    res.status(204).send();
    return;
  } catch (error) {
    logger.error('Failed to delete vendor', { error });
    res.status(500).json({ success: false, error: 'Failed to delete vendor' });
    return;
  }
});

export default router; 