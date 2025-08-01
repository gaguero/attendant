import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { CompletenessService } from '../services/completeness.service.js';
import { BusinessRulesService } from '../services/businessRules.service.js';

const router: Router = Router();
const completenessService = new CompletenessService(prisma);
const businessRulesService = new BusinessRulesService(prisma);

/**
 * GET /api/completeness/config/:entityType
 * Get completeness configuration for an entity type
 */
router.get('/config/:entityType', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const { entityType } = req.params;
    
    const config = await prisma.completenessConfig.findUnique({
      where: { entityType }
    });

    if (!config) {
      return res.status(404).json({ error: 'Completeness configuration not found' });
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching completeness config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/completeness/config/:entityType
 * Update completeness configuration for an entity type
 */
router.put('/config/:entityType', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { entityType } = req.params;
    const { fieldWeights, requiredFields, optionalFields } = req.body;

    const config = await prisma.completenessConfig.upsert({
      where: { entityType },
      update: {
        fieldWeights,
        requiredFields,
        optionalFields
      },
      create: {
        entityType,
        fieldWeights,
        requiredFields,
        optionalFields
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Error updating completeness config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/completeness/guests
 * Get all guests with their completeness scores
 */
router.get('/guests', requireAuth, requireRole(['ADMIN', 'STAFF', 'CONCIERGE']), async (req, res) => {
  try {
    const { page = 1, limit = 20, minScore, maxScore } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (minScore !== undefined) where.profileCompleteness = { gte: Number(minScore) };
    if (maxScore !== undefined) {
      where.profileCompleteness = { 
        ...where.profileCompleteness, 
        lte: Number(maxScore) 
      };
    }

    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileCompleteness: true,
          lastCompletenessCheck: true,
          dataGaps: true,
          vipScore: true,
          status: true,
          createdAt: true
        },
        orderBy: { profileCompleteness: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.guest.count({ where })
    ]);

    res.json({
      guests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching guests completeness:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/completeness/guests/:id
 * Get completeness details for a specific guest
 */
router.get('/guests/:id', requireAuth, requireRole(['ADMIN', 'STAFF', 'CONCIERGE']), async (req, res) => {
  try {
    const { id } = req.params;

    const guest = await prisma.guest.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        stateOrProvince: true,
        postalCode: true,
        country: true,
        preferences: true,
        profileCompleteness: true,
        lastCompletenessCheck: true,
        dataGaps: true,
        vipScore: true,
        status: true
      }
    });

    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    // Calculate fresh completeness score
    const completeness = await completenessService.calculateGuestCompleteness(guest as any);

    res.json({
      guest,
      completeness,
      recommendations: generateRecommendations(completeness.gaps)
    });
  } catch (error) {
    console.error('Error fetching guest completeness:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/completeness/users
 * Get all users with their completeness scores
 */
router.get('/users', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 20, minScore, maxScore } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (minScore !== undefined) where.profileCompleteness = { gte: Number(minScore) };
    if (maxScore !== undefined) {
      where.profileCompleteness = { 
        ...where.profileCompleteness, 
        lte: Number(maxScore) 
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          profileCompleteness: true,
          lastCompletenessCheck: true,
          createdAt: true
        },
        orderBy: { profileCompleteness: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users completeness:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/completeness/recalculate
 * Recalculate completeness scores for all entities
 */
router.post('/recalculate', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    await completenessService.updateAllCompletenessScores();
    
    res.json({ 
      message: 'Completeness scores recalculated successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error recalculating completeness scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/completeness/statistics
 * Get completeness statistics
 */
router.get('/statistics', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const [
      guestStats,
      userStats,
      lowCompletenessGuests,
      lowCompletenessUsers
    ] = await Promise.all([
      prisma.guest.aggregate({
        _avg: { profileCompleteness: true },
        _min: { profileCompleteness: true },
        _max: { profileCompleteness: true },
        _count: { id: true }
      }),
      prisma.user.aggregate({
        _avg: { profileCompleteness: true },
        _min: { profileCompleteness: true },
        _max: { profileCompleteness: true },
        _count: { id: true }
      }),
      prisma.guest.count({
        where: { profileCompleteness: { lt: 50 } }
      }),
      prisma.user.count({
        where: { profileCompleteness: { lt: 50 } }
      })
    ]);

    res.json({
      guests: {
        average: guestStats._avg.profileCompleteness || 0,
        minimum: guestStats._min.profileCompleteness || 0,
        maximum: guestStats._max.profileCompleteness || 0,
        total: guestStats._count.id,
        lowCompleteness: lowCompletenessGuests
      },
      users: {
        average: userStats._avg.profileCompleteness || 0,
        minimum: userStats._min.profileCompleteness || 0,
        maximum: userStats._max.profileCompleteness || 0,
        total: userStats._count.id,
        lowCompleteness: lowCompletenessUsers
      }
    });
  } catch (error) {
    console.error('Error fetching completeness statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Generate recommendations based on data gaps
 */
function generateRecommendations(gaps: string[]): string[] {
  const recommendations: string[] = [];
  
  if (gaps.includes('phone')) {
    recommendations.push('Add phone number for better guest communication');
  }
  
  if (gaps.includes('dateOfBirth')) {
    recommendations.push('Add date of birth for personalized birthday services');
  }
  
  if (gaps.includes('addressLine1')) {
    recommendations.push('Add address information for billing and delivery services');
  }
  
  if (gaps.includes('preferences')) {
    recommendations.push('Add guest preferences for personalized service recommendations');
  }
  
  if (gaps.includes('city') || gaps.includes('country')) {
    recommendations.push('Add location information for local service recommendations');
  }

  return recommendations;
}

export default router; 