import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import SDPOComparisonTab from './SDPOComparisonTab';

interface PerformanceTrackingTabProps {
  sdpoData?: any[];
}

interface PerformanceFormat {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  status: string;
  columns: string[];
  sampleData: any[];
}

const PerformanceTrackingTab: React.FC<PerformanceTrackingTabProps> = ({ sdpoData = [] }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [showSDPOSelection, setShowSDPOSelection] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Get performance tracking statistics based on user role
  const getPerformanceStats = () => {
    const stats = [
      { label: 'Total Submissions', value: 245, color: 'bg-blue-500' },
      { label: 'Pending Reviews', value: 23, color: 'bg-yellow-500' },
      { label: 'Approved Reports', value: 198, color: 'bg-green-500' },
      { label: 'Returned Items', value: 24, color: 'bg-red-500' },
    ];

    if (user?.role === 'DGP') {
      return stats.map(stat => ({ ...stat, value: stat.value * 8 })); // State-wide multiplier
    } else if (user?.role === 'DIG') {
      return stats.map(stat => ({ ...stat, value: stat.value * 3 })); // Range multiplier
    } else if (['SP', 'CP'].includes(user?.role || '')) {
      return stats.map(stat => ({ ...stat, value: stat.value * 2 })); // District multiplier
    }
    
    return stats; // SDPO level
  };

  // Get available performance formats with detailed columns
  const getPerformanceFormats = (): PerformanceFormat[] => {
    return [
      {
        id: 'daily_activities',
        title: 'Daily Activities Report',
        description: 'Track daily police activities and operations',
        icon: '📋',
        color: 'blue',
        status: 'Active',
        columns: ['Date', 'Activity Type', 'Location', 'Officers Involved', 'Duration', 'Outcome', 'Remarks'],
        sampleData: [
          { Date: '2024-01-15', 'Activity Type': 'Patrol', Location: 'Main Street', 'Officers Involved': 4, Duration: '8 hours', Outcome: 'Completed', Remarks: 'No incidents' },
          { Date: '2024-01-15', 'Activity Type': 'Investigation', Location: 'Crime Scene A', 'Officers Involved': 2, Duration: '4 hours', Outcome: 'In Progress', Remarks: 'Evidence collected' }
        ]
      },
      {
        id: 'crime_statistics',
        title: 'Crime Statistics',
        description: 'Monitor crime rates and investigation progress',
        icon: '🚨',
        color: 'red',
        status: 'Active',
        columns: ['Crime Type', 'Cases Registered', 'Cases Solved', 'Pending Cases', 'Conviction Rate', 'Area', 'Month'],
        sampleData: [
          { 'Crime Type': 'Theft', 'Cases Registered': 45, 'Cases Solved': 32, 'Pending Cases': 13, 'Conviction Rate': '78%', Area: 'Zone A', Month: 'January' },
          { 'Crime Type': 'Assault', 'Cases Registered': 23, 'Cases Solved': 18, 'Pending Cases': 5, 'Conviction Rate': '82%', Area: 'Zone B', Month: 'January' }
        ]
      },
      {
        id: 'traffic_management',
        title: 'Traffic Management',
        description: 'Track traffic violations and road safety measures',
        icon: '🚦',
        color: 'yellow',
        status: 'Active',
        columns: ['Date', 'Violation Type', 'Fines Collected', 'Accidents', 'Safety Measures', 'Traffic Volume', 'Peak Hours'],
        sampleData: [
          { Date: '2024-01-15', 'Violation Type': 'Speeding', 'Fines Collected': '₹12,500', Accidents: 2, 'Safety Measures': 'Speed Cameras', 'Traffic Volume': 'High', 'Peak Hours': '8-10 AM' },
          { Date: '2024-01-15', 'Violation Type': 'Signal Jump', 'Fines Collected': '₹8,000', Accidents: 1, 'Safety Measures': 'Traffic Police', 'Traffic Volume': 'Medium', 'Peak Hours': '6-8 PM' }
        ]
      },
      {
        id: 'community_engagement',
        title: 'Community Engagement',
        description: 'Track community outreach and public relations',
        icon: '👥',
        color: 'green',
        status: 'Active',
        columns: ['Program Name', 'Date', 'Participants', 'Location', 'Feedback Score', 'Follow-up Required', 'Impact'],
        sampleData: [
          { 'Program Name': 'Safety Awareness', Date: '2024-01-15', Participants: 150, Location: 'Community Hall', 'Feedback Score': 4.5, 'Follow-up Required': 'Yes', Impact: 'High' },
          { 'Program Name': 'School Visit', Date: '2024-01-16', Participants: 200, Location: 'Government School', 'Feedback Score': 4.8, 'Follow-up Required': 'No', Impact: 'Very High' }
        ]
      },
      {
        id: 'resource_management',
        title: 'Resource Management',
        description: 'Monitor equipment, vehicles, and personnel deployment',
        icon: '🚓',
        color: 'purple',
        status: 'Active',
        columns: ['Resource Type', 'Total Available', 'Currently Deployed', 'Under Maintenance', 'Utilization Rate', 'Cost', 'Status'],
        sampleData: [
          { 'Resource Type': 'Vehicles', 'Total Available': 25, 'Currently Deployed': 20, 'Under Maintenance': 3, 'Utilization Rate': '88%', Cost: '₹45,00,000', Status: 'Good' },
          { 'Resource Type': 'Communication Equipment', 'Total Available': 50, 'Currently Deployed': 48, 'Under Maintenance': 1, 'Utilization Rate': '98%', Cost: '₹12,00,000', Status: 'Excellent' }
        ]
      }
    ];
  };

  const performanceStats = getPerformanceStats();
  const performanceFormats = getPerformanceFormats();

  // Handle viewing detailed performance for specific SDPO
  const handleViewDetails = () => {
    setShowDetailedView(true);
  };

  const handleBackToOverview = () => {
    setShowDetailedView(false);
    setShowSDPOSelection(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Tracking</h2>
          <p className="text-gray-600 mt-1">Monitor and analyze police performance metrics</p>
        </div>
        
        {/* Role-based SDPO Selection for Superior Officers */}
        {(['DGP', 'DIG', 'SP', 'CP'].includes(user?.role || '')) && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowSDPOSelection(!showSDPOSelection)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showSDPOSelection ? 'Hide SDPO Selection' : 'Select SDPO Details'}
            </button>
            {showDetailedView && (
              <button
                onClick={handleBackToOverview}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Overview
              </button>
            )}
          </div>
        )}
      </div>

      {/* SDPO Selection Interface */}
      {showSDPOSelection && ['DGP', 'DIG', 'SP', 'CP'].includes(user?.role || '') && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select SDPO for Detailed Performance View</h3>
          <SDPOComparisonTab 
            userRole={user?.role}
            userJurisdiction={user?.jurisdiction}
            onSDPOSelect={(sdpo) => {
              console.log('Selected SDPO:', sdpo);
              handleViewDetails();
            }}
          />
        </div>
      )}

      {/* Performance Statistics Cards */}
      {!showDetailedView && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${stat.color} rounded-full mr-3`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Formats Grid */}
      {!showDetailedView && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Performance Tracking Formats</h3>
            <p className="text-sm text-gray-600 mt-1">Click on any format to view detailed entries and statistics</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {performanceFormats.map((format) => (
              <div
                key={format.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setShowDetailedView(true)}
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{format.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{format.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full bg-${format.color}-100 text-${format.color}-800`}>
                      {format.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{format.description}</p>
                <div className="text-xs text-gray-500">
                  <p>Columns: {format.columns.length}</p>
                  <p>Sample Entries: {format.sampleData.length}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Performance View */}
      {showDetailedView && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Detailed Performance Analysis</h3>
                <p className="text-sm text-gray-600 mt-1">Comprehensive view of all performance formats and their data</p>
              </div>
              <button
                onClick={handleBackToOverview}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Overview
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {performanceFormats.map((format) => (
              <div key={format.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className={`p-4 bg-${format.color}-50 border-b border-gray-200`}>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{format.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{format.title}</h4>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`px-3 py-1 text-sm rounded-full bg-${format.color}-100 text-${format.color}-800`}>
                        {format.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {format.columns.map((column, index) => (
                          <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {format.sampleData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {format.columns.map((column, colIndex) => (
                            <td key={colIndex} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                              {row[column] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Total Entries: {format.sampleData.length}</span>
                    <span>Last Updated: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions for SDPO Role */}
      {(!user?.role || user?.role === 'SDPO' || !['DGP', 'DIG', 'SP', 'CP'].includes(user?.role)) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Tracking Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">For SDPOs:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Submit daily activity reports using the prescribed formats</li>
                <li>Update crime statistics and investigation progress</li>
                <li>Record traffic management activities and violations</li>
                <li>Document community engagement programs</li>
                <li>Maintain resource deployment and utilization records</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">For Superior Officers (SP/CP/DIG/DGP):</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>View all SDPO submissions under your jurisdiction</li>
                <li>Download reports and supporting documents</li>
                <li>Monitor performance trends and compliance rates</li>
                <li>Access jurisdiction-based analytics and comparisons</li>
                <li>Generate consolidated reports for higher authorities</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The performance tracking system supports hierarchical data visibility. 
              Each officer level can view data according to their jurisdiction and authority level.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceTrackingTab;
