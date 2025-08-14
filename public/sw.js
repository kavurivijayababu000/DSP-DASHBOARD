// SDPO Dashboard Service Worker
// Version 3.0.0 - Phase 3 Implementation

const CACHE_NAME = 'sdpo-dashboard-v3';
const RUNTIME_CACHE = 'sdpo-runtime-v3';
const DATA_CACHE = 'sdpo-data-v3';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Static assets to cache (Cache First strategy)
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/ApNewMap.png',
  '/ApNewMap_base.png',
  '/ApNewMap_clean.png',
  '/ApNewMap_neutral.png',
  '/ApNewMap_outline.png'
];

// API endpoints to cache (Network First strategy)
const API_ENDPOINTS = [
  '/api/kpi',
  '/api/performance',
  '/api/crimes',
  '/api/grievances',
  '/api/notifications',
  '/api/users/profile',
  '/api/reports'
];

// Data that should always be fresh (Network Only strategy)
const FRESH_DATA_ENDPOINTS = [
  '/api/auth',
  '/api/emergency',
  '/api/real-time',
  '/api/security/events'
];

// Background sync tags
const SYNC_TAGS = {
  CASE_UPDATE: 'case-update',
  PERFORMANCE_SYNC: 'performance-sync',
  NOTIFICATION_SEND: 'notification-send',
  REPORT_SUBMIT: 'report-submit',
  FILE_UPLOAD: 'file-upload'
};

// IndexedDB configuration
const DB_NAME = 'sdpo-offline-db';
const DB_VERSION = 3;
const STORES = {
  QUEUE: 'sync-queue',
  CACHE: 'cached-data',
  CONFIG: 'app-config',
  NOTIFICATIONS: 'notifications'
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing v3.0.0');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting(); // Force activation
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating v3.0.0');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete old caches
            if (cacheName !== CACHE_NAME && 
                cacheName !== RUNTIME_CACHE && 
                cacheName !== DATA_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Old caches cleaned up');
        return self.clients.claim(); // Take control immediately
      })
      .catch(error => {
        console.error('Service Worker: Failed to clean up caches:', error);
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for background sync
  if (request.method !== 'GET') {
    return handleNonGetRequest(event);
  }
  
  // Determine caching strategy based on URL
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else if (isAPIEndpoint(url)) {
    event.respondWith(networkFirst(request));
  } else if (isFreshDataEndpoint(url)) {
    event.respondWith(networkOnly(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Background sync event
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.CASE_UPDATE:
      event.waitUntil(syncCaseUpdates());
      break;
    case SYNC_TAGS.PERFORMANCE_SYNC:
      event.waitUntil(syncPerformanceData());
      break;
    case SYNC_TAGS.NOTIFICATION_SEND:
      event.waitUntil(syncNotifications());
      break;
    case SYNC_TAGS.REPORT_SUBMIT:
      event.waitUntil(syncReports());
      break;
    case SYNC_TAGS.FILE_UPLOAD:
      event.waitUntil(syncFileUploads());
      break;
    default:
      console.log('Service Worker: Unknown sync tag:', event.tag);
  }
});

// Push event - handle push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {
    title: 'SDPO Dashboard',
    body: 'You have a new notification',
    icon: '/ApNewMap.png',
    badge: '/ApNewMap.png',
    data: {}
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('Service Worker: Failed to parse push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      requireInteraction: notificationData.data?.priority === 'high'
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app or navigate to specific page
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          // Focus existing window if available
          for (const client of clientList) {
            if (client.url.includes('dashboard') && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window if none exists
          if (clients.openWindow) {
            return clients.openWindow('/dashboard');
          }
        })
    );
  }
});

// Message event - handle client messages
self.addEventListener('message', event => {
  console.log('Service Worker: Message received:', event.data);
  
  switch (event.data?.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    case 'SYNC_NOW':
      triggerBackgroundSync(event.data.tag);
      break;
    default:
      console.log('Service Worker: Unknown message type:', event.data?.type);
  }
});

// Caching strategies implementation

function cacheFirst(request) {
  return caches.open(CACHE_NAME)
    .then(cache => cache.match(request))
    .then(response => {
      if (response) {
        return response;
      }
      
      return fetch(request)
        .then(networkResponse => {
          // Cache the response for future use
          if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        });
    })
    .catch(error => {
      console.error('Service Worker: Cache first strategy failed:', error);
      return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    });
}

