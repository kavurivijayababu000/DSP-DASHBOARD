import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Props interface
interface CrimeSituationTabProps {
  userRole: string;
  jurisdiction: string;
}

// Crime data interfaces
interface CrimeStatistics {
  totalFIRs: number;
  pendingCases: number;
  solvedCases: number;
  disposalRate: number;
  responseTime: number;
  specialCrimes: {
    scstCases: number;
    poscooCases: number;
    dowryDeaths: number;
    custodialDeaths: number;
  };
}

interface CrimeTrend {
  month: string;
  totalCrimes: number;
  solved: number;
  pending: number;
  newRegistrations: number;
}

interface CrimeCategory {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const CrimeSituationTab: React.FC<CrimeSituationTabProps> = ({ userRole, jurisdiction }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [crimeStats, setCrimeStats] = useState<CrimeStatistics | null>(null);
  const [crimeTrends, setCrimeTrends] = useState<CrimeTrend[]>([]);
  const [crimeCategories, setCrimeCategories] = useState<CrimeCategory[]>([]);
  const [alertData, setAlertData] = useState<any[]>([]);

  // Generate mock data based on user role and jurisdiction
  useEffect(() => {
    const generateCrimeData = () => {
      // Base statistics adjusted by role scope
      const baseMultiplier = userRole === 'DGP' ? 100 : 
                           userRole === 'DIG' ? 20 : 
                           userRole === 'SP' || userRole === 'CP' ? 5 : 1;

      const mockStats: CrimeStatistics = {
        totalFIRs: Math.round(1200 * baseMultiplier + Math.random() * 200),
        pendingCases: Math.round(180 * baseMultiplier + Math.random() * 50),
        solvedCases: Math.round(1020 * baseMultiplier + Math.random() * 100),
        disposalRate: Math.round((85 + Math.random() * 10) * 10) / 10,
        responseTime: Math.round((12 + Math.random() * 8) * 10) / 10,
        specialCrimes: {
          scstCases: Math.round(45 * baseMultiplier * 0.1 + Math.random() * 10),
          poscooCases: Math.round(23 * baseMultiplier * 0.1 + Math.random() * 5),
          dowryDeaths: Math.round(8 * baseMultiplier * 0.1 + Math.random() * 3),
          custodialDeaths: Math.round(2 * baseMultiplier * 0.1 + Math.random() * 1)
        }
      };

      // Crime trends for the last 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trends = months.map(month => ({
        month,
        totalCrimes: Math.round(100 * baseMultiplier + Math.random() * 30),
        solved: Math.round(80 * baseMultiplier + Math.random() * 20),
        pending: Math.round(20 * baseMultiplier + Math.random() * 10),
        newRegistrations: Math.round(95 * baseMultiplier + Math.random() * 25)
      }));

      // Crime categories distribution
      const categories: CrimeCategory[] = [
        { name: 'Property Crimes', count: Math.round(450 * baseMultiplier), percentage: 37.5, color: '#8B5CF6' },
        { name: 'Violent Crimes', count: Math.round(360 * baseMultiplier), percentage: 30.0, color: '#EF4444' },
        { name: 'Traffic Violations', count: Math.round(240 * baseMultiplier), percentage: 20.0, color: '#F59E0B' },
        { name: 'Cyber Crimes', count: Math.round(90 * baseMultiplier), percentage: 7.5, color: '#10B981' },
        { name: 'Others', count: Math.round(60 * baseMultiplier), percentage: 5.0, color: '#6B7280' }
      ];

      // Alert data for critical situations
      const alerts = [
        {
          id: 1,
          type: 'High Priority',
          message: 'Crime rate spike detected in urban areas',
          severity: 'critical',
          timestamp: '2 hours ago'
        },
        {
          id: 2,
          type: 'POCSO Alert',
          message: 'New POCSO case requires immediate attention',
          severity: 'high',
          timestamp: '4 hours ago'
        },
        {
          id: 3,
          type: 'Disposal Rate',
          message: 'Case disposal rate below target in 3 subdivisions',
          severity: 'medium',
          timestamp: '1 day ago'
        }
      ];

      setCrimeStats(mockStats);
      setCrimeTrends(trends);
      setCrimeCategories(categories);
      setAlertData(alerts);
    };

    generateCrimeData();
  }, [userRole, jurisdiction, selectedTimeRange]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getJurisdictionTitle = () => {
    if (userRole === 'DGP') return 'State-wide Crime Analysis';
    if (userRole === 'DIG') return `${jurisdiction} Range Crime Analysis`;
    if (userRole === 'SP' || userRole === 'CP') return `${jurisdiction} District Crime Analysis`;
    return `${jurisdiction} Crime Analysis`;
  };

  if (!crimeStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading crime analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getJurisdictionTitle()}</h2>
          <p className="text-gray-600">Comprehensive crime statistics and analysis</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            📊 Export Report
          </button>
        </div>
      </div>

      {/* Crime Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total FIRs</p>
              <p className="text-3xl font-bold text-gray-900">{crimeStats.totalFIRs.toLocaleString()}</p>
              <p className="text-sm text-green-600">↑ 2.5% from last period</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cases Solved</p>
              <p className="text-3xl font-bold text-gray-900">{crimeStats.solvedCases.toLocaleString()}</p>
              <p className="text-sm text-green-600">↑ 4.2% improvement</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disposal Rate</p>
              <p className="text-3xl font-bold text-gray-900">{crimeStats.disposalRate}%</p>
              <p className="text-sm text-red-600">↓ 1.1% below target</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-3xl font-bold text-gray-900">{crimeStats.responseTime}</p>
              <p className="text-xs text-gray-500">minutes average</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Crime Trends */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Crime Trends Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={crimeTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalCrimes" stroke="#3B82F6" strokeWidth={2} name="Total Crimes" />
              <Line type="monotone" dataKey="solved" stroke="#10B981" strokeWidth={2} name="Solved" />
              <Line type="monotone" dataKey="pending" stroke="#EF4444" strokeWidth={2} name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Crime Categories Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Crime Categories Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={crimeCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {crimeCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Cases']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {crimeCategories.map((category, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                <span className="text-sm text-gray-600">{category.name}</span>
                <span className="text-sm font-semibold text-gray-900">{category.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Crimes Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Special Crime Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{crimeStats.specialCrimes.scstCases}</div>
            <div className="text-sm text-red-700 font-medium">SC/ST Atrocity Cases</div>
            <div className="text-xs text-red-600 mt-1">High Priority</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{crimeStats.specialCrimes.poscooCases}</div>
            <div className="text-sm text-orange-700 font-medium">POCSO Cases</div>
            <div className="text-xs text-orange-600 mt-1">Child Protection</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{crimeStats.specialCrimes.dowryDeaths}</div>
            <div className="text-sm text-purple-700 font-medium">Dowry Deaths</div>
            <div className="text-xs text-purple-600 mt-1">Investigation Quality</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">{crimeStats.specialCrimes.custodialDeaths}</div>
            <div className="text-sm text-gray-700 font-medium">Custodial Deaths</div>
            <div className="text-xs text-gray-600 mt-1">Prevention Focus</div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Critical Alerts & Notifications</h3>
        <div className="space-y-4">
          {alertData.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{alert.type}</div>
                  <div className="text-sm mt-1">{alert.message}</div>
                </div>
                <div className="text-xs opacity-75">{alert.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrimeSituationTab;
