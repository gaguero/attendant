import app from './app.js';
import { logger } from './lib/logger.js';
import { serverConfig } from './config/index.js';
import { prisma } from './lib/prisma.js';
import { mewsWebSocketClient } from './lib/mews.ws.js';

const PORT = serverConfig.port;

// Initialize Mews WebSocket client
mewsWebSocketClient.connect();

// Start the HTTP server
const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: serverConfig.nodeEnv,
    frontendUrl: serverConfig.frontendUrl,
    timestamp: new Date().toISOString(),
  });
  
  logger.info('Server endpoints available:', {
    health: `http://localhost:${PORT}/health`,
    api: `http://localhost:${PORT}/api/v1`,
  });
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info('Received shutdown signal', { signal });
  
  // Close HTTP server
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      // Close database connection
      await prisma.$disconnect();
      logger.info('Database connection closed');
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', { error });
      process.exit(1);
    }
  });
  
  // Force close after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { reason, promise });
  gracefulShutdown('unhandledRejection');
});

export default server; 