#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { CompletenessService } from '../src/services/completeness.service.js';
import { BusinessRulesService } from '../src/services/businessRules.service.js';
import { logger } from '../src/lib/logger.js';

const prisma = new PrismaClient();
const completenessService = new CompletenessService(prisma);
const businessRulesService = new BusinessRulesService(prisma);

async function initializePhase2() {
  try {
    logger.info('Starting Phase 2 initialization...');

    // Step 1: Initialize default business rules
    logger.info('Initializing default business rules...');
    await businessRulesService.createDefaultRules();
    logger.info('✅ Default business rules initialized');

    // Step 2: Initialize default completeness configurations
    logger.info('Initializing default completeness configurations...');
    
    const defaultConfigs = [
      {
        entityType: 'User',
        fieldWeights: {
          email: 20,
          firstName: 15,
          lastName: 15,
          phone: 10,
          addressLine1: 8,
          city: 8,
          country: 8,
          preferences: 6,
          notes: 5,
          bio: 5
        },
        requiredFields: ['email', 'firstName', 'lastName'],
        optionalFields: ['phone', 'addressLine1', 'city', 'country', 'preferences', 'notes', 'bio']
      },
      {
        entityType: 'Guest',
        fieldWeights: {
          email: 20,
          firstName: 15,
          lastName: 15,
          phone: 12,
          dateOfBirth: 10,
          addressLine1: 8,
          city: 8,
          country: 8,
          preferences: 4
        },
        requiredFields: ['email', 'firstName', 'lastName'],
        optionalFields: ['phone', 'dateOfBirth', 'addressLine1', 'city', 'country', 'preferences']
      },
      {
        entityType: 'Vendor',
        fieldWeights: {
          name: 25,
          contactPerson: 20,
          phone: 15,
          email: 15,
          category: 10,
          servicesOffered: 10,
          website: 5
        },
        requiredFields: ['name', 'contactPerson'],
        optionalFields: ['phone', 'email', 'category', 'servicesOffered', 'website']
      }
    ];

    for (const config of defaultConfigs) {
      await prisma.completenessConfig.upsert({
        where: { entityType: config.entityType },
        update: {
          fieldWeights: config.fieldWeights,
          requiredFields: config.requiredFields,
          optionalFields: config.optionalFields
        },
        create: {
          entityType: config.entityType,
          fieldWeights: config.fieldWeights,
          requiredFields: config.requiredFields,
          optionalFields: config.optionalFields
        }
      });
    }
    logger.info('✅ Default completeness configurations initialized');

    // Step 3: Calculate initial completeness scores for existing data
    logger.info('Calculating initial completeness scores...');
    await completenessService.updateAllCompletenessScores();
    logger.info('✅ Initial completeness scores calculated');

    // Step 4: Display statistics
    logger.info('Generating initialization statistics...');
    
    const [
      totalRules,
      activeRules,
      totalConfigs,
      totalGuests,
      totalUsers,
      averageGuestCompleteness,
      averageUserCompleteness
    ] = await Promise.all([
      prisma.businessRule.count(),
      prisma.businessRule.count({ where: { isActive: true } }),
      prisma.completenessConfig.count(),
      prisma.guest.count(),
      prisma.user.count(),
      prisma.guest.aggregate({ _avg: { profileCompleteness: true } }),
      prisma.user.aggregate({ _avg: { profileCompleteness: true } })
    ]);

    logger.info('📊 Phase 2 Initialization Statistics:', {
      businessRules: {
        total: totalRules,
        active: activeRules,
        inactive: totalRules - activeRules
      },
      completenessConfigs: totalConfigs,
      entities: {
        guests: totalGuests,
        users: totalUsers
      },
      averageCompleteness: {
        guests: averageGuestCompleteness._avg.profileCompleteness || 0,
        users: averageUserCompleteness._avg.profileCompleteness || 0
      }
    });

    logger.info('🎉 Phase 2 initialization completed successfully!');

  } catch (error) {
    logger.error('❌ Phase 2 initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializePhase2(); 