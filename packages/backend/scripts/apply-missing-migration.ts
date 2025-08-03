import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger.js';

const prisma = new PrismaClient();

async function applyMissingMigration() {
  try {
    logger.info('Applying missing profile completeness migration...');
    
    // Add profile completeness fields to users table
    await prisma.$executeRaw`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "profile_completeness" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "last_completeness_check" TIMESTAMP(3)
    `;
    
    // Add profile completeness fields to guests table
    await prisma.$executeRaw`
      ALTER TABLE "guests"
      ADD COLUMN IF NOT EXISTS "profile_completeness" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "last_completeness_check" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "data_gaps" JSONB
    `;
    
    logger.info('Migration applied successfully!');
    
    // Test the connection by running a simple query
    const userCount = await prisma.user.count();
    logger.info(`Database connection test successful. Found ${userCount} users.`);
    
  } catch (error) {
    logger.error('Failed to apply migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMissingMigration()
  .then(() => {
    logger.info('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Migration script failed:', error);
    process.exit(1);
  }); 