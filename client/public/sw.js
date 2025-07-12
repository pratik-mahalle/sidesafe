const CACHE_NAME = 'raksha-sahayak-v1';
const urlsToCache = [
  '/',
  '/tracking',
  '/reports',
  '/profile',
  '/authority',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page or cached content
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients to activate immediately
  self.clients.claim();
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Push notifications
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'View Details',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-192x192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    event.notification.close();
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync offline data function
async function syncOfflineData() {
  try {
    const offlineData = await getOfflineData();
    
    if (offlineData.incidents.length > 0) {
      for (const incident of offlineData.incidents) {
        try {
          await fetch('/api/incidents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(incident)
          });
        } catch (error) {
          console.error('Failed to sync incident:', error);
        }
      }
    }

    if (offlineData.statusUpdates.length > 0) {
      for (const update of offlineData.statusUpdates) {
        try {
          await fetch(`/api/users/${update.userId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: update.status })
          });
        } catch (error) {
          console.error('Failed to sync status update:', error);
        }
      }
    }

    // Clear offline data after successful sync
    await clearOfflineData();
    console.log('Offline data synced successfully');
  } catch (error) {
    console.error('Error syncing offline data:', error);
  }
}

// Helper functions for offline data management
async function getOfflineData() {
  return new Promise((resolve) => {
    const data = localStorage.getItem('offlineData');
    if (data) {
      resolve(JSON.parse(data));
    } else {
      resolve({
        incidents: [],
        statusUpdates: [],
        emergencyAlerts: []
      });
    }
  });
}

async function clearOfflineData() {
  return new Promise((resolve) => {
    localStorage.removeItem('offlineData');
    resolve();
  });
}

// Message handling for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
