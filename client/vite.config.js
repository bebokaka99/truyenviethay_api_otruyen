import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Tự động cập nhật khi có bản mới
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      
      // --- CẤU HÌNH GIAO DIỆN APP (MANIFEST) ---
      manifest: {
        name: 'TruyenVietHay',
        short_name: 'TruyenVietHay',
        description: 'Đọc truyện tranh online chất lượng cao',
        theme_color: '#101022', // Màu thanh status bar (trùng màu nền web)
        background_color: '#101022',
        display: 'standalone', // Ẩn thanh địa chỉ trình duyệt
        orientation: 'portrait', // Khóa chiều dọc (tùy chọn)
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },

      // --- CẤU HÌNH CACHE OFFLINE (WORKBOX) ---
      workbox: {
        // Cache các file ảnh từ Otruyen và Cloudinary để đọc nhanh hơn
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/img\.otruyenapi\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'comic-images-cache',
              expiration: {
                maxEntries: 500, // Lưu tối đa 500 ảnh
                maxAgeSeconds: 60 * 60 * 24 * 7 // Lưu trong 7 ngày
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'avatar-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 ngày
              }
            }
          },
          {
            // Cache API gọi truyện (để lỡ mất mạng vẫn xem được list cũ)
            urlPattern: /^https:\/\/otruyenapi\.com\/v1\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-data-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // Cache API trong 5 phút
              }
            }
          }
        ],
        // Tăng giới hạn file cache (mặc định 2MB) để tránh lỗi build
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
      },
      
      devOptions: {
        enabled: true // Bật PWA ngay cả ở localhost để test
      }
    })
  ],
  
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://truyenviethay-backend.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
    allowedHosts: ['truyenviethay.vn', 'localhost', '192.168.1.154'],
  },
});