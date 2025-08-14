import React, { memo } from 'react';
import { KPIMetric } from '../../store/slices/dashboardSlice';

interface KPICardProps {
  kpi: KPIMetric;
}

const KPICard: React.FC<KPICardProps> = memo(({ kpi }) => {
  const getTrendIcon = () => {
    switch (kpi.trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = () => {
    switch (kpi.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressPercentage = () => {
    return Math.min((kpi.value / kpi.target) * 100, 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{kpi.name}</h3>
        <span className="text-lg">{getTrendIcon()}</span>
      </div>
      
      <div className="mb-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-800">
            {kpi.value}
          </span>
          <span className="text-sm text-gray-500">{kpi.unit}</span>
        </div>
        <p className="text-sm text-gray-500">Target: {kpi.target} {kpi.unit}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              getProgressPercentage() >= 90 ? 'bg-green-500' :
              getProgressPercentage() >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Change Indicator */}
      <div className={`flex items-center text-sm ${getTrendColor()}`}>
        <span>{kpi.change > 0 ? '+' : ''}{kpi.change}% </span>
        <span className="text-gray-500 ml-1">from last period</span>
      </div>
    </div>
  );
});

KPICard.displayName = 'KPICard';

export default KPICard;
