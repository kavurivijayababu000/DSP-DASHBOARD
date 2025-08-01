import React from 'react';

interface Activity {
  id: string;
  type: 'inspection' | 'patrol' | 'meeting' | 'training' | 'case' | 'report';
  title: string;
  description: string;
  timestamp: string;
  officer: string;
  status: 'completed' | 'in_progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
}

const RecentActivities: React.FC = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'case',
      title: 'High Priority Case Update',
      description: 'Case #2024-001 investigation completed, charge sheet filed',
      timestamp: '2 hours ago',
      officer: 'SDPO Rajesh Kumar',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '2',
      type: 'inspection',
      title: 'Station Inspection',
      description: 'Routine inspection of Srikakulam Police Station completed',
      timestamp: '4 hours ago',
      officer: 'SDPO Priya Sharma',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'patrol',
      title: 'Night Patrol',
      description: 'Special night patrol in vulnerable areas scheduled',
      timestamp: '6 hours ago',
      officer: 'SDPO Amit Singh',
      status: 'in_progress',
      priority: 'medium'
    },
    {
      id: '4',
      type: 'training',
      title: 'Training Session',
      description: 'Community policing training session for constables',
      timestamp: '8 hours ago',
      officer: 'SDPO Kavitha Rao',
      status: 'completed',
      priority: 'low'
    },
    {
      id: '5',
      type: 'meeting',
      title: 'Community Meeting',
      description: 'Village meeting to address local safety concerns',
      timestamp: '12 hours ago',
      officer: 'SDPO Suresh Babu',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '6',
      type: 'report',
      title: 'Monthly Report',
      description: 'Quarterly performance report submitted to SP office',
      timestamp: '1 day ago',
      officer: 'SDPO Lakshmi Devi',
      status: 'completed',
      priority: 'medium'
    }
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'case': return '📋';
      case 'inspection': return '🔍';
      case 'patrol': return '🚔';
      case 'training': return '🎓';
      case 'meeting': return '👥';
      case 'report': return '📊';
      default: return '📝';
    }
  };

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Activities</h3>
        <p className="text-sm text-gray-600">Latest updates from field officers</p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className={`border-l-4 ${getPriorityColor(activity.priority)} bg-gray-50 p-4 rounded-r-lg hover:bg-gray-100 transition-colors`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-800 truncate">
                      {activity.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{activity.officer}</span>
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-ap-blue-600 hover:text-ap-blue-800 font-medium">
          View All Activities →
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="bg-ap-blue-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-ap-blue-700 transition-colors">
          📝 Log Activity
        </button>
        <button className="bg-gray-200 text-gray-700 text-xs py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors">
          📊 View Reports
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;
