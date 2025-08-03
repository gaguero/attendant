import { PrismaClient } from '@prisma/client';
import { cacheService } from './cache.service.js';
import type { 
  DashboardMetrics, 
  DashboardRealTimeStats, 
  DashboardData, 
  SyncStatus,
  AlertData 
} from '../types/dashboard.types.js';

export class OptimizedDashboardService {
  constructor(private prisma: PrismaClient) {}

  async getDashboardData(userId: string): Promise<DashboardData> {
    const cacheKey = `dashboard:optimized:${userId}`;
    const cached = cacheService.get<DashboardData>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Parallel execution of all dashboard queries
    const [metricsData, statsData, alertsData, syncStatus] = await Promise.all([
      this.getOptimizedMetrics(),
      this.getOptimizedRealTimeStats(),
      this.getRecentAlerts(10),
      this.getSyncStatus()
    ]);

    const dashboardData: DashboardData = {
      metrics: metricsData,
      realTimeStats: statsData,
      recentAlerts: alertsData,
      syncStatus
    };

    // Cache for 2 minutes
    cacheService.set(cacheKey, dashboardData, 2);
    return dashboardData;
  }

  private async getOptimizedMetrics(): Promise<DashboardMetrics> {
    // Single aggregated query for all metrics
    const result = await this.prisma.$queryRaw<Array<{
      total_guests: bigint;
      total_users: bigint;
      total_vendors: bigint;
      avg_guest_completeness: number;
      avg_user_completeness: number;
      sync_success_count: bigint;
      sync_total_count: bigint;
    }>>`
      WITH sync_stats AS (
        SELECT 
          COUNT(*) as total_count,
          COUNT(CASE WHEN status = 'SYNCED' THEN 1 END) as success_count
        FROM mews_sync_logs 
        WHERE created_at > NOW() - INTERVAL '24 hours'
      )
      SELECT 
        (SELECT COUNT(*)::bigint FROM guests WHERE status = 'ACTIVE') as total_guests,
        (SELECT COUNT(*)::bigint FROM users WHERE status = 'ACTIVE') as total_users,
        (SELECT COUNT(*)::bigint FROM vendors WHERE status = 'ACTIVE') as total_vendors,
        (SELECT COALESCE(AVG(profile_completeness), 0) FROM guests WHERE status = 'ACTIVE') as avg_guest_completeness,
        (SELECT COALESCE(AVG(profile_completeness), 0) FROM users WHERE status = 'ACTIVE') as avg_user_completeness,
        COALESCE(ss.success_count, 0)::bigint as sync_success_count,
        COALESCE(ss.total_count, 0)::bigint as sync_total_count
      FROM sync_stats ss
    `;

    const data = result[0];
    if (!data) {
      throw new Error('No data returned from metrics query');
    }
    
    const syncSuccessRate = data.sync_total_count > 0 
      ? Math.round((Number(data.sync_success_count) / Number(data.sync_total_count)) * 100)
      : 100;

    // Get pending tasks and data quality issues in parallel
    const [pendingTasks, dataQualityIssues, activeSyncs] = await Promise.all([
      this.getPendingTasksCount(),
      this.getDataQualityIssuesCount(),
      this.getActiveSyncsCount()
    ]);

    return {
      totalGuests: Number(data.total_guests),
      totalUsers: Number(data.total_users),
      totalVendors: Number(data.total_vendors),
      averageCompletenessScore: Math.round((data.avg_guest_completeness + data.avg_user_completeness) / 2),
      syncSuccessRate,
      activeSyncs,
      pendingTasks,
      dataQualityIssues
    };
  }

  private async getOptimizedRealTimeStats(): Promise<DashboardRealTimeStats> {
    // Optimized query for real-time stats
    const result = await this.prisma.$queryRaw<Array<{
      complete_profiles: bigint;
      incomplete_profiles: bigint;
      recent_updates: bigint;
      sync_errors: bigint;
    }>>`
      SELECT 
        (SELECT COUNT(*)::bigint FROM guests WHERE profile_completeness >= 80 AND status = 'ACTIVE') +
        (SELECT COUNT(*)::bigint FROM users WHERE profile_completeness >= 80 AND status = 'ACTIVE') as complete_profiles,
        
        (SELECT COUNT(*)::bigint FROM guests WHERE profile_completeness < 80 AND status = 'ACTIVE') +
        (SELECT COUNT(*)::bigint FROM users WHERE profile_completeness < 80 AND status = 'ACTIVE') as incomplete_profiles,
        
        (SELECT COUNT(*)::bigint FROM audit_logs WHERE created_at > NOW() - INTERVAL '24 hours') as recent_updates,
        
        (SELECT COUNT(*)::bigint FROM mews_sync_logs WHERE status = 'ERROR' AND created_at > NOW() - INTERVAL '24 hours') as sync_errors
    `;

    const data = result[0];
    if (!data) {
      return {
        entityOverview: { completeProfiles: 0, incompleteProfiles: 0, totalProfiles: 0 },
        recentActivity: { updates: 0, syncErrors: 0 }
      };
    }

    return {
      entityOverview: {
        completeProfiles: Number(data.complete_profiles),
        incompleteProfiles: Number(data.incomplete_profiles),
        totalProfiles: Number(data.complete_profiles) + Number(data.incomplete_profiles)
      },
      recentActivity: {
        updates: Number(data.recent_updates),
        syncErrors: Number(data.sync_errors)
      }
    };
  }

