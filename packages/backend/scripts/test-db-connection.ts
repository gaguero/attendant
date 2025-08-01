#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger.js';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    logger.info('🔌 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    logger.info('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    logger.info('✅ Database query successful:', result);
    
    // Check if users table exists
    try {
      const userCount = await prisma.user.count();
      logger.info(`✅ Users table exists with ${userCount} users`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('relation "users" does not exist')) {
        logger.warn('⚠️ Users table does not exist - migrations needed');
      } else {
        throw error;
      }
    }
    
    logger.info('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Can\'t reach database server')) {
        logger.error('🔍 Possible causes:');
        logger.error('   1. Supabase database is paused (free tier)');
        logger.error('   2. Database URL is incorrect');
        logger.error('   3. Network connectivity issues');
        logger.error('   4. Firewall blocking connection');
        logger.error('');
        logger.error('💡 Solutions:');
        logger.error('   1. Check Supabase dashboard and resume database if paused');
        logger.error('   2. Verify DATABASE_URL in .env file');
        logger.error('   3. Check network connection');
        logger.error('   4. Try connecting from a different network');
      } else if (error.message.includes('authentication failed')) {
        logger.error('🔍 Authentication failed - check database credentials');
      } else if (error.message.includes('database does not exist')) {
        logger.error('🔍 Database does not exist - check database name in URL');
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection(); 