#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger.js';

const prisma = new PrismaClient();

async function applyMigrations() {
  try {
    logger.info('🚀 Applying database migrations manually...');

    // Test connection first
    await prisma.$connect();
    logger.info('✅ Database connection successful');

    // Check current schema
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;
    
    logger.info('Current users table columns:', columns);

    // Check if sync_status column exists
    const hasSyncStatus = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'sync_status';
    `;

    if (!hasSyncStatus || (hasSyncStatus as any[]).length === 0) {
      logger.info('🔄 Adding missing sync_status column...');
      
      // Add sync_status column
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ADD COLUMN "sync_status" "sync_status" NOT NULL DEFAULT 'PENDING';
      `;
      
      logger.info('✅ sync_status column added');
    } else {
      logger.info('✅ sync_status column already exists');
    }

    // Check if profile_completeness column exists
    const hasProfileCompleteness = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'profile_completeness';
    `;

    if (!hasProfileCompleteness || (hasProfileCompleteness as any[]).length === 0) {
      logger.info('🔄 Adding missing profile_completeness column...');
      
      // Add profile_completeness column
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ADD COLUMN "profile_completeness" INTEGER NOT NULL DEFAULT 0;
      `;
      
      logger.info('✅ profile_completeness column added');
    } else {
      logger.info('✅ profile_completeness column already exists');
    }

    // Check if last_completeness_check column exists
    const hasLastCompletenessCheck = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'last_completeness_check';
    `;

    if (!hasLastCompletenessCheck || (hasLastCompletenessCheck as any[]).length === 0) {
      logger.info('🔄 Adding missing last_completeness_check column...');
      
      // Add last_completeness_check column
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ADD COLUMN "last_completeness_check" TIMESTAMP(3);
      `;
      
      logger.info('✅ last_completeness_check column added');
    } else {
      logger.info('✅ last_completeness_check column already exists');
    }

    // Test user creation to verify schema is now correct
    logger.info('🧪 Testing user creation...');
    const testUser = await prisma.user.create({
      data: {
        email: 'migration-test@example.com',
        firstName: 'Migration',
        lastName: 'Test',
        role: 'STAFF',
        passwordHash: 'test-hash-for-migration',
      },
    });

    logger.info('✅ Test user created successfully:', { userId: testUser.id });

    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });

    logger.info('✅ Test user cleaned up');
    logger.info('🎉 Database migrations applied successfully!');

  } catch (error) {
    logger.error('❌ Migration application failed:', error);
    
    if (error instanceof Error && error.message.includes('type "sync_status" does not exist')) {
      logger.error('🔍 The sync_status enum type does not exist. Creating it...');
      
      try {
        // Create the sync_status enum type
        await prisma.$executeRaw`
          CREATE TYPE "sync_status" AS ENUM ('PENDING', 'SYNCED', 'FAILED', 'CONFLICT');
        `;
        logger.info('✅ sync_status enum type created');
        
        // Retry the migration
        logger.info('🔄 Retrying migration...');
        await applyMigrations();
        return;
      } catch (enumError) {
        logger.error('❌ Failed to create sync_status enum:', enumError);
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
applyMigrations(); 