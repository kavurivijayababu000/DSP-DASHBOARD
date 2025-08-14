import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Target, 
  Award, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Brain,
  Eye,
  Filter,
  Download,
  RefreshCw,
  MapPin,
  PieChart,
  LineChart,
  BarChart2,
  Layers,
  Database,
  Cpu,
  Globe,
  Settings,
  Info
} from 'lucide-react';

// Analytics interfaces
interface PerformanceMetrics {
  caseResolutionRate: number;
  avgResponseTime: number;
  citizenSatisfaction: number;
  officerEfficiency: number;
  crimeReductionRate: number;
  grievanceResolutionRate: number;
}

interface TrendData {
  period: string;
  crimeReports: number;
  casesResolved: number;
  grievancesSubmitted: number;
  grievancesResolved: number;
  responseTime: number;
  satisfaction: number;
}

interface PredictiveInsights {
  crimeHotspots: Array<{
    location: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    predictedIncidents: number;
    confidence: number;
    recommendations: string[];
  }>;
  resourceAllocation: Array<{
    area: string;
    currentStaff: number;
    recommendedStaff: number;
    efficiency: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  performancePredictions: Array<{
    officer: string;
    currentScore: number;
    predictedScore: number;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    recommendations: string[];
  }>;
}

interface GeographicData {
  district: string;
  coordinates: { lat: number; lng: number };
  crimeRate: number;
  resolutionRate: number;
  responseTime: number;
  officerCount: number;
  population: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface ComparisonData {
  period: string;
  thisYear: number;
  lastYear: number;
  change: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

interface AdvancedAnalyticsProps {
  userRole: string;
  jurisdiction: string;
}

const AdvancedAnalyticsTab: React.FC<AdvancedAnalyticsProps> = ({ userRole, jurisdiction }) => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsights | null>(null);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'predictions' | 'geographic' | 'comparisons'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Generate advanced analytics data
  useEffect(() => {
    generateAnalyticsData();
  }, [userRole, jurisdiction, timeRange]);

  const generateAnalyticsData = () => {
    // Performance Metrics
    const metrics: PerformanceMetrics = {
      caseResolutionRate: 87.5 + Math.random() * 10,
      avgResponseTime: 8.2 + Math.random() * 4,
      citizenSatisfaction: 4.2 + Math.random() * 0.6,
      officerEfficiency: 82.3 + Math.random() * 15,
      crimeReductionRate: 15.8 + Math.random() * 10,
      grievanceResolutionRate: 91.2 + Math.random() * 8
    };
    setPerformanceMetrics(metrics);

    // Trend Data (last 12 periods)
    const trends: TrendData[] = [];
    const periods = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 12 : 12;
    const periodLabel = timeRange === '7d' ? 'Day' : timeRange === '30d' ? 'Day' : 'Month';
    
    for (let i = periods; i > 0; i--) {
      const baseValue = userRole === 'DGP' ? 1000 : userRole === 'DIG' ? 300 : 100;
      trends.push({
        period: `${periodLabel} ${periods - i + 1}`,
        crimeReports: Math.floor(baseValue * (0.8 + Math.random() * 0.4)),
        casesResolved: Math.floor(baseValue * 0.7 * (0.8 + Math.random() * 0.4)),
        grievancesSubmitted: Math.floor(baseValue * 0.3 * (0.8 + Math.random() * 0.4)),
        grievancesResolved: Math.floor(baseValue * 0.25 * (0.8 + Math.random() * 0.4)),
        responseTime: 8 + Math.random() * 4,
        satisfaction: 4.0 + Math.random() * 1
      });
    }
    setTrendData(trends);

    // Predictive Insights
    const insights: PredictiveInsights = {
      crimeHotspots: [
        {
          location: `${jurisdiction} Central Market`,
          riskLevel: 'HIGH',
          predictedIncidents: Math.floor(15 + Math.random() * 10),
          confidence: 87.5,
          recommendations: [
            'Increase patrol frequency during evening hours',
            'Deploy additional CCTV cameras at entry points',
            'Coordinate with local merchant association'
          ]
        },
        {
          location: `${jurisdiction} Bus Station Area`,
          riskLevel: 'MEDIUM',
          predictedIncidents: Math.floor(8 + Math.random() * 7),
          confidence: 72.3,
          recommendations: [
            'Enhanced lighting in parking areas',
            'Regular security checks',
            'Community awareness programs'
          ]
        },
        {
          location: `${jurisdiction} Industrial Zone`,
          riskLevel: 'CRITICAL',
          predictedIncidents: Math.floor(20 + Math.random() * 15),
          confidence: 94.2,
          recommendations: [
            'Immediate deployment of additional officers',
            'Establish temporary police post',
            'Coordinate with industrial security teams'
          ]
        }
      ],
      resourceAllocation: [
        {
          area: `${jurisdiction} North Division`,
          currentStaff: 45,
          recommendedStaff: 52,
          efficiency: 78.5,
          priority: 'HIGH'
        },
        {
          area: `${jurisdiction} South Division`,
          currentStaff: 38,
          recommendedStaff: 42,
          efficiency: 85.2,
          priority: 'MEDIUM'
        },
        {
          area: `${jurisdiction} East Division`,
          currentStaff: 41,
          recommendedStaff: 48,
          efficiency: 73.1,
          priority: 'HIGH'
        }
      ],
      performancePredictions: [
        {
          officer: `SDPO-${jurisdiction}-1`,
          currentScore: 88.5,
          predictedScore: 91.2,
          trend: 'IMPROVING',
          recommendations: [
            'Continue current practices',
            'Consider for leadership training',
            'Potential for promotion consideration'
          ]
        },
        {
          officer: `SDPO-${jurisdiction}-2`,
          currentScore: 76.8,
          predictedScore: 73.5,
          trend: 'DECLINING',
          recommendations: [
            'Provide additional training support',
            'Assign mentor for guidance',
            'Review workload distribution'
          ]
        }
      ]
    };
    setPredictiveInsights(insights);

    // Geographic Data
    const districts = ['Anantapur', 'Chittoor', 'Guntur', 'Krishna', 'Kurnool', 'Visakhapatnam', 'Vijayawada'];
    const geoData: GeographicData[] = districts.map((district, index) => ({
      district,
      coordinates: { 
        lat: 14.0 + Math.random() * 4, 
        lng: 78.0 + Math.random() * 4 
      },
      crimeRate: 15 + Math.random() * 20,
      resolutionRate: 75 + Math.random() * 20,
      responseTime: 6 + Math.random() * 8,
      officerCount: 150 + Math.floor(Math.random() * 100),
      population: 1000000 + Math.floor(Math.random() * 2000000),
      riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as any
    }));
    setGeographicData(geoData);

    // Comparison Data
    const comparisonPeriods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const comparisons: ComparisonData[] = comparisonPeriods.map(period => {
      const thisYear = 100 + Math.random() * 200;
      const lastYear = 100 + Math.random() * 200;
      const change = ((thisYear - lastYear) / lastYear) * 100;
      return {
        period,
        thisYear,
        lastYear,
        change,
        trend: change > 5 ? 'UP' : change < -5 ? 'DOWN' : 'STABLE'
      };
    });
    setComparisonData(comparisons);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    generateAnalyticsData();
    setRefreshing(false);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UP': case 'IMPROVING': return 'text-green-600';
      case 'DOWN': case 'DECLINING': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatNumber = (num: number, decimals = 1) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  // Overview Tab Content
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      {performanceMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-6 w-6 text-blue-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-white/80 text-sm">Case Resolution</p>
            <p className="text-2xl font-bold text-white">{performanceMetrics.caseResolutionRate.toFixed(1)}%</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-6 w-6 text-green-400" />
              <TrendingDown className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-white/80 text-sm">Response Time</p>
            <p className="text-2xl font-bold text-white">{performanceMetrics.avgResponseTime.toFixed(1)}m</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-6 w-6 text-yellow-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-white/80 text-sm">Satisfaction</p>
            <p className="text-2xl font-bold text-white">{performanceMetrics.citizenSatisfaction.toFixed(1)}/5</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-6 w-6 text-purple-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-white/80 text-sm">Officer Efficiency</p>
            <p className="text-2xl font-bold text-white">{performanceMetrics.officerEfficiency.toFixed(1)}%</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-6 w-6 text-red-400" />
              <TrendingDown className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-white/80 text-sm">Crime Reduction</p>
            <p className="text-2xl font-bold text-white">{performanceMetrics.crimeReductionRate.toFixed(1)}%</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-white/80 text-sm">Grievance Resolution</p>
            <p className="text-2xl font-bold text-white">{performanceMetrics.grievanceResolutionRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* AI-Powered Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI-Powered Crime Predictions
          </h3>
          
          {predictiveInsights && (
            <div className="space-y-4">
              {predictiveInsights.crimeHotspots.slice(0, 3).map((hotspot, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{hotspot.location}</h4>
                      <p className="text-white/70 text-sm">Predicted: {hotspot.predictedIncidents} incidents</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(hotspot.riskLevel)}`}>
                        {hotspot.riskLevel}
                      </span>
                      <span className="text-white/70 text-sm">{hotspot.confidence}%</span>
                    </div>
                  </div>
                  <div className="text-white/60 text-sm">
                    <strong>Recommendations:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {hotspot.recommendations.slice(0, 2).map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Resource Optimization
          </h3>
          
          {predictiveInsights && (
            <div className="space-y-4">
              {predictiveInsights.resourceAllocation.map((allocation, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{allocation.area}</h4>
                      <p className="text-white/70 text-sm">
                        Current: {allocation.currentStaff} → Recommended: {allocation.recommendedStaff}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(allocation.priority)}`}>
                      {allocation.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">Efficiency:</span>
                    <div className="flex-1 bg-white/20 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-400 rounded-full" 
                        style={{ width: `${allocation.efficiency}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium">{allocation.efficiency.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Trends Chart Placeholder */}
      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <LineChart className="h-5 w-5 text-green-400" />
          Performance Trends ({timeRange})
        </h3>
        
        <div className="h-64 flex items-center justify-center bg-white/10 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/80 font-medium">Interactive Chart Coming Soon</p>
            <p className="text-white/60 text-sm">Real-time trend analysis with D3.js integration</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Advanced Analytics</h1>
              <p className="text-white/80">AI-powered insights and predictive analysis for {jurisdiction}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 3 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-purple-600/80 text-white rounded-lg hover:bg-purple-700/80 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button className="px-4 py-2 bg-green-600/80 text-white rounded-lg hover:bg-green-700/80 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            {[
              { id: 'overview', label: 'AI Overview', icon: Brain },
              { id: 'trends', label: 'Trend Analysis', icon: TrendingUp },
              { id: 'predictions', label: 'Predictions', icon: Zap },
              { id: 'geographic', label: 'Geographic Intel', icon: MapPin },
              { id: 'comparisons', label: 'Comparisons', icon: BarChart2 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white shadow-sm' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        
        {/* Placeholder for other tabs */}
        {activeTab !== 'overview' && (
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-2xl font-bold text-white mb-2">Advanced {activeTab} Analytics</h3>
            <p className="text-white/80 mb-4">This section is under development</p>
            <div className="flex items-center justify-center gap-4 text-white/60">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Big Data Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span>ML Algorithms</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Real-time Integration</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsTab;
