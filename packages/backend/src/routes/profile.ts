import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/index.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { UpdateProfileDto, ProfileDto } from '@attendandt/shared';
import { profileUpdateLimiter } from '../middleware/rateLimit.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /me
 * Get current user's profile
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, bio: true, avatarUrl: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        stateOrProvince: true,
        postalCode: true,
        country: true,
        preferences: true,
        notes: true,
        theme: true,
      },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Not Found', message: 'User profile not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error('Get profile error', { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch profile' });
  }
});

/**
 * PUT /me
 * Update current user's profile
 */
router.put('/me', requireAuth, profileUpdateLimiter, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const validated = UpdateProfileDto.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: validated,
      select: { id: true, email: true, firstName: true, lastName: true, bio: true, avatarUrl: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        stateOrProvince: true,
        postalCode: true,
        country: true,
        preferences: true,
        notes: true,
        theme: true,
      },
    });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    logger.error('Update profile error', { error: error instanceof Error ? error.message : String(error) });
    if (error instanceof Error && error.message.includes('validation')) {
      return res.status(400).json({ success: false, error: 'Validation Error', message: error.message });
    }
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to update profile' });
  }
});

/**
 * POST /me/avatar
 * Upload current user's avatar
 */
router.post('/me/avatar', requireAuth, upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'No file uploaded' });
    }
    const file = req.file;
    const ext = path.extname(file.originalname);
    const fileName = `${req.user!.id}-${Date.now()}${ext}`;
    const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey!);
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });
    if (uploadError) throw uploadError;
    const { data: { publicUrl }, error: urlError } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(fileName);
    if (urlError) throw urlError;
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatarUrl: publicUrl },
      select: { id: true, avatarUrl: true },
    });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    logger.error('Upload avatar error', { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to upload avatar' });
  }
});

export default router; 