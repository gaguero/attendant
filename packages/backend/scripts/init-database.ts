#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger.js';

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    logger.info('Starting database initialization...');

    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connection successful');

    // Check if users table exists and has the correct structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;
    
    logger.info('Current users table structure:', tableInfo);

    // Check if required columns exist
    const hasPasswordHash = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_hash';
    `;

    if (!hasPasswordHash || (hasPasswordHash as any[]).length === 0) {
      logger.warn('⚠️ password_hash column missing. Database schema may be outdated.');
      logger.info('Please run: pnpm db:migrate to apply latest migrations');
    } else {
      logger.info('✅ Database schema appears to be up to date');
    }

    // Test user creation to verify schema compatibility
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STAFF',
        passwordHash: 'test-hash',
      },
    });

    logger.info('✅ Test user created successfully:', { userId: testUser.id });

    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });

    logger.info('✅ Test user cleaned up');

    logger.info('🎉 Database initialization completed successfully');

  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    
    if (error instanceof Error && error.message.includes('relation "users" does not exist')) {
      logger.error('Database tables do not exist. Please run migrations first:');
      logger.error('pnpm db:migrate');
    } else if (error instanceof Error && error.message.includes('column "password_hash" does not exist')) {
      logger.error('Database schema is outdated. Please run migrations:');
      logger.error('pnpm db:migrate');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initDatabase(); 