#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function applyPerformanceIndexes() {
  try {
    logger.info('🚀 Applying performance indexes for optimization...');

    // Test connection first
    await prisma.$connect();
    logger.info('✅ Database connection successful');

    // Read the performance indexes SQL file
    const indexesSqlPath = join(__dirname, '..', 'src', 'database', 'performance-indexes.sql');
    const indexesSql = readFileSync(indexesSqlPath, 'utf-8');

    // Split the SQL into individual statements (by double newline or semicolon)
    const statements = indexesSql
      .split(/(?:\r?\n){2,}/) // Split by double newlines
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'))
      .filter(stmt => stmt.toLowerCase().includes('create index'));

    logger.info(`📊 Found ${statements.length} index creation statements`);

    // Apply each index with error handling
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Extract index name from statement for logging
      const indexMatch = statement.match(/CREATE INDEX.*?IF NOT EXISTS\s+(\w+)/i);
      const indexName = indexMatch ? indexMatch[1] : `index_${i + 1}`;

      try {
        logger.info(`🔄 Creating index: ${indexName}...`);
        
        // Remove any trailing semicolon and execute
        const cleanStatement = statement.replace(/;$/, '');
        await prisma.$executeRawUnsafe(cleanStatement);
        
        logger.info(`✅ Index created successfully: ${indexName}`);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('already exists')) {
            logger.info(`ℹ️ Index already exists: ${indexName}`);
          } else {
            logger.warn(`⚠️ Failed to create index ${indexName}:`, error.message);
            // Continue with other indexes rather than failing completely
          }
        } else {
          logger.warn(`⚠️ Unknown error creating index ${indexName}:`, error);
        }
      }
    }

    // Verify some key indexes were created
    await verifyIndexes();

    logger.info('🎉 Performance indexes application completed!');

  } catch (error) {
    logger.error('❌ Performance indexes application failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyIndexes() {
  try {
    logger.info('🔍 Verifying key indexes...');

    // Check for some key indexes
    const indexes = await prisma.$queryRaw<Array<{
      indexname: string;
      tablename: string;
    }>>`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `;

    logger.info(`✅ Found ${indexes.length} custom indexes in database`);
    
    // Log key performance indexes
    const keyIndexes = [
      'idx_guests_profile_completeness_status',
      'idx_users_profile_completeness_role',
      'idx_mews_sync_logs_status_created',
      'idx_audit_logs_user_action_created'
    ];

    const foundIndexes = indexes.filter(idx => 
      keyIndexes.includes(idx.indexname)
    );

    logger.info(`📊 Key performance indexes found: ${foundIndexes.length}/${keyIndexes.length}`);
    foundIndexes.forEach(idx => {
      logger.info(`  ✓ ${idx.indexname} on table ${idx.tablename}`);
    });

    if (foundIndexes.length < keyIndexes.length) {
      const missingIndexes = keyIndexes.filter(keyIdx => 
        !foundIndexes.some(foundIdx => foundIdx.indexname === keyIdx)
      );
      logger.warn(`⚠️ Missing key indexes: ${missingIndexes.join(', ')}`);
    }

  } catch (error) {
    logger.warn('⚠️ Index verification failed:', error);
  }
}

async function getIndexStats() {
  try {
    logger.info('📈 Getting index statistics...');

    const stats = await prisma.$queryRaw<Array<{
      schemaname: string;
      tablename: string;
      indexname: string;
      idx_size: string;
      idx_scan: number;
    }>>`
      SELECT 
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as idx_size,
        idx_scan
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 10;
    `;

    if (stats.length > 0) {
      logger.info('📊 Top 10 custom indexes by size:');
      stats.forEach(stat => {
        logger.info(`  ${stat.indexname} (${stat.idx_size}) - ${stat.idx_scan} scans`);
      });
    }

  } catch (error) {
    logger.warn('⚠️ Could not get index statistics:', error);
  }
}

// Add command line argument support
const args = process.argv.slice(2);
const shouldVerifyOnly = args.includes('--verify-only');
const shouldGetStats = args.includes('--stats');

if (shouldVerifyOnly) {
  // Only verify existing indexes
  prisma.$connect()
    .then(() => verifyIndexes())
    .then(() => prisma.$disconnect())
    .catch(error => {
      logger.error('❌ Verification failed:', error);
      process.exit(1);
    });
} else if (shouldGetStats) {
  // Only get index statistics
  prisma.$connect()
    .then(() => getIndexStats())
    .then(() => prisma.$disconnect())
    .catch(error => {
      logger.error('❌ Stats retrieval failed:', error);
      process.exit(1);
    });
} else {
  // Run the full index application
  applyPerformanceIndexes();
}