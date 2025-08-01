import React from 'react';

interface RealTimeStatsProps {
  stats: {
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
}

export const RealTimeStats: React.FC<RealTimeStatsProps> = ({ stats }) => {
  const getCompletenessColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSyncColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatLastSyncTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Real-time Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entity Statistics */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Entity Overview</h4>
          
          {/* Guests */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-900">Guests</h5>
              <span className="text-sm text-gray-500">{stats.guests.total} total</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Complete profiles:</span>
                <span className="font-medium text-green-600">{stats.guests.withCompleteProfiles}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Incomplete profiles:</span>
                <span className="font-medium text-yellow-600">{stats.guests.withIncompleteProfiles}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg completeness:</span>
                <span className={`font-medium ${getCompletenessColor(stats.guests.averageCompleteness)}`}>
                  {stats.guests.averageCompleteness}%
                </span>
              </div>
            </div>
          </div>

          {/* Users */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-900">Users</h5>
              <span className="text-sm text-gray-500">{stats.users.total} total</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Complete profiles:</span>
                <span className="font-medium text-green-600">{stats.users.withCompleteProfiles}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Incomplete profiles:</span>
                <span className="font-medium text-yellow-600">{stats.users.withIncompleteProfiles}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg completeness:</span>
                <span className={`font-medium ${getCompletenessColor(stats.users.averageCompleteness)}`}>
                  {stats.users.averageCompleteness}%
                </span>
              </div>
            </div>
          </div>

          {/* Vendors */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-900">Vendors</h5>
              <span className="text-sm text-gray-500">{stats.vendors.total} total</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Complete profiles:</span>
                <span className="font-medium text-green-600">{stats.vendors.withCompleteProfiles}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Incomplete profiles:</span>
                <span className="font-medium text-yellow-600">{stats.vendors.withIncompleteProfiles}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg completeness:</span>
                <span className={`font-medium ${getCompletenessColor(stats.vendors.averageCompleteness)}`}>
                  {stats.vendors.averageCompleteness}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sync & Quality Statistics */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">System Health</h4>
          
          {/* Sync Operations */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-900">Sync Operations</h5>
              <span className="text-sm text-gray-500">{stats.sync.totalOperations} total</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Successful:</span>
                <span className="font-medium text-green-600">{stats.sync.successfulOperations}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Failed:</span>
                <span className="font-medium text-red-600">{stats.sync.failedOperations}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Success rate:</span>
                <span className={`font-medium ${getSyncColor(stats.sync.successRate)}`}>
                  {stats.sync.successRate}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last sync:</span>
                <span className="font-medium text-gray-900">
                  {formatLastSyncTime(stats.sync.lastSyncTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Data Quality */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-900">Data Quality</h5>
              <span className="text-sm text-gray-500">{stats.dataQuality.totalIssues} issues</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Critical issues:</span>
                <span className="font-medium text-red-600">{stats.dataQuality.criticalIssues}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Warnings:</span>
                <span className="font-medium text-yellow-600">{stats.dataQuality.warnings}</span>
              </div>
            </div>
            
            {/* Top Issues */}
            {stats.dataQuality.topIssues.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h6 className="text-sm font-medium text-gray-700 mb-2">Top Issues</h6>
                <div className="space-y-1">
                  {stats.dataQuality.topIssues.slice(0, 3).map((issue, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-600 truncate">{issue.type}</span>
                      <span className="font-medium text-gray-900">{issue.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 