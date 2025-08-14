import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock, 
  User, 
  MapPin, 
  Calendar,
  Filter,
  Search,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageCircle,
  Eye,
  EyeOff,
  Trash2,
  Archive,
  Star,
  Flag,
  RefreshCw,
  Zap,
  Shield,
  FileText,
  Users,
  Activity
} from 'lucide-react';

// Notification interfaces
interface Notification {
  id: string;
  type: 'CRIME_ALERT' | 'GRIEVANCE_UPDATE' | 'SYSTEM_ALERT' | 'PERFORMANCE_UPDATE' | 'EMERGENCY' | 'MAINTENANCE' | 'REMINDER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  acknowledged: boolean;
  category: string;
  sourceId?: string;
  location?: string;
  assignedTo?: string;
  actionRequired: boolean;
  expiresAt?: Date;
  metadata?: {
    caseId?: string;
    grievanceId?: string;
    officerId?: string;
    department?: string;
    urgency?: string;
  };
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
  categories: {
    [key: string]: {
      enabled: boolean;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    };
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  frequency: 'IMMEDIATE' | 'EVERY_15MIN' | 'HOURLY' | 'DAILY';
}

interface NotificationSystemProps {
  userRole: string;
  userId: string;
  jurisdiction: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ userRole, userId, jurisdiction }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize notification system
  useEffect(() => {
    initializeNotifications();
    initializeSettings();
    startRealTimeUpdates();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userRole, userId, jurisdiction]);

  // Filter notifications
  useEffect(() => {
    filterNotifications();
  }, [notifications, searchQuery, selectedCategory, selectedPriority, showOnlyUnread]);

  const initializeNotifications = () => {
    // Generate initial notifications based on user role
    const mockNotifications = generateNotifications();
    setNotifications(mockNotifications);
  };

  const initializeSettings = () => {
    const defaultSettings: NotificationSettings = {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      soundEnabled: true,
      categories: {
        'CRIME_ALERT': { enabled: true, priority: 'HIGH' },
        'GRIEVANCE_UPDATE': { enabled: true, priority: 'MEDIUM' },
        'SYSTEM_ALERT': { enabled: true, priority: 'MEDIUM' },
        'PERFORMANCE_UPDATE': { enabled: false, priority: 'LOW' },
        'EMERGENCY': { enabled: true, priority: 'CRITICAL' },
        'MAINTENANCE': { enabled: false, priority: 'LOW' },
        'REMINDER': { enabled: true, priority: 'MEDIUM' }
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '06:00'
      },
      frequency: 'IMMEDIATE'
    };
    setSettings(defaultSettings);
  };

