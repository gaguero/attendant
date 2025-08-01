import React from 'react';

interface SyncStatusProps {
  isConnected: boolean;
  lastHeartbeat: string | null;
  pendingOperations: number;
  failedOperations: number;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  isConnected,
  lastHeartbeat,
  pendingOperations,
  failedOperations
}) => {
  const formatLastHeartbeat = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Sync Status</h3>
        <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connection Status */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? '🟢' : '🔴'}
          </div>
          <p className="text-sm text-gray-600 mt-1">Connection</p>
        </div>

        {/* Pending Operations */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${pendingOperations > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
            {pendingOperations}
          </div>
          <p className="text-sm text-gray-600 mt-1">Pending</p>
        </div>

        {/* Failed Operations */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${failedOperations > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {failedOperations}
          </div>
          <p className="text-sm text-gray-600 mt-1">Failed</p>
        </div>
      </div>

      {/* Last Heartbeat */}
      {lastHeartbeat && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Heartbeat:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatLastHeartbeat(lastHeartbeat)}
            </span>
          </div>
        </div>
      )}

      {/* Status Message */}
      <div className="mt-4">
        {isConnected ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Sync connection is healthy
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Real-time data synchronization is active and working properly.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  Sync connection lost
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Connection to Mews has been lost. Attempting to reconnect...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Operations Summary */}
      {(pendingOperations > 0 || failedOperations > 0) && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Operations Summary</h4>
          <div className="space-y-2">
            {pendingOperations > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pending operations:</span>
                <span className="font-medium text-yellow-600">{pendingOperations}</span>
              </div>
            )}
            {failedOperations > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Failed operations:</span>
                <span className="font-medium text-red-600">{failedOperations}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 