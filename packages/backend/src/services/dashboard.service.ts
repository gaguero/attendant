import { PrismaClient, User, Guest, Vendor, MewsSyncLog } from '@prisma/client';
import { logger } from '../lib/logger.js';
import { CompletenessService } from './completeness.service.js';
import { BusinessRulesService } from './businessRules.service.js';
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
  private businessRulesService: BusinessRulesService;
  private enhancedSyncService: EnhancedSyncService;
  private alerts: Alert[] = [];
  private syncConnectionStatus = false;
  private lastHeartbeat: Date | null = null;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.completenessService = new CompletenessService(prisma);
    this.businessRulesService = new BusinessRulesService(prisma);
    this.enhancedSyncService = new EnhancedSyncService(prisma);
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    const [metrics, realTimeStats, recentAlerts, syncStatus] = await Promise.all([
      this.getMetrics(),
      this.getRealTimeStats(),
      this.getRecentAlerts(),
      this.getSyncStatus()
    ]);

    return {
      metrics,
      realTimeStats,
      recentAlerts,
      syncStatus
    };
  }

  /**
   * Get key dashboard metrics
   */
  async getMetrics(): Promise<DashboardMetrics> {
    const [
      totalGuests,
      totalUsers,
      totalVendors,
      completenessStats,
      syncStats
    ] = await Promise.all([
      this.prisma.guest.count(),
      this.prisma.user.count(),
      this.prisma.vendor.count(),
      this.completenessService.getCompletenessStatistics(),
      this.enhancedSyncService.getSyncStatistics()
    ]);

    const averageCompletenessScore = completenessStats.averageScore;
    const syncSuccessRate = syncStats.totalSyncs > 0 
      ? Math.round((syncStats.successfulSyncs / syncStats.totalSyncs) * 100)
      : 100;

    // Calculate pending tasks (guests with incomplete profiles)
    const pendingTasks = await this.prisma.guest.count({
      where: {
        OR: [
          { profileCompleteness: { lt: 70 } },
          { profileCompleteness: null }
        ]
      }
    });

    // Calculate data quality issues
    const dataQualityIssues = await this.getDataQualityIssuesCount();

    return {
      totalGuests,
      totalUsers,
      totalVendors,
      averageCompletenessScore,
      syncSuccessRate,
      activeSyncs: syncStats.totalSyncs,
      pendingTasks,
      dataQualityIssues
    };
  }

  /**
   * Get real-time statistics
   */
  async getRealTimeStats(): Promise<RealTimeStats> {
    const [guests, users, vendors, syncStats, dataQuality] = await Promise.all([
      this.getEntityStats('Guest'),
      this.getEntityStats('User'),
      this.getEntityStats('Vendor'),
      this.enhancedSyncService.getSyncStatistics(),
      this.getDataQualityStats()
    ]);

    return {
      guests,
      users,
      vendors,
      sync: {
        totalOperations: syncStats.totalSyncs,
        successfulOperations: syncStats.successfulSyncs,
        failedOperations: syncStats.failedSyncs,
        successRate: syncStats.totalSyncs > 0 
          ? Math.round((syncStats.successfulSyncs / syncStats.totalSyncs) * 100)
          : 100,
        lastSyncTime: syncStats.recentErrors.length > 0 
          ? syncStats.recentErrors[0].timestamp 
          : null
      },
      dataQuality
    };
  }

  /**
   * Get statistics for a specific entity type
   */
  private async getEntityStats(entityType: 'Guest' | 'User' | 'Vendor') {
    const model = this.prisma[entityType.toLowerCase() as keyof PrismaClient] as any;
    
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
    const [totalIssues, criticalIssues, warnings] = await Promise.all([
      this.getDataQualityIssuesCount(),
      this.getCriticalIssuesCount(),
      this.getWarningIssuesCount()
    ]);

    const topIssues = await this.getTopDataQualityIssues();

    return {
      totalIssues,
      criticalIssues,
      warnings,
      topIssues
    };
  }

  /**
   * Get total data quality issues count
   */
  private async getDataQualityIssuesCount(): Promise<number> {
    const [incompleteGuests, incompleteUsers, incompleteVendors, failedSyncs] = await Promise.all([
      this.prisma.guest.count({
        where: {
          OR: [
            { profileCompleteness: { lt: 70 } },
            { profileCompleteness: null }
          ]
        }
      }),
      this.prisma.user.count({
        where: {
          OR: [
            { profileCompleteness: { lt: 70 } },
            { profileCompleteness: null }
          ]
        }
      }),
      this.prisma.vendor.count({
        where: {
          OR: [
            { profileCompleteness: { lt: 70 } },
            { profileCompleteness: null }
          ]
        }
      }),
      this.prisma.mewsSyncLog.count({
        where: {
          status: 'FAILED'
        }
      })
    ]);

    return incompleteGuests + incompleteUsers + incompleteVendors + failedSyncs;
  }

  /**
   * Get critical issues count
   */
  private async getCriticalIssuesCount(): Promise<number> {
    const [missingRequiredFields, failedSyncs] = await Promise.all([
      this.prisma.guest.count({
        where: {
          OR: [
            { email: null },
            { email: '' },
            { firstName: null },
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

    return missingRequiredFields + failedSyncs;
  }

  /**
   * Get warning issues count
   */
  private async getWarningIssuesCount(): Promise<number> {
    const [incompleteProfiles, recentFailedSyncs] = await Promise.all([
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

    return incompleteProfiles + recentFailedSyncs;
  }

  /**
   * Get top data quality issues
   */
  private async getTopDataQualityIssues(): Promise<Array<{ type: string; count: number }>> {
    const issues = [];

    // Check for missing required fields
    const missingEmail = await this.prisma.guest.count({
      where: {
        OR: [
          { email: null },
          { email: '' }
        ]
      }
    });
    if (missingEmail > 0) {
      issues.push({ type: 'Missing Email', count: missingEmail });
    }

    const missingName = await this.prisma.guest.count({
      where: {
        OR: [
          { firstName: null },
          { firstName: '' }
        ]
      }
    });
    if (missingName > 0) {
      issues.push({ type: 'Missing First Name', count: missingName });
    }

    const failedSyncs = await this.prisma.mewsSyncLog.count({
      where: {
        status: 'FAILED'
      }
    });
    if (failedSyncs > 0) {
      issues.push({ type: 'Failed Syncs', count: failedSyncs });
    }

    return issues.sort((a, b) => b.count - a.count).slice(0, 5);
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