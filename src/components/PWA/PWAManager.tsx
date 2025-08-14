import React, { useState, useEffect, useCallback } from 'react';
import { 
  Download, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  HardDrive,
  RefreshCw,
  Settings,
  Bell,
  BellRing,
  Shield,
  Lock,
  Unlock,
  Database,
  Cloud,
  CloudOff,
  Activity,
  Battery,
  Signal,
  MapPin,
  Camera,
  Mic,
  Share2,
  Home,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Monitor,
  Maximize2,
  Minimize2
} from 'lucide-react';

// PWA Interfaces
interface PWAManagerProps {
  userRole: string;
  jurisdiction: string;
  onInstallPrompt?: () => void;
}

interface ServiceWorkerState {
  isRegistered: boolean;
  isUpdating: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  hasNotifications: boolean;
  hasGeolocation: boolean;
  hasCamera: boolean;
  hasMicrophone: boolean;
  hasBackgroundSync: boolean;
  hasPersistentStorage: boolean;
  supportsPush: boolean;
}

interface OfflineData {
  lastSync: Date;
  pendingActions: OfflineAction[];
  cachedData: CachedDataItem[];
  storageUsed: number;
  storageQuota: number;
}

interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

interface CachedDataItem {
  key: string;
  type: 'KPI' | 'REPORT' | 'NOTIFICATION' | 'CASE' | 'USER';
  data: any;
  timestamp: Date;
  expiresAt: Date;
  size: number;
}

const PWAManager: React.FC<PWAManagerProps> = ({ userRole, jurisdiction, onInstallPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'offline' | 'notifications' | 'storage'>('install');
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [serviceWorker, setServiceWorker] = useState<ServiceWorkerState>({
    isRegistered: false,
    isUpdating: false,
    hasUpdate: false,
    registration: null
  });
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    hasNotifications: false,
    hasGeolocation: false,
    hasCamera: false,
    hasMicrophone: false,
    hasBackgroundSync: false,
    hasPersistentStorage: false,
    supportsPush: false
  });
  const [offlineData, setOfflineData] = useState<OfflineData>({
    lastSync: new Date(),
    pendingActions: [],
    cachedData: [],
    storageUsed: 0,
    storageQuota: 0
  });
  const [installStatus, setInstallStatus] = useState<'pending' | 'installing' | 'installed' | 'failed'>('pending');

  // Initialize PWA capabilities
  useEffect(() => {
    checkCapabilities();
    registerServiceWorker();
    setupInstallPrompt();
    loadOfflineData();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkCapabilities = async () => {
    const caps: Partial<PWACapabilities> = {
      isOnline: navigator.onLine
    };

    // Check if app is installed (standalone mode)
    caps.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       window.matchMedia('(display-mode: fullscreen)').matches ||
                       (window.navigator as any).standalone === true;

    // Check notification support
    caps.hasNotifications = 'Notification' in window;
    if (caps.hasNotifications) {
      caps.hasNotifications = Notification.permission === 'granted';
    }

    // Check geolocation
    caps.hasGeolocation = 'geolocation' in navigator;

    // Check camera/microphone
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        caps.hasCamera = devices.some(device => device.kind === 'videoinput');
        caps.hasMicrophone = devices.some(device => device.kind === 'audioinput');
      } catch (error) {
        caps.hasCamera = false;
        caps.hasMicrophone = false;
      }
    }

    // Check background sync
    caps.hasBackgroundSync = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;

    // Check persistent storage
    if ('storage' in navigator && 'persist' in navigator.storage) {
      caps.hasPersistentStorage = await navigator.storage.persist();
    }

    // Check push notifications
    caps.supportsPush = 'serviceWorker' in navigator && 'PushManager' in window;

    setCapabilities(prev => ({ ...prev, ...caps }));
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        setServiceWorker(prev => ({
          ...prev,
          isRegistered: true,
          registration
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          setServiceWorker(prev => ({ ...prev, isUpdating: true }));
          
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setServiceWorker(prev => ({
                  ...prev,
                  hasUpdate: true,
                  isUpdating: false
                }));
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const setupInstallPrompt = () => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as InstallPromptEvent);
      setCapabilities(prev => ({ ...prev, isInstallable: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  };

  const loadOfflineData = async () => {
    try {
      // Get storage estimate
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setOfflineData(prev => ({
          ...prev,
          storageUsed: estimate.usage || 0,
          storageQuota: estimate.quota || 0
        }));
      }

      // Load cached data from IndexedDB (simulated)
      const mockCachedData: CachedDataItem[] = [
        {
          key: 'kpi_data',
          type: 'KPI',
          data: { performance: 89.5, cases: 127 },
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          size: 1024
        },
        {
          key: 'recent_cases',
          type: 'CASE',
          data: [{ id: 1, title: 'Case A' }],
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          size: 2048
        }
      ];

      setOfflineData(prev => ({
        ...prev,
        cachedData: mockCachedData,
        lastSync: new Date(Date.now() - 10 * 60 * 1000)
      }));
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    setInstallStatus('installing');
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setInstallStatus('installed');
        setCapabilities(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
        onInstallPrompt?.();
      } else {
        setInstallStatus('failed');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Installation failed:', error);
      setInstallStatus('failed');
    }
  };

  const handleServiceWorkerUpdate = async () => {
    if (serviceWorker.registration) {
      const newWorker = serviceWorker.registration.waiting;
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setCapabilities(prev => ({ 
        ...prev, 
        hasNotifications: permission === 'granted' 
      }));
    }
  };

  const requestGeolocationPermission = async () => {
    if ('geolocation' in navigator) {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setCapabilities(prev => ({ ...prev, hasGeolocation: true }));
      } catch (error) {
        console.error('Geolocation permission denied:', error);
      }
    }
  };

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Clear IndexedDB (simulated)
      setOfflineData(prev => ({
        ...prev,
        cachedData: [],
        storageUsed: 0
      }));
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Install Tab Content
  const renderInstallTab = () => (
    <div className="space-y-6">
      {/* Installation Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            capabilities.isInstalled 
              ? 'bg-green-500 text-white' 
              : capabilities.isInstallable 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-300 text-gray-600'
          }`}>
            {capabilities.isInstalled ? (
              <CheckCircle className="h-6 w-6" />
            ) : capabilities.isInstallable ? (
              <Download className="h-6 w-6" />
            ) : (
              <Smartphone className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {capabilities.isInstalled 
                ? 'App Installed' 
                : capabilities.isInstallable 
                  ? 'Install Available' 
                  : 'Installation Not Available'}
            </h3>
            <p className="text-gray-600 text-sm">
              {capabilities.isInstalled 
                ? 'SDPO Dashboard is installed and ready to use offline' 
                : capabilities.isInstallable 
                  ? 'Install the app for better performance and offline access' 
                  : 'Use "Add to Home Screen" from your browser menu'}
            </p>
          </div>
        </div>
        
        {capabilities.isInstallable && !capabilities.isInstalled && (
          <div className="mt-4">
            <button
              onClick={handleInstallApp}
              disabled={installStatus === 'installing'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {installStatus === 'installing' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{installStatus === 'installing' ? 'Installing...' : 'Install App'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { 
            label: 'Offline Access', 
            enabled: serviceWorker.isRegistered,
            icon: capabilities.isOnline ? Wifi : WifiOff,
            color: capabilities.isOnline ? 'text-green-600' : 'text-red-600'
          },
          { 
            label: 'Push Notifications', 
            enabled: capabilities.hasNotifications,
            icon: capabilities.hasNotifications ? Bell : BellRing,
            color: capabilities.hasNotifications ? 'text-green-600' : 'text-gray-400',
            action: !capabilities.hasNotifications ? requestNotificationPermission : undefined
          },
          { 
            label: 'Location Services', 
            enabled: capabilities.hasGeolocation,
            icon: MapPin,
            color: capabilities.hasGeolocation ? 'text-green-600' : 'text-gray-400',
            action: !capabilities.hasGeolocation ? requestGeolocationPermission : undefined
          },
          { 
            label: 'Camera Access', 
            enabled: capabilities.hasCamera,
            icon: Camera,
            color: capabilities.hasCamera ? 'text-green-600' : 'text-gray-400'
          }
        ].map((capability, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <capability.icon className={`h-5 w-5 ${capability.color}`} />
                <div>
                  <h4 className="font-medium text-gray-900">{capability.label}</h4>
                  <p className="text-sm text-gray-500">
                    {capability.enabled ? 'Available' : 'Not Available'}
                  </p>
                </div>
              </div>
              {capability.action && (
                <button
                  onClick={capability.action}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Enable
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Service Worker Status */}
      {serviceWorker.hasUpdate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Update Available</h4>
                <p className="text-sm text-yellow-700">A new version of the app is ready to install</p>
              </div>
            </div>
            <button
              onClick={handleServiceWorkerUpdate}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors text-sm"
            >
              Update Now
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Offline Tab Content
  const renderOfflineTab = () => (
    <div className="space-y-6">
      {/* Sync Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Offline Status</h3>
          <div className={`flex items-center space-x-2 ${
            capabilities.isOnline ? 'text-green-600' : 'text-red-600'
          }`}>
            {capabilities.isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {capabilities.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Last sync: {formatTimeAgo(offlineData.lastSync)}</p>
          <p>Pending actions: {offlineData.pendingActions.length}</p>
          <p>Cached items: {offlineData.cachedData.length}</p>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Storage Usage</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Used</span>
            <span className="text-sm font-medium">{formatBytes(offlineData.storageUsed)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Available</span>
            <span className="text-sm font-medium">
              {formatBytes(offlineData.storageQuota - offlineData.storageUsed)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full"
              style={{ 
                width: `${(offlineData.storageUsed / offlineData.storageQuota) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Cached Data */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Cached Data</h3>
          <button
            onClick={clearCache}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Clear All
          </button>
        </div>
        
        <div className="space-y-2">
          {offlineData.cachedData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.key}</p>
                <p className="text-xs text-gray-500">
                  {item.type} • {formatBytes(item.size)} • Expires {formatTimeAgo(item.expiresAt)}
                </p>
              </div>
              <button className="text-red-500 hover:text-red-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <Smartphone className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">PWA Settings</h2>
              <p className="text-blue-100 text-sm">Progressive Web App Configuration</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'install', label: 'Install', icon: Download },
              { id: 'offline', label: 'Offline', icon: WifiOff },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'storage', label: 'Storage', icon: HardDrive }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'install' && renderInstallTab()}
          {activeTab === 'offline' && renderOfflineTab()}
          
          {/* Placeholder for other tabs */}
          {!['install', 'offline'].includes(activeTab) && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
              </h3>
              <p>Configuration options coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAManager;
