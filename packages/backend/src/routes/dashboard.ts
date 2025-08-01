import express from 'express';
import { PrismaClient } from '@prisma/client';
import { DashboardService } from '../services/dashboard.service.js';
import { logger } from '../lib/logger.js';

const router = express.Router();
const prisma = new PrismaClient();
const dashboardService = new DashboardService(prisma);

/**
 * GET /api/dashboard
 * Get comprehensive dashboard data
 */
router.get('/', async (req, res) => {
  try {
    const dashboardData = await dashboardService.getDashboardData();
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data'
    });
  }
});

/**
 * GET /api/dashboard/metrics
 * Get key dashboard metrics
 */
router.get('/metrics', async (req, res) => {
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
router.get('/stats', async (req, res) => {
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
router.get('/alerts', async (req, res) => {
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
router.get('/sync-status', async (req, res) => {
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
router.delete('/alerts/clear', async (req, res) => {
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
router.get('/health', async (req, res) => {
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

export default router; 