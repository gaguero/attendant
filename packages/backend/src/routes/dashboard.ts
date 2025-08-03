import express from 'express';
import { PrismaClient } from '@prisma/client';
import { DashboardService } from '../services/dashboard.service.js';
import { OptimizedDashboardService } from '../services/optimized-dashboard.service.js';
import { dashboardCache, getCacheStats, getCacheHealth } from '../middleware/cache.middleware.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

const router: express.Router = express.Router();
const prisma = new PrismaClient();
const dashboardService = new DashboardService(prisma);
const optimizedDashboardService = new OptimizedDashboardService(prisma);

/**
 * GET /api/dashboard
 * Get comprehensive dashboard data with caching
 */
router.get('/', requireAuth, dashboardCache, async (req, res) => {
  try {
    const userId = req.user!.id;
    const dashboardData = await optimizedDashboardService.getDashboardData(userId);
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    // Fallback to legacy service if optimized service fails
    try {
      const fallbackData = await dashboardService.getDashboardData();
      res.json({
        success: true,
        data: fallbackData,
        fallback: true
      });
    } catch (fallbackError) {
      logger.error('Fallback dashboard service also failed:', fallbackError);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard data'
      });
    }
  }
});

/**
 * GET /api/dashboard/metrics
 * Get key dashboard metrics with caching
 */
router.get('/metrics', requireAuth, dashboardCache, async (_req, res) => {
  try {
    const metrics = await dashboardService.getMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting dashboard metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard metrics'
    });
  }
});

/**
 * GET /api/dashboard/stats
 * Get real-time statistics
 */
router.get('/stats', async (_req, res) => {
  try {
    const stats = await dashboardService.getRealTimeStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting real-time stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get real-time stats'
    });
  }
});

/**
 * GET /api/dashboard/alerts
 * Get recent alerts
 */
router.get('/alerts', async (_req, res) => {
  try {
    const alerts = await dashboardService.getRecentAlerts();
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Error getting alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get alerts'
    });
  }
});

/**
 * PUT /api/dashboard/alerts/:id/read
 * Mark alert as read
 */
router.put('/alerts/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    dashboardService.markAlertAsRead(id);
    
    res.json({
      success: true,
      message: 'Alert marked as read'
    });
  } catch (error) {
    logger.error('Error marking alert as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark alert as read'
    });
  }
});

/**
 * GET /api/dashboard/sync-status
 * Get sync connection status
 */
router.get('/sync-status', async (_req, res) => {
  try {
    const syncStatus = await dashboardService.getSyncStatus();
    
    res.json({
      success: true,
      data: syncStatus
    });
  } catch (error) {
    logger.error('Error getting sync status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sync status'
    });
  }
});

/**
 * POST /api/dashboard/alerts
 * Add a new alert (for testing purposes)
 */
router.post('/alerts', async (req, res) => {
  try {
    const { type, title, message, priority, entityType, entityId } = req.body;
    
    dashboardService.addAlert({
      type,
      title,
      message,
      priority,
      entityType,
      entityId
    });
    
    res.status(201).json({
      success: true,
      message: 'Alert created successfully'
    });
  } catch (error) {
    logger.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create alert'
    });
  }
});

/**
 * DELETE /api/dashboard/alerts/clear
 * Clear old alerts
 */
router.delete('/alerts/clear', async (_req, res) => {
  try {
    dashboardService.clearOldAlerts();
    
    res.json({
      success: true,
      message: 'Old alerts cleared successfully'
    });
  } catch (error) {
    logger.error('Error clearing old alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear old alerts'
    });
  }
});

/**
 * GET /api/dashboard/health
 * Get dashboard health status
 */
router.get('/health', async (_req, res) => {
  try {
    const [metrics, syncStatus] = await Promise.all([
      dashboardService.getMetrics(),
      dashboardService.getSyncStatus()
    ]);
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalEntities: metrics.totalGuests + metrics.totalUsers + metrics.totalVendors,
        averageCompleteness: metrics.averageCompletenessScore,
        syncSuccessRate: metrics.syncSuccessRate
      },
      sync: {
        isConnected: syncStatus.isConnected,
        pendingOperations: syncStatus.pendingOperations,
        failedOperations: syncStatus.failedOperations
      }
    };
    
    res.json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    logger.error('Error getting dashboard health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard health'
    });
  }
});

/**
 * GET /api/dashboard/cache/stats
 * Get cache performance statistics (admin only)
 */
router.get('/cache/stats', requireAuth, async (req, res) => {
  try {
    // Only allow admin users to access cache stats
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }

    const cacheStats = getCacheStats();
    
    return res.json({
      success: true,
      data: cacheStats
    });
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics'
    });
  }
});

/**
 * GET /api/dashboard/cache/health
 * Get cache health status (admin only)
 */
router.get('/cache/health', requireAuth, async (req, res) => {
  try {
    // Only allow admin users to access cache health
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }

    const cacheHealth = getCacheHealth();
    
    return res.json({
      success: true,
      data: cacheHealth
    });
  } catch (error) {
    logger.error('Error getting cache health:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get cache health'
    });
  }
});

export default router; 