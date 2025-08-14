import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Lock, 
  Key, 
  Users, 
  UserCheck, 
  UserX, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Smartphone,
  Globe,
  Database,
  Activity,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Calendar,
  BarChart3,
  Wifi,
  WifiOff,
  Monitor,
  Fingerprint,
  QrCode,
  Mail,
  Phone,
  Bell,
  BellOff,
  Timer,
  Zap,
  Server,
  HardDrive,
  Cpu,

} from 'lucide-react';

// Security interfaces
interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  level: 'READ' | 'WRITE' | 'DELETE' | 'ADMIN';
  category: 'DASHBOARD' | 'CRIME' | 'FIELD' | 'GRIEVANCE' | 'ANALYTICS' | 'SYSTEM' | 'REPORTS';
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number; // 1-10 hierarchy level
  permissions: Permission[];
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  color: string;
}

interface SecurityEvent {
  id: string;
  type: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'PERMISSION_DENIED' | 'PASSWORD_CHANGE' | 'ROLE_CHANGE' | 'SESSION_TIMEOUT' | 'SUSPICIOUS_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId: string;
  userName: string;
  userRole: string;
  timestamp: Date;
  ipAddress: string;
  location: string;
  device: string;
  details: string;
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
  assignedTo?: string;
}

interface AccessAttempt {
  id: string;
  userId: string;
  userName: string;
  resource: string;
  action: string;
  timestamp: Date;
  success: boolean;
  ipAddress: string;
  device: string;
  reason?: string;
}

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // days
    preventReuse: number; // last N passwords
  };
  sessionSettings: {
    timeout: number; // minutes
    maxConcurrentSessions: number;
    requireReauth: boolean;
    rememberDevice: boolean;
  };
  twoFactorAuth: {
    enabled: boolean;
    methods: ('SMS' | 'EMAIL' | 'TOTP' | 'HARDWARE')[];
    required: boolean;
    backupCodes: boolean;
  };
  accessControl: {
    ipWhitelist: string[];
    geofencing: boolean;
    deviceRestriction: boolean;
    timeBasedAccess: boolean;
  };
  monitoring: {
    logLevel: 'BASIC' | 'DETAILED' | 'VERBOSE';
    alertThresholds: {
      failedLogins: number;
      suspiciousActivity: number;
      unauthorizedAccess: number;
    };
    retentionPeriod: number; // days
  };
}

interface SecurityControlsProps {
  userRole: string;
  permissions: string[];
}