function networkFirst(request) {
  return caches.open(DATA_CACHE)
    .then(cache => {
      return fetch(request)
        .then(networkResponse => {
          // Cache successful responses
          if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(error => {
          // Fallback to cache if network fails
          console.log('Service Worker: Network failed, falling back to cache');
          return cache.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              throw new Error('No cached response available');
            });
        });
    })
    .catch(error => {
      console.error('Service Worker: Network first strategy failed:', error);
      return new Response(
        JSON.stringify({ error: 'Offline mode', cached: false }), 
        { 
          status: 503, 
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    });
}

function staleWhileRevalidate(request) {
  return caches.open(RUNTIME_CACHE)
    .then(cache => {
      return cache.match(request)
        .then(cachedResponse => {
          // Fetch from network in background
          const fetchPromise = fetch(request)
            .then(networkResponse => {
              if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(error => {
              console.log('Service Worker: Background fetch failed:', error);
            });
          
          // Return cached response immediately, or wait for network
          return cachedResponse || fetchPromise;
        });
    });
}

function networkOnly(request) {
  return fetch(request)
    .catch(error => {
      console.error('Service Worker: Network only request failed:', error);
      return new Response(
        JSON.stringify({ error: 'Network unavailable' }),
        { 
          status: 503, 
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    });
}

// URL classification helpers

function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname.includes(asset)) ||
         url.pathname.includes('/static/') ||
         url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/);
}

function isAPIEndpoint(url) {
  return API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint)) ||
         url.pathname.startsWith('/api/');
}

function isFreshDataEndpoint(url) {
  return FRESH_DATA_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

// Non-GET request handling for background sync

function handleNonGetRequest(event) {
  const { request } = event;
  
  // Try network first
  event.respondWith(
    fetch(request.clone())
      .catch(error => {
        console.log('Service Worker: Non-GET request failed, queuing for sync:', error);
        
        // Queue request for background sync
        return queueRequestForSync(request)
          .then(() => {
            return new Response(
              JSON.stringify({ 
                queued: true, 
                message: 'Request queued for background sync' 
              }),
              { 
                status: 202, 
                statusText: 'Accepted',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
      })
  );
}

// Background sync functions

async function syncCaseUpdates() {
  console.log('Service Worker: Syncing case updates');
  
  try {
    const db = await openDB();
    const queue = await getQueuedItems(db, 'case');
    
    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        });
        
        if (response.ok) {
          await removeFromQueue(db, item.id);
          console.log('Service Worker: Case update synced successfully');
        } else {
          console.error('Service Worker: Case update sync failed:', response.statusText);
        }
      } catch (error) {
        console.error('Service Worker: Case update sync error:', error);
        await incrementRetryCount(db, item.id);
      }
    }
  } catch (error) {
    console.error('Service Worker: Case sync failed:', error);
  }
}

async function syncPerformanceData() {
  console.log('Service Worker: Syncing performance data');
  // Implementation similar to syncCaseUpdates
}

async function syncNotifications() {
  console.log('Service Worker: Syncing notifications');
  // Implementation similar to syncCaseUpdates
}

async function syncReports() {
  console.log('Service Worker: Syncing reports');
  // Implementation similar to syncCaseUpdates
}

async function syncFileUploads() {
  console.log('Service Worker: Syncing file uploads');
  // Implementation similar to syncCaseUpdates
}

// IndexedDB helpers

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Create object stores
      Object.values(STORES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
          
          if (storeName === STORES.QUEUE) {
            store.createIndex('type', 'type');
            store.createIndex('timestamp', 'timestamp');
          }
        }
      });
    };
  });
}

async function queueRequestForSync(request) {
  const db = await openDB();
  const transaction = db.transaction([STORES.QUEUE], 'readwrite');
  const store = transaction.objectStore(STORES.QUEUE);
  
  const queueItem = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now(),
    retryCount: 0,
    type: determineRequestType(request.url)
  };
  
  return store.add(queueItem);
}

function determineRequestType(url) {
  if (url.includes('/api/cases')) return 'case';
  if (url.includes('/api/performance')) return 'performance';
  if (url.includes('/api/notifications')) return 'notification';
  if (url.includes('/api/reports')) return 'report';
  if (url.includes('/api/files')) return 'file';
  return 'unknown';
}

async function getQueuedItems(db, type) {
  const transaction = db.transaction([STORES.QUEUE], 'readonly');
  const store = transaction.objectStore(STORES.QUEUE);
  const index = store.index('type');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll(type);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeFromQueue(db, id) {
  const transaction = db.transaction([STORES.QUEUE], 'readwrite');
  const store = transaction.objectStore(STORES.QUEUE);
  return store.delete(id);
}

async function incrementRetryCount(db, id) {
  const transaction = db.transaction([STORES.QUEUE], 'readwrite');
  const store = transaction.objectStore(STORES.QUEUE);
  
  const item = await store.get(id);
  if (item) {
    item.retryCount++;
    if (item.retryCount > 5) {
      // Remove after 5 failed attempts
      await store.delete(id);
    } else {
      await store.put(item);
    }
  }
}

// Utility functions

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const cacheStats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    cacheStats[cacheName] = keys.length;
  }
  
  return {
    caches: cacheStats,
    timestamp: Date.now()
  };
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(cacheNames.map(name => caches.delete(name)));
}

function triggerBackgroundSync(tag) {
  if (self.registration && self.registration.sync) {
    self.registration.sync.register(tag)
      .then(() => console.log('Service Worker: Background sync registered:', tag))
      .catch(error => console.error('Service Worker: Background sync failed:', error));
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  console.log('Service Worker: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'data-refresh') {
    event.waitUntil(refreshCachedData());
  }
});

async function refreshCachedData() {
  console.log('Service Worker: Refreshing cached data');
  
  const endpoints = [
    '/api/kpi',
    '/api/performance',
    '/api/notifications'
  ];
  
  const cache = await caches.open(DATA_CACHE);
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        await cache.put(endpoint, response);
        console.log('Service Worker: Refreshed cache for:', endpoint);
      }
    } catch (error) {
      console.error('Service Worker: Failed to refresh cache for:', endpoint, error);
    }
  }
}

console.log('Service Worker: SDPO Dashboard v3.0.0 loaded');
