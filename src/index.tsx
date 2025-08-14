import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { store } from './store/store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      });
      
      console.log('Service Worker registered successfully:', registration.scope);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log('New Service Worker installing...');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Show update available notification
                if (window.confirm('New version available! Refresh to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              } else {
                console.log('Service Worker installed for the first time');
              }
            }
          });
        }
      });
      
      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        window.location.reload();
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

// Add PWA install prompt handling
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA install prompt available');
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Notify the PWA manager that install is available
  window.dispatchEvent(new CustomEvent('pwa-install-available', {
    detail: { prompt: deferredPrompt }
  }));
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
  
  // Notify the PWA manager that install completed
  window.dispatchEvent(new CustomEvent('pwa-installed'));
});

// Handle app shortcuts and protocol handlers
if ('launchQueue' in window) {
  (window as any).launchQueue.setConsumer((launchParams: any) => {
    console.log('App launched with:', launchParams);
    
    if (launchParams.files && launchParams.files.length) {
      // Handle file sharing
      window.dispatchEvent(new CustomEvent('pwa-files-shared', {
        detail: { files: launchParams.files }
      }));
    }
  });
}
