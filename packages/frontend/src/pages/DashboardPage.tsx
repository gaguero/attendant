import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DashboardMetrics } from '../components/dashboard/DashboardMetrics';
import { RealTimeStats } from '../components/dashboard/RealTimeStats';
import { AlertsPanel } from '../components/dashboard/AlertsPanel';
import { SyncStatus } from '../components/dashboard/SyncStatus';
import { DataQualityOverview } from '../components/dashboard/DataQualityOverview';

interface DashboardData {
  metrics: {
    totalGuests: number;
    totalUsers: number;
    totalVendors: number;
    averageCompletenessScore: number;
    syncSuccessRate: number;
    activeSyncs: number;
    pendingTasks: number;
    dataQualityIssues: number;
  };
  realTimeStats: {
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
      lastSyncTime: string | null;
    };
    dataQuality: {
      totalIssues: number;
      criticalIssues: number;
      warnings: number;
      topIssues: Array<{ type: string; count: number }>;
    };
  };
  recentAlerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  syncStatus: {
    isConnected: boolean;
    lastHeartbeat: string | null;
    pendingOperations: number;
    failedOperations: number;
  };
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/v1/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAlertRead = async (alertId: string) => {
    try {
      const response = await fetch(`/api/v1/dashboard/alerts/${alertId}/read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        // Refresh dashboard data to get updated alerts
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Real-time monitoring and analytics for hospitality operations
          {lastUpdated && (
            <span className="ml-2 text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      {/* Sync Status */}
      <div className="mb-6">
        <SyncStatus 
          isConnected={dashboardData.syncStatus.isConnected}
          lastHeartbeat={dashboardData.syncStatus.lastHeartbeat}
          pendingOperations={dashboardData.syncStatus.pendingOperations}
          failedOperations={dashboardData.syncStatus.failedOperations}
        />
      </div>

      {/* Main Metrics */}
      <div className="mb-6">
        <DashboardMetrics metrics={dashboardData.metrics} />
      </div>

      {/* Real-time Stats and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RealTimeStats stats={dashboardData.realTimeStats} />
        </div>
        <div>
          <AlertsPanel 
            alerts={dashboardData.recentAlerts}
            onAlertRead={handleAlertRead}
          />
        </div>
      </div>

      {/* Data Quality Overview */}
      <div className="mb-6">
        <DataQualityOverview dataQuality={dashboardData.realTimeStats.dataQuality} />
      </div>
    </div>
  );
};

export default DashboardPage; 