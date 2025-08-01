#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger.js';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    logger.info('🚀 Starting database setup...');

    // Step 1: Generate Prisma client
    logger.info('📦 Generating Prisma client...');
    execSync('pnpm db:generate', { 
      cwd: join(__dirname, '..'),
      stdio: 'inherit' 
    });
    logger.info('✅ Prisma client generated');

    // Step 2: Test database connection
    logger.info('🔌 Testing database connection...');
    await prisma.$connect();
    logger.info('✅ Database connection successful');

    // Step 3: Check if migrations need to be applied
    logger.info('🔍 Checking database schema...');
    
    try {
      // Try to query the users table to see if it exists
      const userCount = await prisma.user.count();
      logger.info(`✅ Users table exists with ${userCount} users`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('relation "users" does not exist')) {
        logger.warn('⚠️ Users table does not exist. Running migrations...');
        await runMigrations();
      } else {
        throw error;
      }
    }

    // Step 4: Check for required columns
    logger.info('🔍 Checking required columns...');
    const hasPasswordHash = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_hash';
    `;

    if (!hasPasswordHash || (hasPasswordHash as any[]).length === 0) {
      logger.warn('⚠️ password_hash column missing. Running migrations...');
      await runMigrations();
    } else {
      logger.info('✅ Required columns exist');
    }

    // Step 5: Test user creation
    logger.info('🧪 Testing user creation...');
    const testUser = await prisma.user.create({
      data: {
        email: 'setup-test@example.com',
        firstName: 'Setup',
        lastName: 'Test',
        role: 'STAFF',
        passwordHash: 'test-hash-for-setup',
      },
    });

    logger.info('✅ Test user created successfully:', { userId: testUser.id });

    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });

    logger.info('✅ Test user cleaned up');

    logger.info('🎉 Database setup completed successfully!');
    logger.info('📋 Next steps:');
    logger.info('   1. Start the backend server: pnpm dev');
    logger.info('   2. Start the frontend: cd ../frontend && pnpm dev');
    logger.info('   3. Test registration and login');

  } catch (error) {
    logger.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function runMigrations() {
  try {
    logger.info('🔄 Running database migrations...');
    
    // Run migrations
    execSync('pnpm db:migrate', { 
      cwd: join(__dirname, '..'),
      stdio: 'inherit' 
    });
    
    logger.info('✅ Migrations completed successfully');
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the setup
setupDatabase(); 