import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, logoutWithRedirect, getDisplayName, getUserInitials, isAdmin, isManager, canManageUsers } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Attendandt Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getUserInitials()}
                </div>
                <span className="text-gray-700">{getDisplayName()}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              
              <button
                onClick={() => logoutWithRedirect()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome, {getDisplayName()}!
              </h2>
              <p className="text-gray-600 mb-6">
                You are successfully authenticated and logged into the Attendandt platform.
              </p>
              
              {/* User info cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Account Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Account Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    <p><span className="font-medium">Role:</span> {user.role}</p>
                    <p><span className="font-medium">Member since:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Permissions */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-900 mb-2">
                    Your Permissions
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${isAdmin() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Admin Access</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${isManager() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Manager Access</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${canManageUsers() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>User Management</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-purple-700 hover:text-purple-900 transition-colors">
                      → View Profile
                    </button>
                    {canManageUsers() && (
                      <button className="w-full text-left text-sm text-purple-700 hover:text-purple-900 transition-colors">
                        → Manage Users
                      </button>
                    )}
                    <button className="w-full text-left text-sm text-purple-700 hover:text-purple-900 transition-colors">
                      → Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Authentication Status
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">
                      ✅ Successfully authenticated with JWT tokens
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Your session is active and secure. The frontend authentication system is working correctly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 