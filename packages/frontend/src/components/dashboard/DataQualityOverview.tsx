import React from 'react';

interface DataQualityOverviewProps {
  dataQuality: {
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
    topIssues: Array<{ type: string; count: number }>;
  };
}

export const DataQualityOverview: React.FC<DataQualityOverviewProps> = ({ dataQuality }) => {
  const getQualityScore = () => {
    if (dataQuality.totalIssues === 0) return 100;
    if (dataQuality.criticalIssues > 0) return 0;
    if (dataQuality.warnings > 10) return 50;
    return Math.max(0, 100 - (dataQuality.totalIssues * 5));
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const qualityScore = getQualityScore();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Data Quality Overview</h3>
        <div className="flex items-center space-x-2">
          <div className={`text-2xl font-bold ${getQualityColor(qualityScore)}`}>
            {qualityScore}%
          </div>
          <span className="text-sm text-gray-500">Quality Score</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quality Score */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - qualityScore / 100)}`}
                className={`${getQualityColor(qualityScore)} transition-all duration-500`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-lg font-bold ${getQualityColor(qualityScore)}`}>
                  {qualityScore}%
                </div>
                <div className="text-xs text-gray-500">
                  {getQualityStatus(qualityScore)}
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Overall Quality</p>
        </div>

        {/* Issues Breakdown */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Issues Breakdown</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-800">Critical Issues</span>
              </div>
              <span className="text-lg font-bold text-red-600">{dataQuality.criticalIssues}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">Warnings</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{dataQuality.warnings}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-800">Total Issues</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{dataQuality.totalIssues}</span>
            </div>
          </div>
        </div>

        {/* Top Issues */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Top Issues</h4>
          
          {dataQuality.topIssues.length > 0 ? (
            <div className="space-y-3">
              {dataQuality.topIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 truncate">{issue.type}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{issue.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-500 text-4xl mb-2">✅</div>
              <p className="text-sm text-gray-500">No issues detected</p>
              <p className="text-xs text-gray-400 mt-1">Data quality is excellent</p>
            </div>
          )}
        </div>
      </div>

      {/* Quality Recommendations */}
      {dataQuality.totalIssues > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-700 mb-3">Recommendations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataQuality.criticalIssues > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-red-800">Address Critical Issues</h5>
                    <p className="text-sm text-red-700 mt-1">
                      {dataQuality.criticalIssues} critical issues require immediate attention to maintain data integrity.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {dataQuality.warnings > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-yellow-800">Review Warnings</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      {dataQuality.warnings} warnings should be reviewed to improve data quality.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 