const SecurityControls: React.FC<SecurityControlsProps> = ({ userRole, permissions }) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'events' | 'access' | 'settings' | 'monitoring'>('roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [accessAttempts, setAccessAttempts] = useState<AccessAttempt[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(false);

  // Initialize data
  useEffect(() => {
    loadSecurityData();
  }, []);

  // Real-time monitoring
  useEffect(() => {
    if (!realTimeMonitoring) return;

    const interval = setInterval(() => {
      simulateNewSecurityEvent();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeMonitoring]);

  const loadSecurityData = async () => {
    setLoading(true);
    
    // Simulate API calls
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock roles data
    const mockRoles: Role[] = [
      {
        id: 'role1',
        name: 'Super Admin',
        description: 'Full system access with all administrative privileges',
        level: 10,
        permissions: [], // All permissions
        userCount: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        isActive: true,
        color: '#DC2626'
      },
      {
        id: 'role2',
        name: 'SDPO',
        description: 'Sub-Divisional Police Officer with district-level access',
        level: 8,
        permissions: [], // Most permissions except system admin
        userCount: 15,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-02-10'),
        isActive: true,
        color: '#2563EB'
      },
      {
        id: 'role3',
        name: 'Inspector',
        description: 'Circle Inspector with limited administrative access',
        level: 6,
        permissions: [], // Basic permissions
        userCount: 45,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-02-15'),
        isActive: true,
        color: '#059669'
      },
      {
        id: 'role4',
        name: 'Sub Inspector',
        description: 'Station-level officer with operational access',
        level: 4,
        permissions: [], // Limited permissions
        userCount: 120,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-02-20'),
        isActive: true,
        color: '#7C3AED'
      }
    ];

    // Mock security events
    const mockEvents: SecurityEvent[] = [
      {
        id: 'event1',
        type: 'FAILED_LOGIN',
        severity: 'HIGH',
        userId: 'user123',
        userName: 'John Doe',
        userRole: 'Inspector',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ipAddress: '192.168.1.100',
        location: 'Anantapur, AP',
        device: 'Chrome on Windows',
        details: 'Multiple failed login attempts from new location',
        status: 'ACTIVE'
      },
      {
        id: 'event2',
        type: 'PERMISSION_DENIED',
        severity: 'MEDIUM',
        userId: 'user456',
        userName: 'Jane Smith',
        userRole: 'Sub Inspector',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        ipAddress: '10.0.0.50',
        location: 'Kurnool, AP',
        device: 'Mobile App',
        details: 'Attempted to access admin-only analytics section',
        status: 'RESOLVED'
      },
      {
        id: 'event3',
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'CRITICAL',
        userId: 'user789',
        userName: 'Robert Wilson',
        userRole: 'SDPO',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        ipAddress: '203.122.45.67',
        location: 'Unknown',
        device: 'Unknown Browser',
        details: 'Login from unrecognized device and location',
        status: 'INVESTIGATING',
        assignedTo: 'Security Team'
      }
    ];

    // Mock access attempts
    const mockAccess: AccessAttempt[] = [
      {
        id: 'access1',
        userId: 'user123',
        userName: 'John Doe',
        resource: '/admin/users',
        action: 'READ',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        success: false,
        ipAddress: '192.168.1.100',
        device: 'Chrome',
        reason: 'Insufficient permissions'
      },
      {
        id: 'access2',
        userId: 'user456',
        userName: 'Jane Smith',
        resource: '/dashboard/analytics',
        action: 'READ',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        success: true,
        ipAddress: '10.0.0.50',
        device: 'Mobile App'
      }
    ];

    // Mock security settings
    const mockSettings: SecuritySettings = {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 5
      },
      sessionSettings: {
        timeout: 30,
        maxConcurrentSessions: 3,
        requireReauth: true,
        rememberDevice: false
      },
      twoFactorAuth: {
        enabled: true,
        methods: ['SMS', 'EMAIL', 'TOTP'],
        required: false,
        backupCodes: true
      },
      accessControl: {
        ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        geofencing: true,
        deviceRestriction: false,
        timeBasedAccess: true
      },
      monitoring: {
        logLevel: 'DETAILED',
        alertThresholds: {
          failedLogins: 5,
          suspiciousActivity: 3,
          unauthorizedAccess: 2
        },
        retentionPeriod: 90
      }
    };

    setRoles(mockRoles);
    setSecurityEvents(mockEvents);
    setAccessAttempts(mockAccess);
    setSecuritySettings(mockSettings);
    setLoading(false);
  };

  const simulateNewSecurityEvent = () => {
    const eventTypes: SecurityEvent['type'][] = ['LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PERMISSION_DENIED'];
    const severities: SecurityEvent['severity'][] = ['LOW', 'MEDIUM', 'HIGH'];
    
    const newEvent: SecurityEvent = {
      id: `event_${Date.now()}`,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      userName: 'Live User',
      userRole: 'Inspector',
      timestamp: new Date(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      location: 'Real-time Location',
      device: 'Live Device',
      details: 'Real-time security event simulation',
      status: 'ACTIVE'
    };

    setSecurityEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Keep latest 20
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: SecurityEvent['status']) => {
    switch (status) {
      case 'ACTIVE': return 'text-red-600 bg-red-100';
      case 'RESOLVED': return 'text-green-600 bg-green-100';
      case 'INVESTIGATING': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'LOGIN': return <UserCheck className="h-4 w-4" />;
      case 'LOGOUT': return <UserX className="h-4 w-4" />;
      case 'FAILED_LOGIN': return <XCircle className="h-4 w-4" />;
      case 'PERMISSION_DENIED': return <Shield className="h-4 w-4" />;
      case 'PASSWORD_CHANGE': return <Key className="h-4 w-4" />;
      case 'ROLE_CHANGE': return <Users className="h-4 w-4" />;
      case 'SESSION_TIMEOUT': return <Clock className="h-4 w-4" />;
      case 'SUSPICIOUS_ACTIVITY': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || event.type === filterType;
    const matchesSeverity = filterSeverity === 'ALL' || event.severity === filterSeverity;
    const matchesDate = event.timestamp >= new Date(dateRange.start) && 
                       event.timestamp <= new Date(dateRange.end + 'T23:59:59');
    
    return matchesSearch && matchesType && matchesSeverity && matchesDate;
  });

  // Roles Tab Content
  const renderRolesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Role Management</h3>
          <p className="text-white/70">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => setShowRoleModal(true)}
          className="px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                <div>
                  <h4 className="font-semibold text-white">{role.name}</h4>
                  <p className="text-white/70 text-sm">Level {role.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRole(role);
                    setShowRoleModal(true);
                  }}
                  className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button className="p-1 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-white/80 text-sm mb-4 line-clamp-2">{role.description}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Users</span>
                <span className="text-white font-medium">{role.userCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  role.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                }`}>
                  {role.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Updated</span>
                <span className="text-white/80 text-sm">
                  {role.updatedAt.toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Security Events Tab Content
  const renderEventsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Security Events</h3>
          <p className="text-white/70">Monitor and investigate security incidents</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRealTimeMonitoring(!realTimeMonitoring)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              realTimeMonitoring 
                ? 'bg-green-600/80 text-white hover:bg-green-700/80' 
                : 'bg-gray-600/80 text-white hover:bg-gray-700/80'
            }`}
          >
            <Activity className={`h-4 w-4 ${realTimeMonitoring ? 'animate-pulse' : ''}`} />
            {realTimeMonitoring ? 'Live Monitoring' : 'Start Monitoring'}
          </button>
          <button className="px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="ALL">All Types</option>
            <option value="LOGIN">Login</option>
            <option value="FAILED_LOGIN">Failed Login</option>
            <option value="PERMISSION_DENIED">Permission Denied</option>
            <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
          </select>
          
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="ALL">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                  {getEventIcon(event.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-white">{event.type.replace('_', ' ')}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="text-white/80 mb-2">{event.details}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.userName} ({event.userRole})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {event.ipAddress}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.timestamp.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-blue-600/80 text-white rounded hover:bg-blue-700/80 transition-colors text-sm">
                  Investigate
                </button>
                {event.status === 'ACTIVE' && (
                  <button className="px-3 py-1 bg-green-600/80 text-white rounded hover:bg-green-700/80 transition-colors text-sm">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-white/60">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No security events found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-8 text-center">
          <RefreshCw className="h-12 w-12 text-white/60 mx-auto mb-4 animate-spin" />
          <p className="text-white/80 text-lg">Loading Security Controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-600/80 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Security Controls</h1>
              <p className="text-white/70">Advanced security monitoring and access management</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Active Sessions</p>
                  <p className="text-2xl font-bold text-white">147</p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Security Events</p>
                  <p className="text-2xl font-bold text-white">{securityEvents.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Failed Attempts</p>
                  <p className="text-2xl font-bold text-white">23</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Active Roles</p>
                  <p className="text-2xl font-bold text-white">{roles.filter(r => r.isActive).length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            {[
              { id: 'roles', label: 'Roles & Permissions', icon: Users },
              { id: 'events', label: 'Security Events', icon: AlertTriangle },
              { id: 'access', label: 'Access Control', icon: Lock },
              { id: 'settings', label: 'Security Settings', icon: Settings },
              { id: 'monitoring', label: 'System Monitoring', icon: Activity }
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
        <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6">
          {activeTab === 'roles' && renderRolesTab()}
          {activeTab === 'events' && renderEventsTab()}
          
          {/* Placeholder for other tabs */}
          {!['roles', 'events'].includes(activeTab) && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')} Section
              </h3>
              <p className="text-white/80">Advanced security features under development</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityControls;
