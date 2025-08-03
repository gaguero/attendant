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

export interface DashboardRealTimeStats {
  entityOverview: {
    completeProfiles: number;
    incompleteProfiles: number;
    totalProfiles: number;
  };
  recentActivity: {
    updates: number;
    syncErrors: number;
  };
}

// Legacy interface for backward compatibility
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

export interface AlertData {
  id: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

// Legacy interface for backward compatibility
export interface Alert {
  id: string;
  type: 'sync_error' | 'data_quality' | 'system' | 'user_action';
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SyncStatus {
  lastSync: Date | null;
  isConnected: boolean;
  pendingSyncs: number;
  connectionHealth: 'healthy' | 'warning' | 'error';
}

export interface DashboardData {
  metrics: DashboardMetrics;
  realTimeStats: DashboardRealTimeStats;
  recentAlerts: AlertData[];
  syncStatus: SyncStatus;
}

// Legacy interface for backward compatibility
export interface LegacyDashboardData {
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

export interface CacheStats {
  size: number;
  hitRate: number;
  hits: number;
  misses: number;
  evictions: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export interface PerformanceMetrics {
  cacheStats: CacheStats;
  queryPerformance: {
    averageResponseTime: number;
    slowQueries: number;
    totalQueries: number;
  };
  systemHealth: {
    memoryUsage: number;
    cpuUsage: number;
    connectionCount: number;
  };
}