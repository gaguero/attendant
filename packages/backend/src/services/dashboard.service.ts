import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger.js';
import { CompletenessService } from './completeness.service.js';
import { EnhancedSyncService } from './enhancedSync.service.js';

export interface DashboardMetrics {
  totalGuests: number;
  totalUsers: number;
  totalVendors: number;
  averageCompletenessScore: number;
  syncSuccessRate: number;
  activeSyncs: number;
  pendingTasks: number;
  dataQualityIssues: number;
}

export interface RealTimeStats {
  guests: {
    total: number;
    withCompleteProfiles: number;
    withIncompleteProfiles: number;
    averageCompleteness: number;
  };
  users: {
    total: number;
    withCompleteProfiles: number;
    withIncompleteProfiles: number;
    averageCompleteness: number;
  };
  vendors: {
    total: number;
    withCompleteProfiles: number;
    withIncompleteProfiles: number;
    averageCompleteness: number;
  };
  sync: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    successRate: number;
    lastSyncTime: Date | null;
  };
  dataQuality: {
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
    topIssues: Array<{ type: string; count: number }>;
  };
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DashboardData {
  metrics: DashboardMetrics;
  realTimeStats: RealTimeStats;
  recentAlerts: Alert[];
  syncStatus: {
    isConnected: boolean;
    lastHeartbeat: Date | null;
    pendingOperations: number;
    failedOperations: number;
  };
}

export class DashboardService {
  private prisma: PrismaClient;
  private completenessService: CompletenessService;
  private enhancedSyncService: EnhancedSyncService;
  private alerts: Alert[] = [];
  private syncConnectionStatus = false;
  private lastHeartbeat: Date | null = null;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.completenessService = new CompletenessService(prisma);
    this.enhancedSyncService = new EnhancedSyncService(prisma);
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    const fallbackData: DashboardData = {
      metrics: {
        totalGuests: 0,
        totalUsers: 0,
        totalVendors: 0,
        averageCompletenessScore: 0,
        syncSuccessRate: 100,
        activeSyncs: 0,
        pendingTasks: 0,
        dataQualityIssues: 0
      },
      realTimeStats: {
        guests: { total: 0, withCompleteProfiles: 0, withIncompleteProfiles: 0, averageCompleteness: 0 },
        users: { total: 0, withCompleteProfiles: 0, withIncompleteProfiles: 0, averageCompleteness: 0 },
        vendors: { total: 0, withCompleteProfiles: 0, withIncompleteProfiles: 0, averageCompleteness: 0 },
        sync: { totalOperations: 0, successfulOperations: 0, failedOperations: 0, successRate: 100, lastSyncTime: null },
        dataQuality: { totalIssues: 0, criticalIssues: 0, warnings: 0, topIssues: [] }
      },
      recentAlerts: [],
      syncStatus: {
        isConnected: false,
        lastHeartbeat: null,
        pendingOperations: 0,
        failedOperations: 0
      }
    };

    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const [metricsResult, realTimeStatsResult, recentAlertsResult, syncStatusResult] = await Promise.allSettled([
        this.getMetrics(),
        this.getRealTimeStats(),
        this.getRecentAlerts(),
        this.getSyncStatus()
      ]);

