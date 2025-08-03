import React from 'react';

interface ListSkeletonProps {
  hasHeader?: boolean;
  hasFilters?: boolean;
  itemCount?: number;
  showSearch?: boolean;
  showPagination?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  hasHeader = true,
  hasFilters = true,
  itemCount = 10,
  showSearch = true,
  showPagination = true
}) => {
  return (
    <div className="p-6 animate-pulse">
      {/* Header */}
      {hasHeader && (
        <div className="mb-6">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      )}

      {/* Search and Filters */}
      {(showSearch || hasFilters) && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            {showSearch && (
              <div className="w-full md:w-1/3">
                <div className="h-10 bg-gray-100 rounded w-full"></div>
              </div>
            )}
            
            {/* Filters */}
            {hasFilters && (
              <div className="flex space-x-3">
                <div className="h-10 w-32 bg-gray-100 rounded"></div>
                <div className="h-10 w-24 bg-gray-100 rounded"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List Items */}
      <div className="bg-white rounded-lg shadow">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 h-4 bg-gray-200 rounded"></div>
            <div className="col-span-3 h-4 bg-gray-200 rounded"></div>
            <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
            <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
            <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Table Rows */}
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-100 last:border-b-0">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Profile/Avatar */}
              <div className="col-span-3 flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-100 rounded w-16"></div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="col-span-3 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-100 rounded w-24"></div>
              </div>
              
              {/* Status */}
              <div className="col-span-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              
              {/* Score/Rating */}
              <div className="col-span-2">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              
              {/* Actions */}
              <div className="col-span-2 flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="mt-6 flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="flex space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSkeleton;