import React from 'react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Advanced Analytics</h1>
        <button className="bg-ap-blue-600 text-white px-4 py-2 rounded-lg hover:bg-ap-blue-700">
          📊 Generate Report
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Advanced analytics and insights coming soon...</p>
      </div>
    </div>
  );
};

export default AnalyticsPage;
