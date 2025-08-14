import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setKPIMetrics, setPerformanceData, KPIMetric, PerformanceData } from '../store/slices/dashboardSlice';

// Enhanced Components
import KPICard from '../components/Dashboard/KPICard';
import PerformanceChart from '../components/Dashboard/PerformanceChart';
import RecentActivities from '../components/Dashboard/RecentActivities';
import SDPOComparisonTab from '../components/Dashboard/SDPOComparisonTab';
import SDPODetailModal from '../components/Dashboard/SDPODetailModal';
import CommunicationTab from '../components/Dashboard/CommunicationTab';
import PerformanceTrackingTab from '../components/Dashboard/PerformanceTrackingTab';

import { 
  getSDPOsForDistrict, 
  resolveUserJurisdictionToDistrict,
  getRangeForDistrict,
  getAllDistricts,
  getTotalSDPOCount
} from '../services/policeDataService';

// Main Dashboard Component
const UnifiedDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { kpiMetrics, performanceData } = useSelector((state: RootState) => state.dashboard);
  
  // State Management
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState('performance');
  const [selectedSDPO, setSelectedSDPO] = useState<any>(null);
  const [isSDPOModalOpen, setIsSDPOModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Role-based Configuration
  const roleConfig = useMemo(() => {
    const config = {
      title: '',
      subtitle: '',
      primaryColor: 'bg-blue-600',
      sections: [] as Array<{
        id: string;
        label: string;
        icon: string;
        description: string;
        enabled: boolean;
        subSections?: Array<{ id: string; label: string; icon: string }>;
      }>
    };

    switch (user?.role) {
      case 'DGP':
        config.title = 'State Command Center';
        config.subtitle = 'Complete oversight of Andhra Pradesh Police operations';
        config.primaryColor = 'bg-red-600';
        config.sections = [
          {
            id: 'overview',
            label: 'State Overview',
            icon: '🏛️',
            description: 'Real-time state-wide performance metrics',
            enabled: true,
            subSections: [
              { id: 'performance', label: 'Performance', icon: '📊' },
              { id: 'crime-analysis', label: 'Crime Analysis', icon: '🔍' },
              { id: 'alerts', label: 'Critical Alerts', icon: '🚨' }
            ]
          },
          {
            id: 'range-management',
            label: 'Range Management',
            icon: '🗺️',
            description: 'Monitor all 5 ranges and their performance',
            enabled: true,
            subSections: [
              { id: 'range-overview', label: 'All Ranges', icon: '📋' },
              { id: 'range-comparison', label: 'Comparison', icon: '⚖️' }
            ]
          },
          {
            id: 'district-operations',
            label: 'District Operations',
            icon: '🏢',
            description: 'Detailed district-wise monitoring',
            enabled: true,
            subSections: [
              { id: 'all-districts', label: 'All Districts', icon: '📊' },
              { id: 'high-priority', label: 'Priority Districts', icon: '⭐' }
            ]
          },
          {
            id: 'sdpo-network',
            label: 'SDPO Network',
            icon: '👥',
            description: 'Complete SDPO performance tracking',
            enabled: true,
            subSections: [
              { id: 'sdpo-overview', label: 'All SDPOs (108)', icon: '👨‍✈️' },
              { id: 'top-performers', label: 'Top Performers', icon: '🏆' },
              { id: 'attention-needed', label: 'Needs Attention', icon: '⚠️' }
            ]
          },
          {
            id: 'communication',
            label: 'Command Center',
            icon: '📡',
            description: 'State-wide communication and coordination',
            enabled: true,
            subSections: [
              { id: 'broadcast', label: 'Broadcast', icon: '📢' },
              { id: 'emergency', label: 'Emergency', icon: '🚨' }
            ]
          }
        ];
        break;

      case 'DIG':
        config.title = `${user.jurisdiction} Range Command`;
        config.subtitle = `Complete oversight of ${user.jurisdiction} operations`;
        config.primaryColor = 'bg-orange-600';
        config.sections = [
          {
            id: 'overview',
            label: 'Range Overview',
            icon: '🗺️',
            description: 'Real-time range performance metrics',
            enabled: true,
            subSections: [
              { id: 'performance', label: 'Performance', icon: '📊' },
              { id: 'crime-analysis', label: 'Crime Analysis', icon: '🔍' }
            ]
          },
          {
            id: 'district-operations',
            label: 'District Operations',
            icon: '🏢',
            description: 'Monitor districts in your range',
            enabled: true,
            subSections: [
              { id: 'all-districts', label: 'All Districts', icon: '📊' },
              { id: 'comparison', label: 'District Comparison', icon: '⚖️' }
            ]
          },
          {
            id: 'sdpo-network',
            label: 'SDPO Network',
            icon: '👥',
            description: 'Range-specific SDPO monitoring',
            enabled: true,
            subSections: [
              { id: 'sdpo-overview', label: 'Range SDPOs', icon: '👨‍✈️' },
              { id: 'performance-tracking', label: 'Performance', icon: '📈' }
            ]
          }
        ];
        break;

      case 'SP':
      case 'CP':
        const districtType = user?.role === 'CP' ? 'Commissionerate' : 'District';
        config.title = `${user.jurisdiction} ${districtType} Command`;
        config.subtitle = `Complete oversight of ${user.jurisdiction} operations`;
        config.primaryColor = 'bg-green-600';
        config.sections = [
          {
            id: 'overview',
            label: `${districtType} Overview`,
            icon: '🏢',
            description: `Real-time ${districtType.toLowerCase()} performance metrics`,
            enabled: true,
            subSections: [
              { id: 'performance', label: 'Performance', icon: '📊' },
              { id: 'crime-analysis', label: 'Crime Analysis', icon: '🔍' }
            ]
          },
          {
            id: 'sdpo-network',
            label: 'SDPO Network',
            icon: '👥',
            description: `${districtType}-specific SDPO monitoring`,
            enabled: true,
            subSections: [
              { id: 'sdpo-overview', label: `${districtType} SDPOs`, icon: '👨‍✈️' },
              { id: 'performance-tracking', label: 'Performance', icon: '📈' },
              { id: 'individual-reports', label: 'Individual Reports', icon: '📋' }
            ]
          }
        ];
        break;

      case 'SDPO':
        config.title = `${user.jurisdiction} SDPO Dashboard`;
        config.subtitle = 'Personal performance and subdivision management';
        config.primaryColor = 'bg-blue-600';
        config.sections = [
          {
            id: 'overview',
            label: 'My Performance',
            icon: '📊',
            description: 'Personal performance metrics and trends',
            enabled: true,
            subSections: [
              { id: 'current', label: 'Current Period', icon: '📈' },
              { id: 'trends', label: 'Historical Trends', icon: '📉' }
            ]
          },
          {
            id: 'subdivision',
            label: 'Subdivision Management',
            icon: '🏘️',
            description: 'Manage your subdivision operations',
            enabled: true,
            subSections: [
              { id: 'operations', label: 'Operations', icon: '⚙️' },
              { id: 'reports', label: 'Reports', icon: '📋' }
            ]
          }
        ];
        break;

      default:
        config.title = 'Dashboard';
        config.subtitle = 'Welcome to SDPO Dashboard';
        config.sections = [];
    }

    return config;
  }, [user]);

  // Generate KPI data based on user role and jurisdiction
  const generateRoleBasedKPIs = (): KPIMetric[] => {
    const baseKPIs: KPIMetric[] = [];
    
    if (user?.role === 'DGP') {
      baseKPIs.push(
        { id: 'total-sdpos', name: 'Total SDPOs', value: getTotalSDPOCount(), target: 108, unit: 'officers', trend: 'stable' as const, change: 0 },
        { id: 'active-districts', name: 'Active Districts', value: getAllDistricts().length, target: 26, unit: 'districts', trend: 'stable' as const, change: 0 },
        { id: 'state-performance', name: 'State Performance', value: 87.3, target: 90, unit: '%', trend: 'up' as const, change: 2.1 },
        { id: 'resolved-cases', name: 'Cases Resolved', value: 92.1, target: 95, unit: '%', trend: 'up' as const, change: 1.8 },
        { id: 'emergency-response', name: 'Emergency Response', value: 4.2, target: 5, unit: 'min', trend: 'down' as const, change: -0.3 },
        { id: 'citizen-satisfaction', name: 'Citizen Satisfaction', value: 4.6, target: 4.5, unit: '/5', trend: 'up' as const, change: 0.2 }
      );
    } else if (user?.role === 'DIG') {
      // Get districts in DIG's range
      const rangeDistricts = getAllDistricts().filter(district => {
        const districtRange = getRangeForDistrict(district);
        const rangeName = user.jurisdiction?.replace(' Range', '').trim();
        return districtRange && districtRange.toLowerCase().includes(rangeName?.toLowerCase() || '');
      });
      
      baseKPIs.push(
        { id: 'range-districts', name: 'Range Districts', value: rangeDistricts.length, target: rangeDistricts.length, unit: 'districts', trend: 'stable' as const, change: 0 },
        { id: 'range-performance', name: 'Range Performance', value: 85.7, target: 90, unit: '%', trend: 'up' as const, change: 1.5 },
        { id: 'cases-resolved', name: 'Cases Resolved', value: 89.4, target: 95, unit: '%', trend: 'up' as const, change: 2.3 },
        { id: 'response-time', name: 'Avg Response Time', value: 4.8, target: 5, unit: 'min', trend: 'down' as const, change: -0.5 }
      );
    } else if (user?.role === 'SP' || user?.role === 'CP') {
      const districtSDPOs = getSDPOsForDistrict(resolveUserJurisdictionToDistrict(user.jurisdiction || '', user.role as 'SP' | 'CP'));
      
      baseKPIs.push(
        { id: 'district-sdpos', name: 'District SDPOs', value: districtSDPOs.length, target: districtSDPOs.length, unit: 'officers', trend: 'stable' as const, change: 0 },
        { id: 'district-performance', name: 'District Performance', value: 88.2, target: 90, unit: '%', trend: 'up' as const, change: 1.2 },
        { id: 'cases-resolved', name: 'Cases Resolved', value: 91.7, target: 95, unit: '%', trend: 'up' as const, change: 2.8 },
        { id: 'response-time', name: 'Response Time', value: 4.1, target: 5, unit: 'min', trend: 'down' as const, change: -0.7 }
      );
    } else if (user?.role === 'SDPO') {
      baseKPIs.push(
        { id: 'personal-performance', name: 'My Performance', value: 89.5, target: 90, unit: '%', trend: 'up' as const, change: 3.2 },
        { id: 'cases-resolved', name: 'Cases Resolved', value: 94.2, target: 95, unit: '%', trend: 'up' as const, change: 1.8 },
        { id: 'response-time', name: 'Response Time', value: 3.8, target: 5, unit: 'min', trend: 'down' as const, change: -1.2 },
        { id: 'citizen-feedback', name: 'Citizen Feedback', value: 4.7, target: 4.5, unit: '/5', trend: 'up' as const, change: 0.3 }
      );
    }
    
    return baseKPIs;
  };

  // Initialize data on component mount
  useEffect(() => {
    const kpis = generateRoleBasedKPIs();
    dispatch(setKPIMetrics(kpis));
    
    // Generate mock performance data in the correct format
    const mockPerformanceData: PerformanceData[] = [
      {
        sdpoId: 'mock-1',
        sdpoName: 'Sample SDPO',
        district: user?.jurisdiction || 'Sample District',
        range: getRangeForDistrict(user?.jurisdiction || 'Guntur') || 'Sample Range',
        metrics: kpis.slice(0, 3), // Use first 3 KPIs as metrics
        rank: 1,
        score: 89.5,
        lastUpdated: new Date().toISOString()
      }
    ];
    
    dispatch(setPerformanceData(mockPerformanceData));
  }, [dispatch, user, refreshTrigger]);

  const handleSDPOSelect = (sdpo: any) => {
    setSelectedSDPO(sdpo);
    setIsSDPOModalOpen(true);
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Chart data for performance visualization
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      performance: Math.round((Math.random() * 20 + 75) * 10) / 10,
      cases: Math.round(Math.random() * 100 + 150),
      efficiency: Math.round((Math.random() * 15 + 80) * 10) / 10
    }));
  }, [refreshTrigger]);

  // Render Section Content
  const renderSectionContent = () => {
    const currentSection = roleConfig.sections.find(s => s.id === activeSection);
    
    if (!currentSection) return null;

    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'range-management':
        return renderRangeManagementSection();
      case 'district-operations':
        return renderDistrictOperationsSection();
      case 'sdpo-network':
        return renderSDPONetworkSection();
      case 'communication':
        return renderCommunicationSection();
      case 'subdivision':
        return renderSubdivisionSection();
      default:
        return <div className="text-center py-8 text-gray-500">Section content coming soon...</div>;
    }
  };

  // Overview Section
  const renderOverviewSection = () => (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {roleConfig.sections.find(s => s.id === 'overview')?.subSections?.map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubSection(sub.id)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSubSection === sub.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{sub.icon}</span>
            {sub.label}
          </button>
        ))}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiMetrics?.map(kpi => (
          <div key={kpi.id} className="transform hover:scale-105 transition-transform">
            <KPICard kpi={kpi} />
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      {chartData && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            <div className="flex space-x-2">
              <select className="text-sm border border-gray-300 rounded px-3 py-1">
                <option>Last 12 months</option>
                <option>Last 6 months</option>
                <option>Last 3 months</option>
              </select>
            </div>
          </div>
          <PerformanceChart data={performanceData || []} />
        </div>
      )}

      {/* Role-specific Overview Content */}
      {activeSubSection === 'crime-analysis' && renderCrimeAnalysis()}
      {activeSubSection === 'alerts' && user?.role === 'DGP' && renderCriticalAlerts()}
    </div>
  );

  // Crime Analysis Component
  const renderCrimeAnalysis = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Crime Analysis Overview</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Crime Registrations</h4>
            <div className="text-2xl font-bold text-blue-600">2,847</div>
            <div className="text-sm text-gray-500">↑ 5.3% from last month</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Charge Sheets Filed</h4>
            <div className="text-2xl font-bold text-green-600">2,134</div>
            <div className="text-sm text-gray-500">↑ 8.1% from last month</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Resolution Rate</h4>
            <div className="text-2xl font-bold text-purple-600">87.3%</div>
            <div className="text-sm text-gray-500">↑ 2.1% from last month</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Pending Cases</h4>
            <div className="text-2xl font-bold text-orange-600">713</div>
            <div className="text-sm text-gray-500">↓ 3.2% from last month</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Critical Alerts (DGP Only)
  const renderCriticalAlerts = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Alerts</h3>
      <div className="space-y-3">
        {[
          { type: 'high', message: '3 districts showing decreased performance', time: '2 hours ago', icon: '⚠️' },
          { type: 'medium', message: '5 SDPOs pending monthly reports', time: '4 hours ago', icon: '📋' },
          { type: 'low', message: 'System maintenance scheduled', time: '1 day ago', icon: '🔧' }
        ].map((alert, index) => (
          <div key={index} className={`p-3 rounded-lg border-l-4 ${
            alert.type === 'high' ? 'bg-red-50 border-red-400' :
            alert.type === 'medium' ? 'bg-yellow-50 border-yellow-400' :
            'bg-blue-50 border-blue-400'
          }`}>
            <div className="flex items-center">
              <span className="mr-3 text-lg">{alert.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{alert.message}</p>
                <p className="text-sm text-gray-500">{alert.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Range Management Section (DGP Only)
  const renderRangeManagementSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {[
          { name: 'Visakhapatnam Range', districts: 6, performance: 89.2, color: 'bg-green-500' },
          { name: 'Eluru Range', districts: 5, performance: 85.7, color: 'bg-blue-500' },
          { name: 'Vijayawada Range', districts: 5, performance: 87.1, color: 'bg-green-500' },
          { name: 'Guntur Range', districts: 5, performance: 84.3, color: 'bg-yellow-500' },
          { name: 'Ananthapuramu Range', districts: 5, performance: 86.8, color: 'bg-blue-500' }
        ].map((range, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-800 text-sm">{range.name}</h4>
              <div className={`w-3 h-3 rounded-full ${range.color}`}></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{range.performance}%</div>
            <div className="text-sm text-gray-500">{range.districts} districts</div>
          </div>
        ))}
      </div>
    </div>
  );

  // District Operations Section
  const renderDistrictOperationsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">District Performance Overview</h3>
        <div className="overflow-hidden">
          <SDPOComparisonTab 
            userRole={user?.role}
            userJurisdiction={user?.jurisdiction}
            onSDPOSelect={handleSDPOSelect}
            comparisonType="district-focused"
          />
        </div>
      </div>
    </div>
  );

  // SDPO Network Section
  const renderSDPONetworkSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">SDPO Network Management</h3>
          <div className="flex space-x-2">
            <select className="text-sm border border-gray-300 rounded px-3 py-1">
              <option>All SDPOs</option>
              <option>Top Performers</option>
              <option>Needs Attention</option>
            </select>
          </div>
        </div>
        <PerformanceTrackingTab sdpoData={[]} />
      </div>
    </div>
  );

  // Communication Section (DGP Only)
  const renderCommunicationSection = () => (
    <div className="space-y-6">
      <CommunicationTab />
    </div>
  );

  // Subdivision Section (SDPO Only)
  const renderSubdivisionSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Subdivision Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Active Cases</h4>
            <div className="text-2xl font-bold text-blue-600">127</div>
            <div className="text-sm text-gray-500">↑ 3 from yesterday</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Resolved Today</h4>
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-500">Target: 10/day</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Team Strength</h4>
            <div className="text-2xl font-bold text-purple-600">24</div>
            <div className="text-sm text-gray-500">All present</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">My Ranking</h4>
            <div className="text-2xl font-bold text-orange-600">#12</div>
            <div className="text-sm text-gray-500">State-wide</div>
          </div>
        </div>
      </div>
      <RecentActivities />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Title Section */}
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${roleConfig.primaryColor} mr-3`}></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{roleConfig.title}</h1>
                <p className="text-sm text-gray-500">{roleConfig.subtitle}</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={refreshData}
                className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm"
              >
                🔄 Refresh
              </button>
              <button className={`${roleConfig.primaryColor} text-white px-3 py-1.5 rounded-md hover:opacity-90 text-sm`}>
                📊 Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Enhanced Sidebar */}
          <div className="w-72 bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Dashboard Sections</h3>
            </div>
            <nav className="p-2">
              {roleConfig.sections.map(section => (
                <div key={section.id} className="mb-1">
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2.5 text-left rounded-md transition-colors ${
                      activeSection === section.id
                        ? `${roleConfig.primaryColor} text-white`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg mr-3">{section.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{section.label}</p>
                      <p className={`text-xs ${activeSection === section.id ? 'text-white/80' : 'text-gray-500'} truncate`}>
                        {section.description}
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {renderSectionContent()}
          </div>
        </div>
      </div>

      {/* SDPO Detail Modal */}
      {isSDPOModalOpen && selectedSDPO && (
        <SDPODetailModal
          sdpo={selectedSDPO}
          isOpen={isSDPOModalOpen}
          onClose={() => {
            setIsSDPOModalOpen(false);
            setSelectedSDPO(null);
          }}
        />
      )}
    </div>
  );
};

export default UnifiedDashboard;