      return {
        metrics: metricsResult.status === 'fulfilled' ? metricsResult.value : fallbackData.metrics,
        realTimeStats: realTimeStatsResult.status === 'fulfilled' ? realTimeStatsResult.value : fallbackData.realTimeStats,
        recentAlerts: recentAlertsResult.status === 'fulfilled' ? recentAlertsResult.value : fallbackData.recentAlerts,
        syncStatus: syncStatusResult.status === 'fulfilled' ? syncStatusResult.value : fallbackData.syncStatus
      };

    } catch (error) {
      logger.error('Critical error in getDashboardData, using fallback data:', error);
      return fallbackData;
    }
  }

  /**
   * Get key dashboard metrics
   */
  async getMetrics(): Promise<DashboardMetrics> {
    const fallbackMetrics: DashboardMetrics = {
      totalGuests: 0,
      totalUsers: 0,
      totalVendors: 0,
      averageCompletenessScore: 0,
      syncSuccessRate: 100,
      activeSyncs: 0,
      pendingTasks: 0,
      dataQualityIssues: 0
    };

    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const [guestsResult, usersResult, vendorsResult, completenessResult, syncResult] = await Promise.allSettled([
        this.prisma.guest.count(),
        this.prisma.user.count(),
        this.prisma.vendor.count(),
        this.completenessService.getCompletenessStatistics(),
        this.enhancedSyncService.getSyncStatistics()
      ]);

      // Extract successful results with fallbacks
      const totalGuests = guestsResult.status === 'fulfilled' ? guestsResult.value : 0;
      const totalUsers = usersResult.status === 'fulfilled' ? usersResult.value : 0;
      const totalVendors = vendorsResult.status === 'fulfilled' ? vendorsResult.value : 0;

      // Handle completeness statistics with fallback
      let averageCompletenessScore = 0;
      if (completenessResult.status === 'fulfilled') {
        averageCompletenessScore = completenessResult.value.overall.averageScore;
      } else {
        logger.warn('Completeness service failed, using fallback score');
      }

      // Handle sync statistics with fallback
      let syncSuccessRate = 100;
      let activeSyncs = 0;
      if (syncResult.status === 'fulfilled') {
        const stats = syncResult.value;
        syncSuccessRate = stats.totalSyncs > 0 
          ? Math.round((stats.successfulSyncs / stats.totalSyncs) * 100)
          : 100;
        activeSyncs = stats.totalSyncs;
      } else {
        logger.warn('Sync service failed, using fallback sync data');
      }

      // Calculate pending tasks (only if guests query succeeded)
      let pendingTasks = 0;
      if (guestsResult.status === 'fulfilled') {
        try {
          pendingTasks = await this.prisma.guest.count({
            where: {
              profileCompleteness: { lt: 70 }
            }
          });
        } catch (error) {
          logger.warn('Failed to calculate pending tasks:', error);
        }
      }

      // Calculate data quality issues (only if basic queries succeeded)
      let dataQualityIssues = 0;
      if (guestsResult.status === 'fulfilled' && usersResult.status === 'fulfilled') {
        try {
          dataQualityIssues = await this.getDataQualityIssuesCount();
        } catch (error) {
          logger.warn('Failed to calculate data quality issues:', error);
        }
      }

      return {
        totalGuests,
        totalUsers,
        totalVendors,
        averageCompletenessScore,
        syncSuccessRate,
        activeSyncs,
        pendingTasks,
        dataQualityIssues
      };

    } catch (error) {
      logger.error('Critical error in getMetrics, using fallback data:', error);
      return fallbackMetrics;
    }
  }

  /**
   * Get real-time statistics
   */
  async getRealTimeStats(): Promise<RealTimeStats> {
    const fallbackStats: RealTimeStats = {
      guests: { total: 0, withCompleteProfiles: 0, withIncompleteProfiles: 0, averageCompleteness: 0 },
      users: { total: 0, withCompleteProfiles: 0, withIncompleteProfiles: 0, averageCompleteness: 0 },
      vendors: { total: 0, withCompleteProfiles: 0, withIncompleteProfiles: 0, averageCompleteness: 0 },
      sync: { totalOperations: 0, successfulOperations: 0, failedOperations: 0, successRate: 100, lastSyncTime: null },
      dataQuality: { totalIssues: 0, criticalIssues: 0, warnings: 0, topIssues: [] }
    };

    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const [guestsResult, usersResult, vendorsResult, syncResult, dataQualityResult] = await Promise.allSettled([
        this.getEntityStats('Guest'),
        this.getEntityStats('User'),
        this.getEntityStats('Vendor'),
        this.enhancedSyncService.getSyncStatistics(),
        this.getDataQualityStats()
      ]);

      // Extract successful results with fallbacks
      const guests = guestsResult.status === 'fulfilled' ? guestsResult.value : fallbackStats.guests;
      const users = usersResult.status === 'fulfilled' ? usersResult.value : fallbackStats.users;
      const vendors = vendorsResult.status === 'fulfilled' ? vendorsResult.value : fallbackStats.vendors;

      // Handle sync statistics with fallback
      let sync = fallbackStats.sync;
      if (syncResult.status === 'fulfilled') {
        const stats = syncResult.value;
        sync = {
          totalOperations: stats.totalSyncs,
          successfulOperations: stats.successfulSyncs,
          failedOperations: stats.failedSyncs,
          successRate: stats.totalSyncs > 0 
            ? Math.round((stats.successfulSyncs / stats.totalSyncs) * 100)
            : 100,
          lastSyncTime: stats.recentErrors && stats.recentErrors.length > 0 
            ? new Date() // Use current date as fallback since recentErrors contains strings, not objects
            : null
        };
      } else {
        logger.warn('Sync service failed in getRealTimeStats, using fallback data');
      }

      // Handle data quality statistics with fallback
      const dataQuality = dataQualityResult.status === 'fulfilled' ? dataQualityResult.value : fallbackStats.dataQuality;

      return {
        guests,
        users,
        vendors,
        sync,
        dataQuality
      };

    } catch (error) {
      logger.error('Critical error in getRealTimeStats, using fallback data:', error);
      return fallbackStats;
    }
  }

  /**
   * Get statistics for a specific entity type
   */
  private async getEntityStats(entityType: 'Guest' | 'User' | 'Vendor') {
    const model = this.prisma[entityType.toLowerCase() as keyof PrismaClient] as any;
    
    if (entityType === 'Vendor') {
      // Vendors don't have profileCompleteness field yet
      const total = await model.count();
      return {
        total,
        withCompleteProfiles: 0, // Not implemented for vendors yet
        withIncompleteProfiles: total, // All vendors considered incomplete for now
        averageCompleteness: 0
      };
    }
    
    const [total, withCompleteProfiles, withIncompleteProfiles, avgCompleteness] = await Promise.all([
      model.count(),
      model.count({
        where: {
          profileCompleteness: { gte: 90 }
        }
      }),
      model.count({
        where: {
          OR: [
            { profileCompleteness: { lt: 90 } },
            { profileCompleteness: null }
          ]
        }
      }),
      model.aggregate({
        _avg: {
          profileCompleteness: true
        }
      })
    ]);

    return {
      total,
      withCompleteProfiles,
      withIncompleteProfiles,
      averageCompleteness: Math.round(avgCompleteness._avg.profileCompleteness || 0)
    };
  }

  /**
   * Get data quality statistics
   */
  private async getDataQualityStats() {
    const fallbackStats = {
      totalIssues: 0,
      criticalIssues: 0,
      warnings: 0,
      topIssues: [] as Array<{ type: string; count: number }>
    };

    try {
      const [totalIssues, criticalIssues, warnings, topIssues] = await Promise.allSettled([
        this.getDataQualityIssuesCount(),
        this.getCriticalIssuesCount(),
        this.getWarningIssuesCount(),
        this.getTopDataQualityIssues()
      ]);

      return {
        totalIssues: totalIssues.status === 'fulfilled' ? totalIssues.value : 0,
        criticalIssues: criticalIssues.status === 'fulfilled' ? criticalIssues.value : 0,
        warnings: warnings.status === 'fulfilled' ? warnings.value : 0,
        topIssues: topIssues.status === 'fulfilled' ? topIssues.value : []
      };
    } catch (error) {
      logger.warn('Failed to get data quality stats:', error);
      return fallbackStats;
    }
  }

  /**
   * Get total data quality issues count
   */
  private async getDataQualityIssuesCount(): Promise<number> {
    try {
      const [incompleteGuests, incompleteUsers, incompleteVendors, failedSyncs] = await Promise.allSettled([
        this.prisma.guest.count({
          where: {
            profileCompleteness: { lt: 70 }
          }
        }),
        this.prisma.user.count({
          where: {
            profileCompleteness: { lt: 70 }
          }
        }),
        // Vendors don't have profileCompleteness field yet, so count all as incomplete
        this.prisma.vendor.count(),
        this.prisma.mewsSyncLog.count({
          where: {
            status: 'FAILED'
          }
        })
      ]);

      const incompleteGuestsCount = incompleteGuests.status === 'fulfilled' ? incompleteGuests.value : 0;
      const incompleteUsersCount = incompleteUsers.status === 'fulfilled' ? incompleteUsers.value : 0;
      const incompleteVendorsCount = incompleteVendors.status === 'fulfilled' ? incompleteVendors.value : 0;
      const failedSyncsCount = failedSyncs.status === 'fulfilled' ? failedSyncs.value : 0;

      return incompleteGuestsCount + incompleteUsersCount + incompleteVendorsCount + failedSyncsCount;
    } catch (error) {
      logger.warn('Failed to calculate data quality issues count:', error);
      return 0;
    }
  }

  /**
   * Get critical issues count
   */
  private async getCriticalIssuesCount(): Promise<number> {
    try {
      const [missingRequiredFields, failedSyncs] = await Promise.allSettled([
        this.prisma.guest.count({
          where: {
            OR: [
              { email: '' },
              { firstName: '' }
            ]
          }
        }),
        this.prisma.mewsSyncLog.count({
          where: {
            status: 'FAILED',
            retryCount: { gte: 3 }
          }
        })
      ]);

      const missingFieldsCount = missingRequiredFields.status === 'fulfilled' ? missingRequiredFields.value : 0;
      const failedSyncsCount = failedSyncs.status === 'fulfilled' ? failedSyncs.value : 0;

      return missingFieldsCount + failedSyncsCount;
    } catch (error) {
      logger.warn('Failed to calculate critical issues count:', error);
      return 0;
    }
  }

  /**
   * Get warning issues count
   */
  private async getWarningIssuesCount(): Promise<number> {
    try {
      const [incompleteProfiles, recentFailedSyncs] = await Promise.allSettled([
        this.prisma.guest.count({
          where: {
            profileCompleteness: { lt: 90, gte: 70 }
          }
        }),
        this.prisma.mewsSyncLog.count({
          where: {
            status: 'FAILED',
            retryCount: { lt: 3 }
          }
        })
      ]);

      const incompleteProfilesCount = incompleteProfiles.status === 'fulfilled' ? incompleteProfiles.value : 0;
      const recentFailedSyncsCount = recentFailedSyncs.status === 'fulfilled' ? recentFailedSyncs.value : 0;

      return incompleteProfilesCount + recentFailedSyncsCount;
    } catch (error) {
      logger.warn('Failed to calculate warning issues count:', error);
      return 0;
    }
  }

  /**
   * Get top data quality issues
   */
  private async getTopDataQualityIssues(): Promise<Array<{ type: string; count: number }>> {
    try {
      const issues = [];

      // Check for missing required fields
      const [missingEmail, missingName, failedSyncs] = await Promise.allSettled([
        this.prisma.guest.count({
          where: {
            email: ''
          }
        }),
        this.prisma.guest.count({
          where: {
            firstName: ''
          }
        }),
        this.prisma.mewsSyncLog.count({
          where: {
            status: 'FAILED'
          }
        })
      ]);

      if (missingEmail.status === 'fulfilled' && missingEmail.value > 0) {
        issues.push({ type: 'Missing Email', count: missingEmail.value });
      }

      if (missingName.status === 'fulfilled' && missingName.value > 0) {
        issues.push({ type: 'Missing First Name', count: missingName.value });
      }

      if (failedSyncs.status === 'fulfilled' && failedSyncs.value > 0) {
        issues.push({ type: 'Failed Syncs', count: failedSyncs.value });
      }

      return issues.sort((a, b) => b.count - a.count).slice(0, 5);
    } catch (error) {
      logger.warn('Failed to get top data quality issues:', error);
      return [];
    }
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(): Promise<Alert[]> {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    const pendingOperations = await this.prisma.mewsSyncLog.count({
      where: {
        status: 'PENDING'
      }
    });

    const failedOperations = await this.prisma.mewsSyncLog.count({
      where: {
        status: 'FAILED'
      }
    });

    return {
      isConnected: this.syncConnectionStatus,
      lastHeartbeat: this.lastHeartbeat,
      pendingOperations,
      failedOperations
    };
  }

  /**
   * Update sync connection status
   */
  updateSyncConnectionStatus(isConnected: boolean) {
    this.syncConnectionStatus = isConnected;
    this.lastHeartbeat = new Date();

    if (!isConnected) {
      this.addAlert({
        type: 'error',
        title: 'Sync Connection Lost',
        message: 'Connection to Mews has been lost. Attempting to reconnect...',
        priority: 'high'
      });
    } else if (this.alerts.some(a => a.title === 'Sync Connection Lost' && !a.isRead)) {
      this.addAlert({
        type: 'success',
        title: 'Sync Connection Restored',
        message: 'Connection to Mews has been restored successfully.',
        priority: 'medium'
      });
    }
  }

  /**
   * Add a new alert
   */
  addAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'isRead'>) {
    const alert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isRead: false
    };

    this.alerts.unshift(alert);

    // Keep only the last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    logger.info(`Dashboard alert: ${alert.title} - ${alert.message}`);
  }

  /**
   * Mark alert as read
   */
  markAlertAsRead(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => alert.timestamp > oneWeekAgo);
  }
} 