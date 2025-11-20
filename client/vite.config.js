import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // cho phép truy cập từ IP LAN
    port: 5173, // port dev server
    proxy: {
      // tất cả request /api sẽ được chuyển tiếp tới backend
      '/api': {
        target: 'http://192.168.1.154:5000', // IP LAN của PC
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
