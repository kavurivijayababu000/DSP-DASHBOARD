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

  useEffect(() => {
    const generateMockSDPOs = (): SDPO[] => {
      const officerNames = [
        'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Kavitha Rao', 'Suresh Babu'
      ];

      const getGrade = (score: number): 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' => {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'B+';
        if (score >= 75) return 'B';
        if (score >= 70) return 'C';
        return 'D';
      };

      // Simple default data generation
      return Array.from({ length: 6 }, (_, index) => {
        const baseScore = Math.random() * 20 + 75;
        return {
          id: (index + 1).toString(),
          name: `SDPO ${officerNames[index % officerNames.length]}`,
          district: 'Guntur',
          range: 'Guntur Range',
          jurisdiction: `Subdivision ${index + 1}`,
          performance: { 
            rank: index + 1, 
            score: Math.round(baseScore * 10) / 10, 
            grade: getGrade(baseScore) 
          },
          metrics: {
            casesResolved: Math.round((Math.random() * 20 + 75) * 10) / 10,
            responseTime: Math.round((Math.random() * 5 + 5) * 10) / 10,
            citizenSatisfaction: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
            inspections: Math.round(Math.random() * 50 + 100),
            communityMeetings: Math.round(Math.random() * 20 + 10)
          },
          trends: Array.from({ length: 6 }, (_, i) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
            score: Math.round((Math.random() * 15 + 75) * 10) / 10,
            cases: Math.round(Math.random() * 30 + 50)
          }))
        };
      });
    };

    setSDPOs(generateMockSDPOs());
  }, [userRole, userJurisdiction, comparisonType]);

  const getFilteredSDPOs = () => {
    let filtered = [...sdpos];
    
    if (filterGrade !== 'all') {
      filtered = filtered.filter(sdpo => sdpo.performance.grade === filterGrade);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return a.performance.rank - b.performance.rank;
        case 'score':
          return b.performance.score - a.performance.score;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getChartData = () => {
    return getFilteredSDPOs().map(sdpo => ({
      name: sdpo.jurisdiction,
      score: sdpo.performance.score,
      casesResolved: sdpo.metrics.casesResolved,
      responseTime: sdpo.metrics.responseTime,
      satisfaction: sdpo.metrics.citizenSatisfaction,
      inspections: sdpo.metrics.inspections
    }));
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-500 text-white';
      case 'A': return 'bg-green-400 text-white';
      case 'B+': return 'bg-yellow-500 text-white';
      case 'B': return 'bg-yellow-400 text-black';
      case 'C': return 'bg-orange-500 text-white';
      case 'D': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">SDPO Performance Comparison</h2>
          <p className="text-gray-600">Compare and analyze SDPO performance across your jurisdiction</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="rank">Sort by Rank</option>
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
          </select>
          
          <select 
            value={filterGrade} 
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Grades</option>
            <option value="A+">Grade A+</option>
            <option value="A">Grade A</option>
            <option value="B+">Grade B+</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
          </select>
          
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="score">Overall Score</option>
            <option value="casesResolved">Cases Resolved</option>
            <option value="responseTime">Response Time</option>
            <option value="satisfaction">Citizen Satisfaction</option>
            <option value="inspections">Inspections</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Comparison Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar 
              dataKey={selectedMetric} 
              fill="#2563eb" 
              radius={[4, 4, 0, 0]}
              name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredSDPOs().map((sdpo) => (
          <div 
            key={sdpo.id} 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSDPOSelect(sdpo)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{sdpo.name}</h3>
                <p className="text-sm text-gray-600">{sdpo.jurisdiction}</p>
                <p className="text-xs text-gray-500">{sdpo.district}</p>
                <p className="text-xs text-gray-400">{sdpo.range}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeColor(sdpo.performance.grade)}`}>
                  {sdpo.performance.grade}
                </span>
                <p className="text-sm text-gray-500 mt-1">Rank #{sdpo.performance.rank}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Score</span>
                <span className="font-semibold text-blue-600">{sdpo.performance.score}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cases Resolved</span>
                <span className="font-medium">{sdpo.metrics.casesResolved}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="font-medium">{sdpo.metrics.responseTime} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Satisfaction</span>
                <span className="font-medium">{sdpo.metrics.citizenSatisfaction}/5</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                View Detailed Performance →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {getFilteredSDPOs().filter(s => s.performance.grade === 'A+' || s.performance.grade === 'A').length}
            </p>
            <p className="text-sm text-gray-600">High Performers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {getFilteredSDPOs().filter(s => s.performance.grade === 'B+' || s.performance.grade === 'B').length}
            </p>
            <p className="text-sm text-gray-600">Average Performers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {getFilteredSDPOs().filter(s => s.performance.grade === 'C' || s.performance.grade === 'D').length}
            </p>
            <p className="text-sm text-gray-600">Needs Improvement</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {getFilteredSDPOs().length > 0 ? Math.round(getFilteredSDPOs().reduce((acc, s) => acc + s.performance.score, 0) / getFilteredSDPOs().length) : 0}%
            </p>
            <p className="text-sm text-gray-600">Average Score</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDPOComparisonTab;
