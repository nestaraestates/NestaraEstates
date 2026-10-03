self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(e) {
  if (!e.data) return;

  try {
    const payload = e.data.json();
    
    const notificationConfig = {
      body: payload.body || 'You have a new update.',
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/logo.png',
      data: { url: payload.url || '/' }
    };

    e.waitUntil(
      self.registration.showNotification(payload.title || 'NestaraOS', notificationConfig)
    );
  } catch (error) {
    console.error('Failed to parse push payload:', error);
  }
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  
  const targetUrl = e.notification.data && e.notification.data.url;
  if (targetUrl) {
    e.waitUntil(clients.openWindow(targetUrl));
  }
});
