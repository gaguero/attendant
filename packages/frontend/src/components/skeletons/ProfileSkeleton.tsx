import React from 'react';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
          
          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          
          {/* Edit Button */}
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Profile Form Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-6"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Fields */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>

        {/* Bio Field */}
        <div className="mt-6 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          <div className="h-24 bg-gray-100 rounded w-full"></div>
        </div>

        {/* Preferences Section */}
        <div className="mt-8">
          <div className="h-6 bg-gray-300 rounded w-1/5 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;