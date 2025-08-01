import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PerformanceData } from '../../store/slices/dashboardSlice';

interface PerformanceChartProps {
  data: PerformanceData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  // Mock time series data for the chart
  const timeSeriesData = [
    { month: 'Jan', score: 85.2, cases: 234, resolved: 198 },
    { month: 'Feb', score: 87.1, cases: 267, resolved: 224 },
    { month: 'Mar', score: 89.3, cases: 289, resolved: 251 },
    { month: 'Apr', score: 91.7, cases: 312, resolved: 287 },
    { month: 'May', score: 88.9, cases: 298, resolved: 265 },
    { month: 'Jun', score: 92.4, cases: 325, resolved: 301 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Trends</h3>
        <p className="text-sm text-gray-600">Monthly performance scores and case resolution</p>
      </div>

      {/* Performance Score Chart */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-700 mb-4">Performance Score Trend</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              domain={[80, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#2563eb" 
              strokeWidth={3}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Case Resolution Chart */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-4">Case Resolution Statistics</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="cases" fill="#93c5fd" name="Total Cases" />
            <Bar dataKey="resolved" fill="#2563eb" name="Resolved Cases" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {timeSeriesData[timeSeriesData.length - 1]?.resolved || 0}
          </p>
          <p className="text-sm text-gray-600">Cases Resolved</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {Math.round((timeSeriesData.reduce((acc, curr) => acc + curr.score, 0) / timeSeriesData.length) * 10) / 10}
          </p>
          <p className="text-sm text-gray-600">Avg Score</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {Math.round(((timeSeriesData[timeSeriesData.length - 1]?.resolved || 0) / (timeSeriesData[timeSeriesData.length - 1]?.cases || 1)) * 100)}%
          </p>
          <p className="text-sm text-gray-600">Resolution Rate</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
