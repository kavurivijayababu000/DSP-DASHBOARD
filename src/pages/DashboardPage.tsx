import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setKPIMetrics, setPerformanceData } from '../store/slices/dashboardSlice';
import KPICard from '../components/Dashboard/KPICard';
import PerformanceChart from '../components/Dashboard/PerformanceChart';
import RecentActivities from '../components/Dashboard/RecentActivities';
import SDPOComparisonTab from '../components/Dashboard/SDPOComparisonTab';
import SDPODetailModal from '../components/Dashboard/SDPODetailModal';
import CommunicationTab from '../components/Dashboard/CommunicationTab';
import CrimeSituationTab from '../components/Dashboard/CrimeSituationTab';
import FieldEngagementTab from '../components/Dashboard/FieldEngagementTab';
import GrievanceTab from '../components/Dashboard/GrievanceTab';
import FileUploadComponent from '../components/FileUpload/FileUploadComponent';
import AdvancedAnalyticsTab from '../components/Dashboard/AdvancedAnalyticsTab';
import NotificationSystem from '../components/Notifications/NotificationSystem';
import ProfileManagement from '../components/Profile/ProfileManagement';
import SecurityControls from '../components/Security/SecurityControls';
import DataExportReports from '../components/Reports/DataExportReports';
import { 
  getSDPOsForDistrict, 
  resolveUserJurisdictionToDistrict,
  getRangeForDistrict 
} from '../services/policeDataService';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { kpiMetrics, performanceData } = useSelector((state: RootState) => state.dashboard);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSDPO, setSelectedSDPO] = useState<any>(null);
  const [isSDPOModalOpen, setIsSDPOModalOpen] = useState(false);
  const [comparisonSubTab, setComparisonSubTab] = useState('state-wide');

  useEffect(() => {
    // Generate dynamic performance data based on user jurisdiction
    const generatePerformanceData = () => {
      // Mock KPI data (can remain static for now)
      const mockKPIs = [
        {
          id: '1',
          name: 'Active SDPOs',
          value: 108,
          target: 108,
          unit: 'officers',
          trend: 'stable' as const,
          change: 0
        },
        {
          id: '2',
          name: 'Cases Solved',
          value: 87.5,
          target: 90,
          unit: '%',
          trend: 'up' as const,
          change: 2.3
        },
        {
          id: '3',
          name: 'Response Time',
          value: 8.2,
          target: 10,
          unit: 'minutes',
          trend: 'down' as const,
          change: -1.8
        },
        {
          id: '4',
          name: 'Citizen Satisfaction',
          value: 4.3,
          target: 4.5,
          unit: '/5',
          trend: 'up' as const,
          change: 0.2
        }
      ];

      // Generate dynamic performance data based on user role and jurisdiction
      let mockPerformance: any[] = [];

      if (user?.role === 'SP' || user?.role === 'CP') {
        // For SP/CP: Show only SDPOs from their jurisdiction
        const targetDistrict = resolveUserJurisdictionToDistrict(user.jurisdiction || '', user.role as 'SP' | 'CP');
        const sdpoLocations = getSDPOsForDistrict(targetDistrict);
        const range = getRangeForDistrict(targetDistrict);

        console.log(`🎯 Performance Rankings for ${user.role} ${user.jurisdiction}:`);
        console.log(`   District: ${targetDistrict}`);
        console.log(`   Range: ${range}`);
        console.log(`   SDPO Count: ${sdpoLocations.length}`);

        // Officer names for variety
        const officerNames = [
          'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Kavitha Rao', 'Suresh Babu',
          'Lakshmi Devi', 'Ravi Teja', 'Sunitha Reddy', 'Venkat Rao', 'Madhavi Krishna'
        ];

        mockPerformance = sdpoLocations.map((location, index) => {
          const baseScore = Math.random() * 15 + 80; // Score between 80-95
          return {
            sdpoId: `${targetDistrict}-${index + 1}`,
            sdpoName: `${location.jurisdiction} SDPO`,
            officerName: officerNames[index % officerNames.length],
            district: targetDistrict,
            range: range,
            jurisdiction: location.jurisdiction,
            metrics: mockKPIs,
            rank: index + 1,
            score: Math.round(baseScore * 10) / 10,
            lastUpdated: new Date().toISOString()
          };
        }).sort((a, b) => b.score - a.score).map((item, index) => ({
          ...item,
          rank: index + 1
        }));

      } else if (user?.role === 'DGP') {
        // For DGP: Show top performing SDPOs from across the state
        mockPerformance = [
          {
            sdpoId: '1',
            sdpoName: 'Guntur West SDPO',
            officerName: 'Rajesh Kumar',
            district: 'Guntur',
            range: 'Guntur',
            jurisdiction: 'Guntur West',
            metrics: mockKPIs,
            rank: 1,
            score: 95.2,
            lastUpdated: new Date().toISOString()
          },
          {
            sdpoId: '2',
            sdpoName: 'Vijayawada Central SDPO',
            officerName: 'Priya Sharma',
            district: 'Krishna',
            range: 'Vijayawada',
            jurisdiction: 'Vijayawada Central',
            metrics: mockKPIs,
            rank: 2,
            score: 93.8,
            lastUpdated: new Date().toISOString()
          },
          {
            sdpoId: '3',
            sdpoName: 'Visakhapatnam North SDPO',
            officerName: 'Amit Singh',
            district: 'Visakhapatnam',
            range: 'Visakhapatnam',
            jurisdiction: 'Visakhapatnam North',
            metrics: mockKPIs,
            rank: 3,
            score: 92.1,
            lastUpdated: new Date().toISOString()
          }
        ];
      } else {
        // Default fallback
        mockPerformance = [
          {
            sdpoId: '1',
            sdpoName: 'Default SDPO',
            officerName: 'Officer Name',
            district: 'District',
            range: 'Range',
            jurisdiction: 'Jurisdiction',
            metrics: mockKPIs,
            rank: 1,
            score: 85.0,
            lastUpdated: new Date().toISOString()
          }
        ];
      }

      return { mockKPIs, mockPerformance };
    };

    const { mockKPIs, mockPerformance } = generatePerformanceData();
    dispatch(setKPIMetrics(mockKPIs));
    dispatch(setPerformanceData(mockPerformance));
  }, [dispatch, user?.role, user?.jurisdiction]);

  const handleSDPOSelect = (sdpo: any) => {
    setSelectedSDPO(sdpo);
    setIsSDPOModalOpen(true);
  };

  const getComparisonSubTabs = () => {
    if (user?.role === 'DGP') {
      return [
        { id: 'state-wide', label: 'State-wide Performance', icon: '🏛️' },
        { id: 'range-wise', label: 'Range-wise Comparison', icon: '📍' },
        { id: 'district-wise', label: 'District-wise Comparison', icon: '🏙️' }
      ];
    }
    return [];
  };

  const getTabs = () => {
    const baseTabs = [
      { id: 'overview', label: 'Overview', icon: '📊' },
      { id: 'activities', label: 'Recent Activities', icon: '📋' }
    ];

    if (user?.role === 'SP' || user?.role === 'DGP' || user?.role === 'DIG') {
      baseTabs.splice(1, 0, { id: 'comparison', label: 'SDPO Comparison', icon: '📈' });
    }

    // Add Crime Management tab for all roles
    baseTabs.splice(1, 0, { id: 'crime', label: 'Crime Management', icon: '🚔' });
    
    // Add Field Engagement tab for all roles
    baseTabs.splice(2, 0, { id: 'field', label: 'Field Operations', icon: '👮' });

    // Add File Upload tab for all roles
    baseTabs.splice(3, 0, { id: 'files', label: 'File Management', icon: '📁' });

    // Add Grievance Management tab for all roles
    baseTabs.splice(4, 0, { id: 'grievances', label: 'Grievance Management', icon: '📝' });

    // Add Phase 2 Advanced Features
    baseTabs.splice(5, 0, { id: 'analytics', label: 'Advanced Analytics', icon: '🧠' });
    baseTabs.splice(6, 0, { id: 'notifications', label: 'Notifications', icon: '🔔' });
    baseTabs.splice(7, 0, { id: 'profile', label: 'Profile Management', icon: '👤' });
    baseTabs.splice(8, 0, { id: 'reports', label: 'Reports & Export', icon: '📊' });
    
    // Add Security Controls for higher roles
    if (user?.role === 'DGP' || user?.role === 'DIG' || user?.role === 'SP' || user?.role === 'CP') {
      baseTabs.splice(9, 0, { id: 'security', label: 'Security Controls', icon: '🔒' });
    }

    // Add Communication tab for DGP
    if (user?.role === 'DGP') {
      baseTabs.splice(-1, 0, { id: 'communication', label: 'Communication', icon: '📞' });
    }

    return baseTabs;
  };

  const getRoleDashboardTitle = () => {
    switch (user?.role) {
      case 'DGP':
        return 'State Command Center';
      case 'DIG':
        return `${user.jurisdiction} Range Dashboard`;
      case 'SP':
        return `${user.jurisdiction} District Dashboard`;
      case 'CP':
        return `${user.jurisdiction} Commissionerate Dashboard`;
      case 'SDPO':
        return `${user.jurisdiction} Performance Dashboard`;
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header with Role-based Styling and Live Status */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              {/* Role-based Icon with Enhanced Styling */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg ${
                user?.role === 'DGP' ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700' :
                user?.role === 'DIG' ? 'bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700' :
                user?.role === 'SP' || user?.role === 'CP' ? 'bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700' :
                'bg-gradient-to-br from-orange-600 via-red-600 to-orange-700'
              }`}>
                {user?.role === 'DGP' ? '🏛️' : 
                 user?.role === 'DIG' ? '🏢' : 
                 user?.role === 'SP' || user?.role === 'CP' ? '🏛️' : '👮'}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {getRoleDashboardTitle()}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-gray-600 font-medium">
                    {user?.name} • <span className="text-blue-600 font-semibold">{user?.role}</span>
                    {user?.jurisdiction && <span className="text-gray-500"> • {user.jurisdiction}</span>}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Live Data
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="hidden lg:flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                <span>🕐 Last updated:</span>
                <span className="font-semibold text-gray-900">{new Date().toLocaleTimeString()}</span>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium">
                📊 Generate Report
              </button>
              <button className="bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-white hover:border-gray-400 transition-all duration-200 shadow-md font-medium">
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Navigation Tabs with Gradient Design */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-3">
            <nav className="flex flex-wrap gap-2">{getTabs().map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Enhanced KPI Cards with Glass Morphism Effect */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {kpiMetrics.map((kpi) => (
                <div key={kpi.id} className="transform hover:scale-105 transition-all duration-300">
                  <KPICard kpi={kpi} />
                </div>
              ))}
            </div>

            {/* Enhanced Main Content Grid with Better Spacing */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">{/* Performance Chart with Enhanced Container */}
              <div className="xl:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  📈 <span className="ml-2">Performance Analytics</span>
                </h3>
                <PerformanceChart data={performanceData} />
              </div>

              {/* Recent Activities with Enhanced Design */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  🔔 <span className="ml-2">Recent Activities</span>
                </h3>
                <RecentActivities />
              </div>
            </div>

            {/* Enhanced Map and Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interactive Map Placeholder with Enhanced Design */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg border border-blue-200 p-8 h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse">🗺️</div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Interactive Map View</h3>
                  <p className="text-blue-700 font-medium mb-2">Geographic SDPO Distribution</p>
                  <p className="text-sm text-blue-600">Real-time location mapping • Coming Soon</p>
                  <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold">
                    🚀 Under Development
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Performance Rankings 
                  {user?.role === 'SP' || user?.role === 'CP' ? (
                    <span className="text-sm text-gray-600 ml-2">
                      ({user.jurisdiction} District)
                    </span>
                  ) : user?.role === 'DGP' ? (
                    <span className="text-sm text-gray-600 ml-2">
                      (State-wide Top Performers)
                    </span>
                  ) : null}
                </h3>
                <div className="space-y-3">
                  {(performanceData || []).slice(0, 5).map((sdpo: any, index: number) => (
                    <div key={sdpo.sdpoId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                          index === 0 ? 'bg-ap-gold-400 text-white' : 
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{sdpo.sdpoName}</p>
                          <p className="text-sm text-gray-600">
                            {sdpo.officerName && `${sdpo.officerName} • `}
                            {sdpo.jurisdiction || sdpo.district}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-ap-blue-600">{sdpo.score}%</p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  ))}
                  {(!performanceData || performanceData.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <p>No performance data available</p>
                      <p className="text-sm">Please check your jurisdiction settings</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            {/* DGP Sub-tabs */}
            {user?.role === 'DGP' && (
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {getComparisonSubTabs().map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => setComparisonSubTab(subTab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        comparisonSubTab === subTab.id
                          ? 'border-ap-blue-500 text-ap-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{subTab.icon}</span>
                      <span>{subTab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            )}
            
            {/* Comparison Content */}
            <SDPOComparisonTab 
              userRole={user?.role} 
              userJurisdiction={user?.jurisdiction} 
              comparisonType={user?.role === 'DGP' ? comparisonSubTab : 'default'}
              onSDPOSelect={handleSDPOSelect} 
            />
          </div>
        )}

        {activeTab === 'communication' && user?.role === 'DGP' && (
          <CommunicationTab 
            userRole={user?.role} 
            userId={user?.id || 'dgp-001'} 
          />
        )}

        {activeTab === 'crime' && (
          <CrimeSituationTab 
            userRole={user?.role || 'SDPO'} 
            jurisdiction={user?.jurisdiction || 'AP State'} 
          />
        )}

        {activeTab === 'field' && (
          <FieldEngagementTab 
            userRole={user?.role || 'SDPO'} 
            jurisdiction={user?.jurisdiction || 'AP State'} 
          />
        )}

        {activeTab === 'files' && (
          <FileUploadComponent 
            userRole={user?.role || 'SDPO'} 
            jurisdiction={user?.jurisdiction || 'AP State'} 
          />
        )}

        {activeTab === 'grievances' && (
          <GrievanceTab />
        )}

        {activeTab === 'analytics' && (
          <AdvancedAnalyticsTab 
            userRole={user?.role || 'SDPO'} 
            jurisdiction={user?.jurisdiction || 'AP State'} 
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationSystem 
            userRole={user?.role || 'SDPO'} 
            userId={user?.id || 'user-001'} 
            jurisdiction={user?.jurisdiction || 'AP State'} 
          />
        )}

        {activeTab === 'profile' && (
          <ProfileManagement 
            userRole={user?.role || 'SDPO'} 
            userId={user?.id || 'user-001'} 
          />
        )}

        {activeTab === 'security' && (
          <SecurityControls 
            userRole={user?.role || 'SDPO'} 
            permissions={[]} 
          />
        )}

        {activeTab === 'reports' && (
          <DataExportReports 
            userRole={user?.role || 'SDPO'} 
            permissions={[]} 
          />
        )}

        {activeTab === 'activities' && (
          <RecentActivities />
        )}
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
    </div>
  );
};

export default DashboardPage;