  const generateNotifications = (): Notification[] => {
    const baseCount = userRole === 'DGP' ? 50 : userRole === 'DIG' ? 30 : 20;
    const notifications: Notification[] = [];

    // Emergency notifications
    notifications.push({
      id: 'notif-emergency-1',
      type: 'EMERGENCY',
      priority: 'CRITICAL',
      title: 'Emergency: Multiple Vehicle Accident',
      message: `Major accident reported on ${jurisdiction} Highway. Multiple vehicles involved. Immediate response required.`,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      acknowledged: false,
      category: 'Emergency Response',
      location: `${jurisdiction} Highway`,
      actionRequired: true,
      metadata: {
        urgency: 'IMMEDIATE',
        department: 'Traffic Police'
      }
    });

    // Crime alerts
    notifications.push({
      id: 'notif-crime-1',
      type: 'CRIME_ALERT',
      priority: 'HIGH',
      title: 'High Priority: Armed Robbery Reported',
      message: `Armed robbery reported at ${jurisdiction} Bank. Suspects fled on motorcycle. CCTV footage available.`,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      acknowledged: false,
      category: 'Crime Alert',
      location: `${jurisdiction} Bank`,
      actionRequired: true,
      metadata: {
        caseId: 'CASE-2024-089',
        department: 'Criminal Investigation'
      }
    });

    // Grievance updates
    notifications.push({
      id: 'notif-grievance-1',
      type: 'GRIEVANCE_UPDATE',
      priority: 'MEDIUM',
      title: 'Grievance Escalated: Corruption Complaint',
      message: 'Grievance GRV-2024-001245 has been escalated due to SLA breach. Immediate review required.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      acknowledged: false,
      category: 'Grievance Management',
      actionRequired: true,
      metadata: {
        grievanceId: 'GRV-2024-001245'
      }
    });

    // Performance updates
    notifications.push({
      id: 'notif-performance-1',
      type: 'PERFORMANCE_UPDATE',
      priority: 'LOW',
      title: 'Weekly Performance Report Available',
      message: `Your weekly performance report for ${jurisdiction} is now available for review.`,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      acknowledged: false,
      category: 'Performance Analytics',
      actionRequired: false
    });

    // System alerts
    notifications.push({
      id: 'notif-system-1',
      type: 'SYSTEM_ALERT',
      priority: 'MEDIUM',
      title: 'System Maintenance Scheduled',
      message: 'Planned maintenance on evidence management system scheduled for tonight 11 PM - 2 AM.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
      acknowledged: false,
      category: 'System Maintenance',
      actionRequired: false,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
    });

    // Add more notifications based on role
    for (let i = 5; i < baseCount; i++) {
      const types: (keyof typeof NotificationType)[] = ['CRIME_ALERT', 'GRIEVANCE_UPDATE', 'SYSTEM_ALERT', 'REMINDER'];
      const priorities: Notification['priority'][] = ['LOW', 'MEDIUM', 'HIGH'];
      
      const type = types[Math.floor(Math.random() * types.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      notifications.push({
        id: `notif-${i}`,
        type,
        priority,
        title: generateNotificationTitle(type),
        message: generateNotificationMessage(type, jurisdiction),
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        read: Math.random() > 0.4,
        acknowledged: Math.random() > 0.7,
        category: getCategoryFromType(type),
        actionRequired: Math.random() > 0.6,
        location: Math.random() > 0.5 ? `${jurisdiction} Area ${Math.floor(Math.random() * 10) + 1}` : undefined
      });
    }

    return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const NotificationType = {
    'CRIME_ALERT': 'Crime Alert',
    'GRIEVANCE_UPDATE': 'Grievance Update',
    'SYSTEM_ALERT': 'System Alert',
    'PERFORMANCE_UPDATE': 'Performance Update',
    'EMERGENCY': 'Emergency',
    'MAINTENANCE': 'Maintenance',
    'REMINDER': 'Reminder'
  };

  const generateNotificationTitle = (type: keyof typeof NotificationType): string => {
    const titles: { [key: string]: string[] } = {
      'CRIME_ALERT': [
        'New Crime Report Filed',
        'Suspicious Activity Detected',
        'Theft Case Registered',
        'Vehicle Accident Reported'
      ],
      'GRIEVANCE_UPDATE': [
        'Grievance Status Updated',
        'New Public Complaint',
        'Grievance Requires Action',
        'Feedback Received on Resolution'
      ],
      'SYSTEM_ALERT': [
        'System Update Available',
        'Database Backup Completed',
        'Security Scan Results',
        'Server Performance Alert'
      ],
      'PERFORMANCE_UPDATE': [
        'Performance Review Available',
        'KPI Dashboard Updated',
        'Monthly Metrics Report',
        'Achievement Recognition Alert'
      ],
      'EMERGENCY': [
        'Emergency Response Required',
        'Critical Incident Alert',
        'Immediate Action Needed',
        'Priority Response Request'
      ],
      'MAINTENANCE': [
        'System Maintenance Notice',
        'Scheduled Downtime Alert',
        'Update Installation Required',
        'Backup Process Started'
      ],
      'REMINDER': [
        'Meeting Reminder',
        'Report Submission Due',
        'Training Session Scheduled',
        'Document Review Pending'
      ]
    };

    const typeSpecificTitles = titles[type] || ['Notification Update'];
    return typeSpecificTitles[Math.floor(Math.random() * typeSpecificTitles.length)];
  };

  const generateNotificationMessage = (type: keyof typeof NotificationType, jurisdiction: string): string => {
    const messages: { [key: string]: string[] } = {
      'CRIME_ALERT': [
        `New crime report filed in ${jurisdiction}. Initial response team dispatched.`,
        `Suspicious activity reported by citizen. Requires immediate verification.`,
        `Theft case registered with case ID. Investigation team assigned.`,
        `Vehicle accident reported on main road. Traffic control needed.`
      ],
      'GRIEVANCE_UPDATE': [
        `Grievance status has been updated to under review. Action required within 24 hours.`,
        `New public complaint received through online portal. Assignment pending.`,
        `Grievance escalated due to delay in response. Immediate attention needed.`,
        `Complainant has provided feedback on resolution. Review recommended.`
      ],
      'SYSTEM_ALERT': [
        `System update has been successfully installed. All services are operational.`,
        `Scheduled database backup completed successfully at ${new Date().toLocaleTimeString()}.`,
        `Security scan completed with no threats detected. System is secure.`,
        `Server performance metrics indicate high load. Monitoring continued.`
      ],
      'PERFORMANCE_UPDATE': [
        `Performance metrics updated successfully for ${jurisdiction} division.`,
        `Monthly KPI report is ready for review and download.`,
        `Achievement unlocked: Outstanding response time recorded this month.`,
        `Performance comparison data available in analytics dashboard.`
      ],
      'EMERGENCY': [
        `Emergency situation reported in ${jurisdiction}. All units respond immediately.`,
        `Critical incident requires backup support. Priority level: Maximum.`,
        `Medical emergency reported. Ambulance and police support dispatched.`,
        `Natural disaster alert activated. Evacuation procedures initiated.`
      ],
      'MAINTENANCE': [
        `System maintenance window starts in 1 hour. Save all work immediately.`,
        `Database optimization completed. System performance improved significantly.`,
        `Security update installation finished. All systems are secure and updated.`,
        `Backup verification completed successfully. All data integrity confirmed.`
      ],
      'REMINDER': [
        `Scheduled meeting in 30 minutes. Please review agenda and join on time.`,
        `Monthly report submission deadline is tomorrow. Ensure all data is updated.`,
        `Training session on new protocols starts in 1 hour. Attendance is mandatory.`,
        `Document review is pending for approval. Please complete within 2 days.`
      ]
    };

    const typeSpecificMessages = messages[type] || [`Update notification for ${jurisdiction}.`];
    return typeSpecificMessages[Math.floor(Math.random() * typeSpecificMessages.length)];
  };

  const getCategoryFromType = (type: keyof typeof NotificationType): string => {
    const categories = {
      'CRIME_ALERT': 'Crime Management',
      'GRIEVANCE_UPDATE': 'Grievance Management',
      'SYSTEM_ALERT': 'System Administration',
      'PERFORMANCE_UPDATE': 'Performance Analytics',
      'EMERGENCY': 'Emergency Response',
      'MAINTENANCE': 'System Maintenance',
      'REMINDER': 'Task Management'
    };
    return categories[type] || 'General';
  };

  const startRealTimeUpdates = () => {
    // Simulate real-time updates every 30 seconds
    intervalRef.current = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new notification
        const newNotification = generateSingleNotification();
        setNotifications(prev => [newNotification, ...prev]);
        
        // Play sound if enabled
        if (settings?.soundEnabled && newNotification.priority !== 'LOW') {
          playNotificationSound();
        }
        
        setLastUpdate(new Date());
      }
    }, 30000);
  };

