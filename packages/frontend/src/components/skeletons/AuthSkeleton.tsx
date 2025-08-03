import React from 'react';

interface AuthSkeletonProps {
  formType?: 'login' | 'register' | 'reset';
}

export const AuthSkeleton: React.FC<AuthSkeletonProps> = ({ formType = 'login' }) => {
  const fieldCount = formType === 'register' ? 4 : formType === 'login' ? 2 : 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-pulse">
        {/* Logo */}
        <div className="text-center">
          <div className="h-12 w-32 bg-gray-300 rounded mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-64 mx-auto"></div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            {/* Form Fields */}
            {Array.from({ length: fieldCount }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-100 rounded w-full"></div>
              </div>
            ))}

            {/* Additional Options for Login */}
            {formType === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </div>
            )}

            {/* Submit Button */}
            <div className="h-10 bg-gray-300 rounded w-full"></div>

            {/* Links */}
            <div className="text-center space-y-2">
              <div className="h-4 bg-gray-100 rounded w-48 mx-auto"></div>
              {formType !== 'reset' && (
                <div className="h-4 bg-gray-100 rounded w-32 mx-auto"></div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {formType === 'register' && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="h-4 bg-blue-200 rounded w-full"></div>
              <div className="h-4 bg-blue-100 rounded w-3/4"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSkeleton;