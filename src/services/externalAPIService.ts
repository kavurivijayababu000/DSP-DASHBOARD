// External API Integration Service
// Phase 3 Priority 4: Real Police System Integration

export interface CCTNSAPIConfig {
  baseURL: string;
  apiKey: string;
  timeout: number;
}

export interface SMSGatewayConfig {
  provider: 'nic' | 'bsnl' | 'textlocal';
  endpoint: string;
  username: string;
  password: string;
  senderId: string;
}

export interface PushNotificationConfig {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  gcmAPIKey?: string;
}

export interface ExternalSystemStatus {
  system: string;
  status: 'online' | 'offline' | 'maintenance';
  lastChecked: string;
  responseTime?: number;
}

// CCTNS (Crime and Criminal Tracking Network and Systems) Integration
export class CCTNSIntegration {
  private config: CCTNSAPIConfig;
  private cache: Map<string, any> = new Map();
  private rateLimiter: Map<string, number> = new Map();

  constructor(config: CCTNSAPIConfig) {
    this.config = config;
  }

  async getFIRDetails(firNumber: string): Promise<any> {
    try {
      const cacheKey = `fir-${firNumber}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Rate limiting check
      if (this.isRateLimited('fir-lookup')) {
        throw new Error('Rate limit exceeded for FIR lookup');
      }

      const response = await fetch(`${this.config.baseURL}/api/fir/${firNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Source': 'SDPO-Dashboard'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`CCTNS API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache for 5 minutes
      this.cache.set(cacheKey, data);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
      
      return data;
    } catch (error) {
      console.error('CCTNS FIR lookup failed:', error);
      throw error;
    }
  }

  async getCrimeStatistics(districtCode: string, dateRange: { start: string; end: string }): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/statistics/crime`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          districtCode,
          startDate: dateRange.start,
          endDate: dateRange.end
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`CCTNS Statistics API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CCTNS crime statistics failed:', error);
      throw error;
    }
  }

  async submitPerformanceData(data: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/performance/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'SDPO-Dashboard'
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      return response.ok;
    } catch (error) {
      console.error('CCTNS performance data submission failed:', error);
      return false;
    }
  }

  private isRateLimited(operation: string): boolean {
    const now = Date.now();
    const lastCall = this.rateLimiter.get(operation) || 0;
    const minInterval = 1000; // 1 second between calls
    
    if (now - lastCall < minInterval) {
      return true;
    }
    
    this.rateLimiter.set(operation, now);
    return false;
  }
}

// SMS Gateway Integration
export class SMSService {
  private config: SMSGatewayConfig;
  private queue: any[] = [];
  private processing = false;

  constructor(config: SMSGatewayConfig) {
    this.config = config;
  }

  async sendSMS(phoneNumber: string, message: string, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<boolean> {
    try {
      // Add to queue for processing
      this.queue.push({
        phoneNumber,
        message,
        priority,
        timestamp: Date.now(),
        retries: 0
      });

      // Process queue if not already processing
      if (!this.processing) {
        this.processQueue();
      }

      return true;
    } catch (error) {
      console.error('SMS queueing failed:', error);
      return false;
    }
  }

  async sendBulkSMS(recipients: string[], message: string): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = recipients.map(async (phoneNumber) => {
      try {
        const result = await this.sendSMS(phoneNumber, message);
        if (result) success++;
        else failed++;
      } catch (error) {
        failed++;
      }
    });

    await Promise.allSettled(promises);
    
    return { success, failed };
  }

  async sendEmergencyAlert(phoneNumbers: string[], alertType: string, location?: string): Promise<boolean> {
    const message = this.formatEmergencyMessage(alertType, location);
    
    try {
      const results = await this.sendBulkSMS(phoneNumbers, message);
      console.log(`Emergency alert sent: ${results.success} success, ${results.failed} failed`);
      return results.success > 0;
    } catch (error) {
      console.error('Emergency alert failed:', error);
      return false;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    // Sort by priority
    this.queue.sort((a: any, b: any) => {
      const priorityOrder: { [key: string]: number } = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    while (this.queue.length > 0) {
      const smsData = this.queue.shift();
      
      try {
        const success = await this.sendSMSInternal(smsData.phoneNumber, smsData.message);
        
        if (!success && smsData.retries < 3) {
          smsData.retries++;
          this.queue.push(smsData); // Re-queue for retry
        }
        
        // Rate limiting - wait between sends
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('SMS processing error:', error);
      }
    }

    this.processing = false;
  }

  private async sendSMSInternal(phoneNumber: string, message: string): Promise<boolean> {
    try {
      let response: Response;

      switch (this.config.provider) {
        case 'nic':
          response = await this.sendViaNIC(phoneNumber, message);
          break;
        case 'bsnl':
          response = await this.sendViaBSNL(phoneNumber, message);
          break;
        case 'textlocal':
          response = await this.sendViaTextLocal(phoneNumber, message);
          break;
        default:
          throw new Error('Unknown SMS provider');
      }

      return response.ok;
    } catch (error) {
      console.error('SMS send failed:', error);
      return false;
    }
  }

  private async sendViaNIC(phoneNumber: string, message: string): Promise<Response> {
    return fetch(this.config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.config.username,
        password: this.config.password,
        senderId: this.config.senderId,
        mobileNo: phoneNumber,
        message: message
      })
    });
  }

  private async sendViaBSNL(phoneNumber: string, message: string): Promise<Response> {
    return fetch(this.config.endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  private async sendViaTextLocal(phoneNumber: string, message: string): Promise<Response> {
    const params = new URLSearchParams({
      apikey: this.config.password,
      numbers: phoneNumber,
      message: message,
      sender: this.config.senderId
    });

    return fetch(`${this.config.endpoint}?${params}`, {
      method: 'GET'
    });
  }

  private formatEmergencyMessage(alertType: string, location?: string): string {
    const locationText = location ? ` at ${location}` : '';
    
    switch (alertType) {
      case 'law_and_order':
        return `URGENT: Law & Order situation reported${locationText}. All units respond immediately. -AP Police`;
      case 'natural_disaster':
        return `ALERT: Natural disaster reported${locationText}. Emergency response required. -AP Police`;
      case 'major_crime':
        return `PRIORITY: Major crime incident reported${locationText}. Immediate attention required. -AP Police`;
      default:
        return `ALERT: Emergency situation reported${locationText}. Immediate response required. -AP Police`;
    }
  }
}

// Push Notification Service
export class PushNotificationService {
  private config: PushNotificationConfig;
  private subscriptions: Map<string, PushSubscription> = new Map();

  constructor(config: PushNotificationConfig) {
    this.config = config;
  }

  async initializePushNotifications(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Push notification initialization failed:', error);
      return false;
    }
  }

  async subscribeUser(userId: string): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(this.config.vapidPublicKey) as BufferSource
      });

      this.subscriptions.set(userId, subscription);
      
      // Send subscription to server
      await this.sendSubscriptionToServer(userId, subscription);
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async sendNotificationToUser(userId: string, notification: any): Promise<boolean> {
    try {
      const subscription = this.subscriptions.get(userId);
      if (!subscription) {
        console.warn('No push subscription found for user:', userId);
        return false;
      }

      // This would typically be done on the server
      // Here we're simulating the server-side push
      console.log('Sending push notification:', notification);
      return true;
    } catch (error) {
      console.error('Push notification send failed:', error);
      return false;
    }
  }

  async sendBroadcastNotification(userIds: string[], notification: any): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = userIds.map(async (userId) => {
      try {
        const result = await this.sendNotificationToUser(userId, notification);
        if (result) success++;
        else failed++;
      } catch (error) {
        failed++;
      }
    });

    await Promise.allSettled(promises);
    
    return { success, failed };
  }

  private async sendSubscriptionToServer(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscription
        })
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// External System Health Monitor
export class SystemHealthMonitor {
  private systems: Map<string, ExternalSystemStatus> = new Map();
  private checkInterval: number = 5 * 60 * 1000; // 5 minutes
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.initializeSystems();
  }

  startMonitoring(): void {
    this.intervalId = setInterval(() => {
      this.checkAllSystems();
    }, this.checkInterval);
    
    // Initial check
    this.checkAllSystems();
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  getSystemStatus(system: string): ExternalSystemStatus | null {
    return this.systems.get(system) || null;
  }

  getAllSystemsStatus(): ExternalSystemStatus[] {
    return Array.from(this.systems.values());
  }

  private initializeSystems(): void {
    const systemNames = [
      'CCTNS API',
      'SMS Gateway',
      'Push Notification Service',
      'File Storage Service',
      'Authentication Service',
      'Backup Service'
    ];

    systemNames.forEach(name => {
      this.systems.set(name, {
        system: name,
        status: 'offline',
        lastChecked: new Date().toISOString()
      });
    });
  }

  private async checkAllSystems(): Promise<void> {
    const checkPromises = Array.from(this.systems.keys()).map(systemName => 
      this.checkSystemHealth(systemName)
    );

    await Promise.allSettled(checkPromises);
  }

  private async checkSystemHealth(systemName: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      let endpoint = '';
      
      switch (systemName) {
        case 'CCTNS API':
          endpoint = '/api/cctns/health';
          break;
        case 'SMS Gateway':
          endpoint = '/api/sms/health';
          break;
        case 'Push Notification Service':
          endpoint = '/api/push/health';
          break;
        default:
          endpoint = `/api/${systemName.toLowerCase().replace(' ', '-')}/health`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseTime = Date.now() - startTime;
      const status: ExternalSystemStatus = {
        system: systemName,
        status: response.ok ? 'online' : 'offline',
        lastChecked: new Date().toISOString(),
        responseTime
      };

      this.systems.set(systemName, status);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.systems.set(systemName, {
        system: systemName,
        status: 'offline',
        lastChecked: new Date().toISOString(),
        responseTime
      });
      
      console.error(`Health check failed for ${systemName}:`, error);
    }
  }
}

