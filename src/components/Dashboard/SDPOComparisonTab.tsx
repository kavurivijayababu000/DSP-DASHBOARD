import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  getAllDistricts, 
  getSDPOsForDistrict, 
  getRangeForDistrict, 
  resolveUserJurisdictionToDistrict,
  getAllRanges,
  apPoliceStructure
} from '../../services/policeDataService';

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

  useEffect(() => {
    // Generate SDPO data using the corrected police data service
    const generateSDPOs = (): SDPO[] => {
      // Officer names pool
      const officerNames = [
        'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Kavitha Rao', 'Suresh Babu',
        'Lakshmi Devi', 'Ravi Teja', 'Sunitha Reddy', 'Venkat Rao', 'Madhavi Krishna',
        'Srinivas Rao', 'Padmavathi', 'Ramesh Chandra', 'Divya Bharathi', 'Kiran Kumar',
        'Saritha Devi', 'Naresh Varma', 'Gayathri Devi', 'Prakash Reddy', 'Swathi Kumari',
        'Mahesh Babu', 'Rekha Rani', 'Sanjay Gupta', 'Meera Shetty', 'Arjun Reddy',
        'Nirmala Devi', 'Vijay Kumar', 'Sushma Rani', 'Deepak Sharma', 'Vasantha Lakshmi'
      ];

      let allSDPOs: SDPO[] = [];
      let nameIndex = 0;

      const getGrade = (score: number): 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' => {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'B+';
        if (score >= 75) return 'B';
        if (score >= 70) return 'C';
        return 'D';
      };

      if (comparisonType === 'state-wide' && userRole === 'DGP') {
        // Generate SDPOs from all districts and commissionerates
        getAllDistricts().forEach(district => {
          const locations = getSDPOsForDistrict(district);
          locations.forEach((location, index) => {
            const baseScore = Math.random() * 20 + 75;

            allSDPOs.push({
              id: `${district}-${index + 1}`,
              name: `SDPO ${officerNames[nameIndex % officerNames.length]}`,
              district: district,
              range: getRangeForDistrict(district),
              jurisdiction: location.jurisdiction,
              performance: { 
                rank: nameIndex + 1, 
                score: Math.round(baseScore * 10) / 10, 
                grade: getGrade(baseScore) 
              },
              metrics: {
                casesResolved: Math.round((Math.random() * 15 + 80) * 10) / 10,
                responseTime: Math.round((Math.random() * 3 + 6) * 10) / 10,
                citizenSatisfaction: Math.round((Math.random() * 1 + 4) * 10) / 10,
                inspections: Math.round(Math.random() * 200 + 500),
                communityMeetings: Math.round(Math.random() * 50 + 80)
              },
              trends: Array.from({ length: 6 }, (_, i) => ({
                month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
                score: Math.round((Math.random() * 10 + 80) * 10) / 10,
                cases: Math.round(Math.random() * 100 + 200)
              }))
            });
            nameIndex++;
          });
        });
      } else if (comparisonType === 'range-wise' && userRole === 'DGP') {
        // Generate SDPOs range-wise
        getAllRanges().forEach((rangeName) => {
          const districtsInRange = rangeName.includes('Commissionerate') 
            ? [rangeName.replace(' Commissionerate', '')] 
            : apPoliceStructure.ranges[rangeName]?.districts || [];

          districtsInRange.forEach(district => {
            const locations = getSDPOsForDistrict(district);
            locations.forEach((location, index) => {
              const baseScore = Math.random() * 15 + 80;

              allSDPOs.push({
                id: `${district}-${index + 1}`,
                name: `SDPO ${officerNames[nameIndex % officerNames.length]}`,
                district: district,
                range: rangeName,
                jurisdiction: location.jurisdiction,
                performance: { 
                  rank: nameIndex + 1, 
                  score: Math.round(baseScore * 10) / 10, 
                  grade: getGrade(baseScore) 
                },
                metrics: {
                  casesResolved: Math.round((Math.random() * 15 + 80) * 10) / 10,
                  responseTime: Math.round((Math.random() * 3 + 6) * 10) / 10,
                  citizenSatisfaction: Math.round((Math.random() * 1 + 4) * 10) / 10,
                  inspections: Math.round(Math.random() * 200 + 500),
                  communityMeetings: Math.round(Math.random() * 50 + 80)
                },
                trends: Array.from({ length: 6 }, (_, i) => ({
                  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
                  score: Math.round((Math.random() * 10 + 80) * 10) / 10,
                  cases: Math.round(Math.random() * 100 + 200)
                }))
              });
              nameIndex++;
            });
          });
        });
      } else if (comparisonType === 'district-wise' && userRole === 'DGP') {
        // For DGP district-wise view, show SDPOs of the selected district (interactive)
        const targetDistrict = selectedDistrict;
        const locations = getSDPOsForDistrict(targetDistrict);
        
        if (locations && locations.length > 0) {
          allSDPOs = locations.map((location, index) => {
            const baseScore = Math.random() * 20 + 75;
            
            return {
              id: `${targetDistrict}-${index + 1}`,
              name: `SDPO ${officerNames[index % officerNames.length]}`,
              district: targetDistrict,
              range: getRangeForDistrict(targetDistrict),
              jurisdiction: location.jurisdiction,
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
                score: Math.round((Math.random() * 10 + 80) * 10) / 10,
                cases: Math.round(Math.random() * 80 + 150)
              }))
            };
          });
        }
      } else {
        // Default behavior for SP/CP roles - show specific district/commissionerate
        let targetDistrict = 'Guntur'; // Default
        
        if ((userRole === 'SP' || userRole === 'CP') && userJurisdiction) {
          // Use the corrected service function to resolve jurisdiction to district
          targetDistrict = resolveUserJurisdictionToDistrict(userJurisdiction, userRole as 'SP' | 'CP');
        }

        const districtData = getSDPOsForDistrict(targetDistrict);
        
        // Enhanced debug logging for SP/CP jurisdiction resolution with CORRECTED data
        console.log('🎯 SP/CP Login Analysis (CORRECTED subdivision_list.txt data):');
        console.log(`   👤 User Role: ${userRole}`);
        console.log(`   📍 Raw Jurisdiction: "${userJurisdiction}"`);
        console.log(`   🎯 Resolved District: "${targetDistrict}"`);
        console.log(`   📊 SDPO Count: ${districtData.length}`);
        console.log(`   🗺️ SDPO Details:`, districtData.map(d => d.jurisdiction));
        console.log(`   📋 Range: ${getRangeForDistrict(targetDistrict)}`);
        
        if (districtData.length === 0) {
          console.warn(`⚠️  WARNING: No SDPO data found for district: ${targetDistrict}`);
          console.log(`🔧 Available districts:`, getAllDistricts());
        }

        allSDPOs = districtData.map((location, index) => {
          const baseScore = Math.random() * 20 + 75;

          return {
            id: (index + 1).toString(),
            name: `SDPO ${officerNames[index % officerNames.length]}`,
            district: targetDistrict,
            range: location.range,
            jurisdiction: location.jurisdiction,
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
              score: Math.round((Math.random() * 10 + 80) * 10) / 10,
              cases: Math.round(Math.random() * 80 + 150)
            }))
          };
        });
      }

      return allSDPOs;
    };

    setSDPOs(generateSDPOs());
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
      {/* Data Accuracy Notice */}
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <h3 className="font-bold">✅ Data Corrected - Now using exact subdivision_list.txt structure</h3>
        <p className="text-sm">All subdivision data has been corrected to match the official AP Police structure including:</p>
        <p className="text-sm">• Kandukur moved from Prakasam to Nellore district</p>
        <p className="text-sm">• All other subdivisions verified against subdivision_list.txt</p>
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

        {/* District selector for DGP district-wise view */}
        {comparisonType === 'district-wise' && userRole === 'DGP' && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Select District:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getAllDistricts().map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        )}
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
        <h3 className="text-lg font-semibold mb-4">SDPO Performance (Corrected Data)</h3>
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
          <h3 className="text-lg font-semibold">SDPO Performance Details (Corrected Data)</h3>
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
