import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';
import { RuleType } from '@prisma/client';
import { BusinessRulesService } from '../services/businessRules.service';

const router = Router();
const businessRulesService = new BusinessRulesService(prisma);

/**
 * GET /api/business-rules
 * Get all business rules
 */
router.get('/', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { entityType, isActive } = req.query;
    
    const where: any = {};
    if (entityType) where.entityType = entityType as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const rules = await prisma.businessRule.findMany({
      where,
      orderBy: [
        { entityType: 'asc' },
        { priority: 'desc' },
        { name: 'asc' }
      ]
    });

    res.json(rules);
  } catch (error) {
    console.error('Error fetching business rules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/business-rules/:entityType
 * Get business rules for a specific entity type
 */
router.get('/:entityType', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const { entityType } = req.params;
    
    const rules = await businessRulesService.getRulesForEntity(entityType);
    res.json(rules);
  } catch (error) {
    console.error('Error fetching business rules for entity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/business-rules
 * Create a new business rule
 */
router.post('/', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const {
      name,
      description,
      entityType,
      field,
      ruleType,
      ruleConfig,
      isActive = true,
      priority = 0
    } = req.body;

    // Validate required fields
    if (!name || !entityType || !field || !ruleType || !ruleConfig) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, entityType, field, ruleType, ruleConfig' 
      });
    }

    // Validate rule type
    if (!Object.values(RuleType).includes(ruleType)) {
      return res.status(400).json({ 
        error: `Invalid rule type. Must be one of: ${Object.values(RuleType).join(', ')}` 
      });
    }

    const rule = await businessRulesService.createRule({
      name,
      description,
      entityType,
      field,
      ruleType,
      ruleConfig,
      isActive,
      priority
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating business rule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/business-rules/:id
 * Update a business rule
 */
router.put('/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate rule type if provided
    if (updateData.ruleType && !Object.values(RuleType).includes(updateData.ruleType)) {
      return res.status(400).json({ 
        error: `Invalid rule type. Must be one of: ${Object.values(RuleType).join(', ')}` 
      });
    }

    const rule = await businessRulesService.updateRule(id, updateData);
    res.json(rule);
  } catch (error) {
    console.error('Error updating business rule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/business-rules/:id
 * Delete a business rule
 */
router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    await businessRulesService.deleteRule(id);
    res.json({ message: 'Business rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting business rule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/business-rules/validate
 * Validate an entity against business rules
 */
router.post('/validate', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const { entityType, entityData } = req.body;

    if (!entityType || !entityData) {
      return res.status(400).json({ 
        error: 'Missing required fields: entityType, entityData' 
      });
    }

    const validation = await businessRulesService.validateEntity(entityType, entityData);
    res.json(validation);
  } catch (error) {
    console.error('Error validating entity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/business-rules/initialize
 * Initialize default business rules
 */
router.post('/initialize', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    await businessRulesService.createDefaultRules();
    
    res.json({ 
      message: 'Default business rules initialized successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error initializing default business rules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/business-rules/rule-types
 * Get available rule types
 */
router.get('/rule-types', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const ruleTypes = Object.values(RuleType).map(type => ({
      value: type,
      label: type.charAt(0) + type.slice(1).toLowerCase(),
      description: getRuleTypeDescription(type)
    }));

    res.json(ruleTypes);
  } catch (error) {
    console.error('Error fetching rule types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/business-rules/entity-types
 * Get available entity types
 */
router.get('/entity-types', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const entityTypes = [
      { value: 'User', label: 'User', description: 'Staff and admin users' },
      { value: 'Guest', label: 'Guest', description: 'Hotel guests and customers' },
      { value: 'Vendor', label: 'Vendor', description: 'Service providers and vendors' }
    ];

    res.json(entityTypes);
  } catch (error) {
    console.error('Error fetching entity types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/business-rules/statistics
 * Get business rules statistics
 */
router.get('/statistics', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [
      totalRules,
      activeRules,
      rulesByEntityType,
      rulesByType
    ] = await Promise.all([
      prisma.businessRule.count(),
      prisma.businessRule.count({ where: { isActive: true } }),
      prisma.businessRule.groupBy({
        by: ['entityType'],
        _count: { id: true }
      }),
      prisma.businessRule.groupBy({
        by: ['ruleType'],
        _count: { id: true }
      })
    ]);

    res.json({
      total: totalRules,
      active: activeRules,
      inactive: totalRules - activeRules,
      byEntityType: rulesByEntityType.reduce((acc, item) => {
        acc[item.entityType] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      byRuleType: rulesByType.reduce((acc, item) => {
        acc[item.ruleType] = item._count.id;
        return acc;
      }, {} as Record<string, number>)
    });
  } catch (error) {
    console.error('Error fetching business rules statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get description for rule type
 */
function getRuleTypeDescription(ruleType: RuleType): string {
  const descriptions = {
    [RuleType.REQUIRED]: 'Field must have a value',
    [RuleType.FORMAT]: 'Field must match specific format (length, pattern)',
    [RuleType.RANGE]: 'Field must be within specified numeric range',
    [RuleType.CUSTOM]: 'Custom validation logic (email, phone, URL, etc.)'
  };
  
  return descriptions[ruleType] || 'Custom validation rule';
}

export default router; 