// Main External API Service
export class ExternalAPIService {
  private cctns?: CCTNSIntegration;
  private sms?: SMSService;
  private pushNotifications?: PushNotificationService;
  private healthMonitor: SystemHealthMonitor;

  constructor() {
    this.healthMonitor = new SystemHealthMonitor();
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize CCTNS integration
      const cctnsConfig: CCTNSAPIConfig = {
        baseURL: process.env.REACT_APP_CCTNS_API_URL || 'https://api.cctns.gov.in',
        apiKey: process.env.REACT_APP_CCTNS_API_KEY || '',
        timeout: 30000
      };
      this.cctns = new CCTNSIntegration(cctnsConfig);

      // Initialize SMS service
      const smsConfig: SMSGatewayConfig = {
        provider: (process.env.REACT_APP_SMS_PROVIDER as any) || 'nic',
        endpoint: process.env.REACT_APP_SMS_ENDPOINT || '',
        username: process.env.REACT_APP_SMS_USERNAME || '',
        password: process.env.REACT_APP_SMS_PASSWORD || '',
        senderId: process.env.REACT_APP_SMS_SENDER_ID || 'APPOL'
      };
      this.sms = new SMSService(smsConfig);

      // Initialize Push Notifications
      const pushConfig: PushNotificationConfig = {
        vapidPublicKey: process.env.REACT_APP_VAPID_PUBLIC_KEY || '',
        vapidPrivateKey: process.env.REACT_APP_VAPID_PRIVATE_KEY || ''
      };
      this.pushNotifications = new PushNotificationService(pushConfig);

      // Start health monitoring
      this.healthMonitor.startMonitoring();

      console.log('External API services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize external API services:', error);
    }
  }

  getCCTNS(): CCTNSIntegration | undefined {
    return this.cctns;
  }

  getSMS(): SMSService | undefined {
    return this.sms;
  }

  getPushNotifications(): PushNotificationService | undefined {
    return this.pushNotifications;
  }

  getHealthMonitor(): SystemHealthMonitor {
    return this.healthMonitor;
  }

  async testConnections(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    // Test CCTNS
    try {
      if (this.cctns) {
        await fetch('/api/cctns/health', { method: 'HEAD' });
        results.cctns = true;
      }
    } catch (error) {
      results.cctns = false;
    }

    // Test SMS
    try {
      if (this.sms) {
        await fetch('/api/sms/health', { method: 'HEAD' });
        results.sms = true;
      }
    } catch (error) {
      results.sms = false;
    }

    // Test Push Notifications
    try {
      if (this.pushNotifications) {
        results.pushNotifications = 'Notification' in window && 'serviceWorker' in navigator;
      }
    } catch (error) {
      results.pushNotifications = false;
    }

    return results;
  }
}

// Export singleton instance
export const externalAPIService = new ExternalAPIService();
