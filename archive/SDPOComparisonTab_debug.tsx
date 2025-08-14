import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SDPO {
  id: string;
  name: string;
  district: string;
  range: string;
  jurisdiction: string;
  performance: {
    rank: number;
    score: number;
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  };
  metrics: {
    casesResolved: number;
    responseTime: number;
    citizenSatisfaction: number;
    inspections: number;
    communityMeetings: number;
  };
  trends: {
    month: string;
    score: number;
    cases: number;
  }[];
}

interface SDPOComparisonTabProps {
  userRole?: string;
  userJurisdiction?: string;
  comparisonType?: string;
  onSDPOSelect: (sdpo: SDPO) => void;
}

const SDPOComparisonTab: React.FC<SDPOComparisonTabProps> = ({ 
  userRole, 
  userJurisdiction, 
  comparisonType = 'default', 
  onSDPOSelect 
}) => {
  const [sdpos, setSDPOs] = useState<SDPO[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('score');
  const [sortBy, setSortBy] = useState('rank');
  const [filterGrade, setFilterGrade] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Guntur');

  // Temporary simple implementation for debugging
  useEffect(() => {
    console.log('🔧 DEBUGGING: SDPOComparisonTab loaded successfully');
    console.log(`User Role: ${userRole}, Jurisdiction: ${userJurisdiction}`);
    
    // Create a simple mock SDPO for testing
    const mockSDPO: SDPO = {
      id: '1',
      name: 'SDPO Test Officer',
      district: userJurisdiction || 'Guntur',
      range: 'Test Range',
      jurisdiction: 'Test Jurisdiction',
      performance: {
        rank: 1,
        score: 85.5,
        grade: 'A'
      },
      metrics: {
        casesResolved: 85.5,
        responseTime: 8.2,
        citizenSatisfaction: 4.2,
        inspections: 150,
        communityMeetings: 25
      },
      trends: [
        { month: 'Jan', score: 85, cases: 150 },
        { month: 'Feb', score: 87, cases: 160 },
        { month: 'Mar', score: 85, cases: 155 }
      ]
    };

    setSDPOs([mockSDPO]);
  }, [userRole, userJurisdiction, comparisonType, selectedDistrict]);

  // Filtered and sorted SDPOs
  const filteredSDPOs = sdpos
    .filter(sdpo => filterGrade === 'all' || sdpo.performance.grade === filterGrade)
    .sort((a, b) => {
      if (sortBy === 'rank') return a.performance.rank - b.performance.rank;
      if (sortBy === 'score') return b.performance.score - a.performance.score;
      if (sortBy === 'casesResolved') return b.metrics.casesResolved - a.metrics.casesResolved;
      if (sortBy === 'responseTime') return a.metrics.responseTime - b.metrics.responseTime;
      return 0;
    });

  const chartData = filteredSDPOs.slice(0, 10).map(sdpo => ({
    name: sdpo.jurisdiction,
    [selectedMetric]: selectedMetric === 'score' ? sdpo.performance.score : 
                      selectedMetric === 'casesResolved' ? sdpo.metrics.casesResolved :
                      selectedMetric === 'responseTime' ? sdpo.metrics.responseTime :
                      sdpo.metrics.citizenSatisfaction
  }));

  return (
    <div className="space-y-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <h3 className="font-bold">🔧 Debug Mode - Simplified SDPOComparisonTab</h3>
        <p>User Role: {userRole || 'Not specified'}</p>
        <p>Jurisdiction: {userJurisdiction || 'Not specified'}</p>
        <p>Comparison Type: {comparisonType}</p>
        <p>SDPO Count: {filteredSDPOs.length}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="score">Performance Score</option>
            <option value="casesResolved">Cases Resolved %</option>
            <option value="responseTime">Response Time</option>
            <option value="citizenSatisfaction">Citizen Satisfaction</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rank">Sort by Rank</option>
            <option value="score">Sort by Score</option>
            <option value="casesResolved">Sort by Cases Resolved</option>
            <option value="responseTime">Sort by Response Time</option>
          </select>

          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Grades</option>
            <option value="A+">Grade A+</option>
            <option value="A">Grade A</option>
            <option value="B+">Grade B+</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
          </select>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total SDPOs</h3>
          <p className="text-2xl font-bold text-gray-900">{filteredSDPOs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
          <p className="text-2xl font-bold text-green-600">
            {filteredSDPOs.length > 0 ? (filteredSDPOs.reduce((sum, sdpo) => sum + sdpo.performance.score, 0) / filteredSDPOs.length).toFixed(1) : '0.0'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Grade A+ Count</h3>
          <p className="text-2xl font-bold text-blue-600">
            {filteredSDPOs.filter(sdpo => sdpo.performance.grade === 'A+').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Below Average</h3>
          <p className="text-2xl font-bold text-red-600">
            {filteredSDPOs.filter(sdpo => sdpo.performance.score < 80).length}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">SDPO Performance (Debug Mode)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={selectedMetric} fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SDPO List */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">SDPO Performance Details (Debug Mode)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SDPO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jurisdiction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cases Resolved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSDPOs.map((sdpo) => (
                <tr key={sdpo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{sdpo.performance.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sdpo.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sdpo.jurisdiction}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sdpo.district}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sdpo.range}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sdpo.performance.score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sdpo.performance.grade === 'A+' ? 'bg-green-100 text-green-800' :
                      sdpo.performance.grade === 'A' ? 'bg-green-100 text-green-700' :
                      sdpo.performance.grade === 'B+' ? 'bg-yellow-100 text-yellow-700' :
                      sdpo.performance.grade === 'B' ? 'bg-yellow-100 text-yellow-600' :
                      sdpo.performance.grade === 'C' ? 'bg-orange-100 text-orange-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {sdpo.performance.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sdpo.metrics.casesResolved}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sdpo.metrics.responseTime} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onSDPOSelect(sdpo)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SDPOComparisonTab;
