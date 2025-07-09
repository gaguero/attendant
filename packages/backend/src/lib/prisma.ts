import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      {
        emit: 'stdout',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  });

// Middleware: create audit log after user profile updates
prisma.$use(async (params, next) => {
  // Proceed with operation first
  const result = await next(params);

  try {
    if (params.model === 'User' && ['update', 'updateMany'].includes(params.action)) {
      const userId = Array.isArray(result) ? undefined : result?.id;
      if (userId) {
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'UPDATE_PROFILE',
            newData: result,
          },
        });
      }
    }
  } catch (error) {
    logger.error('Audit log middleware error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return result;
});

// Log successful connection
logger.info('Prisma client initialized');

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Prisma client disconnected');
});

export default prisma; 