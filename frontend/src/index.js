import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n';

// Register service worker for PWA (prod only)
if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('[App] ServiceWorker registered:', registration);

          // 检查更新 - 每小时检查一次
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // 监听 Service Worker 状态变化
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('[App] New service worker found, installing...');

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('[App] New service worker activated');
              }
            });
          });
        })
        .catch((error) => {
          console.log('[App] ServiceWorker registration failed:', error);
        });

      // 监听来自 Service Worker 的消息
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log('[App] New version available:', event.data.version);
          // 触发自定义事件，通知应用有新版本
          window.dispatchEvent(new CustomEvent('swUpdated', {
            detail: { version: event.data.version }
          }));
        }
      });

      // 监听 Service Worker 控制器变化（表示新 SW 已接管）
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[App] Service Worker controller changed, reloading...');
        // 延迟刷新，给用户一点时间看到提示
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
