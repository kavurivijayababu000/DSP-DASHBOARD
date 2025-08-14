import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Battery, 
  Signal, 
  Bell,
  BellOff,
  Settings,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Home,
  BarChart3,
  Shield,
  Users,
  MessageSquare,
  FileText,
  MapPin,
  Activity,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Download,
  Share2,
  Filter,
  SortAsc,
  Grid,
  List,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCw,
  Zap,
  Plus
} from 'lucide-react';

// Mobile Dashboard Interfaces
interface MobileDashboardProps {
  userRole: string;
  jurisdiction: string;
  userId: string;
  onNavigate?: (section: string) => void;
}

interface MobileKPICard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

interface MobileNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  category: string;
  read: boolean;
  actionRequired?: boolean;
}

interface DeviceOrientation {
  isPortrait: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ userRole, jurisdiction, userId, onNavigate }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [signalStrength, setSignalStrength] = useState(4);
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    isPortrait: window.innerHeight > window.innerWidth,
    isLandscape: window.innerWidth > window.innerHeight,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  });
  const [compactView, setCompactView] = useState(false);
  const [offlineSync, setOfflineSync] = useState<string[]>([]);
  const [kpiCards, setKpiCards] = useState<MobileKPICard[]>([]);
  const [notifications, setNotifications] = useState<MobileNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Device and connection monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    const handleOrientationChange = () => {
      setOrientation({
        isPortrait: window.innerHeight > window.innerWidth,
        isLandscape: window.innerWidth > window.innerHeight,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      });
    };

    // Battery API (if supported)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    // Connection monitoring
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Initialize mobile data
  useEffect(() => {
    loadMobileData();
  }, [userRole, jurisdiction]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMobileData = async () => {
    setRefreshing(true);
    
    // Simulate API calls with mobile-optimized data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate role-based KPI cards
    const mockKPIs: MobileKPICard[] = generateMobileKPIs();
    const mockNotifications: MobileNotification[] = generateMobileNotifications();
    
    setKpiCards(mockKPIs);
    setNotifications(mockNotifications);
    setRefreshing(false);
  };

  const generateMobileKPIs = (): MobileKPICard[] => {
    const baseKPIs = [
      {
        id: 'cases',
        title: 'Active Cases',
        value: 127,
        change: 5,
        trend: 'up' as const,
        icon: '⚖️',
        color: 'bg-blue-500',
        priority: 'high' as const
      },
      {
        id: 'response',
        title: 'Avg Response',
        value: '4.2m',
        change: -8,
        trend: 'down' as const,
        icon: '⚡',
        color: 'bg-green-500',
        priority: 'high' as const
      },
      {
        id: 'performance',
        title: 'Performance',
        value: '89.5%',
        change: 2.3,
        trend: 'up' as const,
        icon: '📊',
        color: 'bg-purple-500',
        priority: 'medium' as const
      },
      {
        id: 'alerts',
        title: 'Active Alerts',
        value: 8,
        change: -2,
        trend: 'down' as const,
        icon: '🚨',
        color: 'bg-red-500',
        priority: 'high' as const
      }
    ];

    // Customize based on role
    if (userRole === 'DGP') {
      baseKPIs.push({
        id: 'districts',
        title: 'Districts',
        value: '26',
        change: 0,
        trend: 'up',
        icon: '🏛️',
        color: 'bg-indigo-500',
        priority: 'medium'
      });
    }

    return baseKPIs;
  };

  const generateMobileNotifications = (): MobileNotification[] => {
    return [
      {
        id: 'notif1',
        title: 'High Priority Case',
        message: `New urgent case assigned in ${jurisdiction}. Immediate attention required.`,
        type: 'alert',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        priority: 'high',
        category: 'Crime Alert',
        read: false,
        actionRequired: true
      },
      {
        id: 'notif2',
        title: 'Performance Update',
        message: 'Your monthly performance report is ready for review.',
        type: 'info',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        priority: 'medium',
        category: 'Performance',
        read: false
      },
      {
        id: 'notif3',
        title: 'System Maintenance',
        message: 'Scheduled maintenance completed successfully. All systems operational.',
        type: 'success',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        priority: 'low',
        category: 'System',
        read: true
      }
    ];
  };

  const handleRefresh = async () => {
    if (!isOnline && offlineSync.length > 0) {
      // Handle offline sync
      setOfflineSync([]);
      return;
    }
    await loadMobileData();
  };

  const getNotificationIcon = (type: MobileNotification['type']) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: MobileNotification['type']) => {
    switch (type) {
      case 'alert': return 'bg-red-100 border-red-300 text-red-800';
      case 'success': return 'bg-green-100 border-green-300 text-green-800';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const diff = Date.now() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'cases', label: 'Cases', icon: Shield },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Mobile Header Component
  const MobileHeader = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      {/* Status Bar */}
      <div className="bg-gray-900 text-white px-4 py-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="flex items-center space-x-1">
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className={`w-1 h-3 rounded-sm ${i < signalStrength ? 'bg-white' : 'bg-gray-600'}`}
                />
              ))}
            </div>
            <div className="flex items-center space-x-1">
              <Battery className="h-3 w-3" />
              <span>{batteryLevel}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 -m-2 text-gray-600 hover:text-gray-900"
            >
              {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {userRole} Dashboard
              </h1>
              <p className="text-sm text-gray-500">{jurisdiction}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-gray-900 relative"
            >
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setCompactView(!compactView)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {compactView ? <Maximize className="h-5 w-5" /> : <Minimize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-center space-x-2 text-yellow-800">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">Working offline</span>
            {offlineSync.length > 0 && (
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                {offlineSync.length} changes pending sync
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Mobile Menu Component
  const MobileMenu = () => (
    <div 
      ref={menuRef}
      className={`fixed inset-0 z-50 transform transition-transform duration-300 ${
        showMenu ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex">
        <div className="bg-white w-72 h-full shadow-xl">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">{userRole}</h3>
                <p className="text-sm opacity-90">{jurisdiction}</p>
              </div>
            </div>
          </div>

          <nav className="mt-4">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setShowMenu(false);
                  onNavigate?.(item.id);
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeSection === item.id ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600' : 'text-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Connection Status */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className={`p-3 rounded-lg text-sm ${
              isOnline 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span className="font-medium">
                  {isOnline ? 'Connected' : 'Offline Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div 
          className="bg-black bg-opacity-50 flex-1"
          onClick={() => setShowMenu(false)}
        />
      </div>
    </div>
  );

  // Mobile Notifications Panel
  const MobileNotifications = () => (
    <div 
      ref={notificationRef}
      className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 w-80 transform transition-transform duration-300 ${
        showNotifications ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <button
            onClick={() => setShowNotifications(false)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto h-full pb-20">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'font-medium' : 'opacity-75'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {notification.priority === 'high' && (
                        <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                          High
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-75">{formatTimeAgo(notification.timestamp)}</span>
                      {notification.actionRequired && (
                        <button className="text-xs bg-white/50 px-2 py-1 rounded hover:bg-white/70">
                          Action Required
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Mobile KPI Grid
  const MobileKPIGrid = () => (
    <div className={`grid ${
      orientation.isPortrait 
        ? compactView ? 'grid-cols-2' : 'grid-cols-1' 
        : compactView ? 'grid-cols-4' : 'grid-cols-2'
    } gap-4`}>
      {kpiCards.map(kpi => (
        <div
          key={kpi.id}
          className={`${kpi.color} rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-all duration-200`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl">{kpi.icon}</div>
            <div className={`flex items-center space-x-1 text-xs ${
              kpi.trend === 'up' ? 'text-green-200' : kpi.trend === 'down' ? 'text-red-200' : 'text-gray-200'
            }`}>
              {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
               kpi.trend === 'down' ? <TrendingUp className="h-3 w-3 rotate-180" /> : 
               <Activity className="h-3 w-3" />}
              <span>{Math.abs(kpi.change)}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-sm opacity-90">{kpi.title}</h3>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </div>
          {kpi.priority === 'high' && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Priority</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Quick Actions
  const QuickActions = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'New Case', icon: Plus, color: 'bg-blue-500' },
          { label: 'View Reports', icon: FileText, color: 'bg-green-500' },
          { label: 'Team Status', icon: Users, color: 'bg-purple-500' },
          { label: 'Emergency', icon: AlertTriangle, color: 'bg-red-500' }
        ].map((action, index) => (
          <button
            key={index}
            className={`${action.color} text-white p-3 rounded-lg flex flex-col items-center space-y-2 hover:opacity-90 transition-opacity`}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      <MobileMenu />
      <MobileNotifications />

      {/* Main Content */}
      <div className="p-4 space-y-4 pb-20">
        {/* KPI Cards */}
        <MobileKPIGrid />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity (Compact) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-blue-600 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Case #A-2024-001 updated', time: '2m ago', type: 'case' },
              { title: 'Team member checked in', time: '15m ago', type: 'team' },
              { title: 'Report submitted', time: '1h ago', type: 'report' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'case' ? 'bg-blue-500' : 
                  item.type === 'team' ? 'bg-green-500' : 'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