  const generateSingleNotification = (): Notification => {
    const types: (keyof typeof NotificationType)[] = ['CRIME_ALERT', 'GRIEVANCE_UPDATE', 'SYSTEM_ALERT'];
    const priorities: Notification['priority'][] = ['MEDIUM', 'HIGH'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    return {
      id: `notif-${Date.now()}`,
      type,
      priority,
      title: `🔴 ${generateNotificationTitle(type)}`,
      message: generateNotificationMessage(type, jurisdiction),
      timestamp: new Date(),
      read: false,
      acknowledged: false,
      category: getCategoryFromType(type),
      actionRequired: Math.random() > 0.5,
      location: `${jurisdiction} Area ${Math.floor(Math.random() * 10) + 1}`
    };
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notif =>
        notif.title.toLowerCase().includes(query) ||
        notif.message.toLowerCase().includes(query) ||
        notif.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(notif => notif.category === selectedCategory);
    }

    // Priority filter
    if (selectedPriority !== 'ALL') {
      filtered = filtered.filter(notif => notif.priority === selectedPriority);
    }

    // Unread filter
    if (showOnlyUnread) {
      filtered = filtered.filter(notif => !notif.read);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAsAcknowledged = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, acknowledged: true } : notif
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'text-green-600 bg-green-100 border-green-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'HIGH': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'CRITICAL': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY': return AlertTriangle;
      case 'CRIME_ALERT': return Shield;
      case 'GRIEVANCE_UPDATE': return FileText;
      case 'SYSTEM_ALERT': return Settings;
      case 'PERFORMANCE_UPDATE': return Activity;
      default: return Info;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'CRITICAL' && !n.acknowledged).length;

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={`relative p-2 rounded-lg transition-colors ${
            criticalCount > 0 
              ? 'bg-red-600 text-white animate-pulse' 
              : unreadCount > 0 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {criticalCount > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-96 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <h3 className="font-semibold">Notifications</h3>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {unreadCount} new
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                <span>•</span>
                <span>Updated {formatTimestamp(lastUpdate)}</span>
              </div>
            </div>

            {/* Filters */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark All Read
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                <button
                  onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    showOnlyUnread 
                      ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {showOnlyUnread ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-96">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">No notifications found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map(notification => {
                    const TypeIcon = getTypeIcon(notification.type);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                          !notification.read ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200'
                        } ${notification.priority === 'CRITICAL' ? 'bg-red-50 border-red-500' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-full ${getPriorityColor(notification.priority)}`}>
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h4>
                              {notification.actionRequired && (
                                <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full text-xs font-medium">
                                  Action Required
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                {notification.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {notification.location}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {notification.actionRequired && !notification.acknowledged && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsAcknowledged(notification.id);
                                    }}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{filteredNotifications.length} notifications</span>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  View All History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-96 max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notification Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-96">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Delivery Methods</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings?.emailEnabled}
                      onChange={(e) => setSettings(prev => prev ? {...prev, emailEnabled: e.target.checked} : null)}
                      className="rounded border-gray-300"
                    />
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span>Email Notifications</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings?.smsEnabled}
                      onChange={(e) => setSettings(prev => prev ? {...prev, smsEnabled: e.target.checked} : null)}
                      className="rounded border-gray-300"
                    />
                    <Smartphone className="h-4 w-4 text-gray-600" />
                    <span>SMS Notifications</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings?.soundEnabled}
                      onChange={(e) => setSettings(prev => prev ? {...prev, soundEnabled: e.target.checked} : null)}
                      className="rounded border-gray-300"
                    />
                    {settings?.soundEnabled ? <Volume2 className="h-4 w-4 text-gray-600" /> : <VolumeX className="h-4 w-4 text-gray-600" />}
                    <span>Sound Alerts</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Frequency</h4>
                <select
                  value={settings?.frequency}
                  onChange={(e) => setSettings(prev => prev ? {...prev, frequency: e.target.value as any} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="IMMEDIATE">Immediate</option>
                  <option value="EVERY_15MIN">Every 15 minutes</option>
                  <option value="HOURLY">Hourly</option>
                  <option value="DAILY">Daily</option>
                </select>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Quiet Hours</h4>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={settings?.quietHours.enabled}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev, 
                      quietHours: {...prev.quietHours, enabled: e.target.checked}
                    } : null)}
                    className="rounded border-gray-300"
                  />
                  <span>Enable quiet hours</span>
                </label>
                {settings?.quietHours.enabled && (
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={settings.quietHours.startTime}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        quietHours: {...prev.quietHours, startTime: e.target.value}
                      } : null)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <span className="flex items-center text-gray-600">to</span>
                    <input
                      type="time"
                      value={settings.quietHours.endTime}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        quietHours: {...prev.quietHours, endTime: e.target.value}
                      } : null)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element for notification sounds */}
      <audio
        ref={audioRef}
        preload="auto"
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBDuC0/DOeCwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwiBD"
      />
    </>
  );
};

export default NotificationSystem;