  private async getRecentAlerts(limit: number): Promise<AlertData[]> {
    const cacheKey = `dashboard:alerts:${limit}`;
    const cached = cacheService.get<AlertData[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Combine different types of alerts in a single query
    const alerts = await this.prisma.$queryRaw<Array<{
      type: string;
      message: string;
      severity: string;
      created_at: Date;
      entity_type: string;
      entity_id: string;
    }>>`
      (
        SELECT 
          'sync_error' as type,
          CONCAT('Sync failed for ', entity_type, ': ', error_message) as message,
          'error' as severity,
          created_at,
          entity_type,
          entity_id
        FROM mews_sync_logs 
        WHERE status = 'ERROR' 
        AND created_at > NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC 
        LIMIT ${limit / 2}
      )
      UNION ALL
      (
        SELECT 
          'low_completeness' as type,
          CONCAT('Low profile completeness (', profile_completeness, '%) for guest: ', COALESCE(first_name, 'Unknown'), ' ', COALESCE(last_name, '')) as message,
          'warning' as severity,
          updated_at as created_at,
          'guest' as entity_type,
          id as entity_id
        FROM guests 
        WHERE profile_completeness < 50 
        AND status = 'ACTIVE'
        AND updated_at > NOW() - INTERVAL '24 hours'
        ORDER BY updated_at DESC 
        LIMIT ${limit / 2}
      )
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    const alertData = alerts.map(alert => ({
      id: `${alert.type}-${alert.entity_id}-${alert.created_at.getTime()}`,
      type: alert.type,
      message: alert.message,
      severity: alert.severity as 'info' | 'warning' | 'error',
      timestamp: alert.created_at,
      read: false
    }));

    // Cache for 3 minutes
    cacheService.set(cacheKey, alertData, 3);
    return alertData;
  }

  private async getSyncStatus(): Promise<SyncStatus> {
    const cacheKey = 'dashboard:sync-status';
    const cached = cacheService.get<SyncStatus>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.prisma.$queryRaw<Array<{
      last_sync: Date | null;
      is_connected: boolean;
      pending_syncs: bigint;
    }>>`
      SELECT 
        (SELECT MAX(created_at) FROM mews_sync_logs WHERE status = 'SYNCED') as last_sync,
        true as is_connected,
        (SELECT COUNT(*)::bigint FROM mews_sync_logs WHERE status = 'PENDING') as pending_syncs
    `;

    const data = result[0];
    if (!data) {
      return {
        lastSync: null,
        isConnected: false,
        pendingSyncs: 0,
        connectionHealth: 'error' as const
      };
    }
    
    const syncStatus: SyncStatus = {
      lastSync: data.last_sync,
      isConnected: data.is_connected,
      pendingSyncs: Number(data.pending_syncs),
      connectionHealth: 'healthy'
    };

    // Cache for 1 minute
    cacheService.set(cacheKey, syncStatus, 1);
    return syncStatus;
  }

  private async getPendingTasksCount(): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM mews_sync_logs 
      WHERE status IN ('PENDING', 'PROCESSING')
    `;
    return Number(result[0]?.count || 0);
  }

  private async getDataQualityIssuesCount(): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM (
        SELECT id FROM guests WHERE profile_completeness < 50 AND status = 'ACTIVE'
        UNION ALL
        SELECT id FROM users WHERE profile_completeness < 50 AND status = 'ACTIVE'
      ) as quality_issues
    `;
    return Number(result[0]?.count || 0);
  }

  private async getActiveSyncsCount(): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM mews_sync_logs 
      WHERE status = 'PROCESSING'
      AND created_at > NOW() - INTERVAL '1 hour'
    `;
    return Number(result[0]?.count || 0);
  }

  // Cache invalidation methods
  invalidateCache(): void {
    cacheService.invalidate('dashboard:');
  }

  invalidateUserDashboard(userId: string): void {
    cacheService.invalidateByPrefix(`dashboard:optimized:${userId}`);
    cacheService.invalidateByPrefix(`dashboard:alerts:`);
    cacheService.invalidate('dashboard:sync-status');
  }
}

// Singleton instance
export const optimizedDashboardService = new OptimizedDashboardService(
  new PrismaClient()
);