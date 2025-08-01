import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setKPIMetrics, setPerformanceData } from '../store/slices/dashboardSlice';
import KPICard from '../components/Dashboard/KPICard';
import PerformanceChart from '../components/Dashboard/PerformanceChart';
import MapView from '../components/Dashboard/MapView';
import RecentActivities from '../components/Dashboard/RecentActivities';
import SDPOComparisonTab from '../components/Dashboard/SDPOComparisonTab';
import SDPODetailModal from '../components/Dashboard/SDPODetailModal';
import CommunicationTab from '../components/Dashboard/CommunicationTab';
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
          value: 106,
          target: 106,
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

    // Add Communication tab for DGP
    if (user?.role === 'DGP') {
      baseTabs.splice(2, 0, { id: 'communication', label: 'Communication', icon: '📞' });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {getRoleDashboardTitle()}
          </h1>
          <p className="text-gray-600">
            Real-time monitoring and performance analytics
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="bg-ap-blue-600 text-white px-4 py-2 rounded-lg hover:bg-ap-blue-700">
            📊 Generate Report
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {getTabs().map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-ap-blue-500 text-ap-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiMetrics.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Chart */}
              <div className="lg:col-span-2">
                <PerformanceChart data={performanceData} />
              </div>

              {/* Recent Activities */}
              <div>
                <RecentActivities />
              </div>
            </div>

            {/* Map and Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MapView />
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
  );
};

export default DashboardPage;
