import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext' 
import './index.css'
import axios from 'axios'; // ⬅️ THÊM DÒNG NÀY

// --- CẤU HÌNH BASE URL CHO AXIOS (QUAN TRỌNG CHO MÔI TRƯỜNG DEPLOY) ---
// Giá trị này được lấy từ biến môi trường VITE_API_URL bạn đã thiết lập
// (ví dụ: https://truyenviethay-backend.onrender.com/api)
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Tùy chọn: Thêm một URL dự phòng cho môi trường phát triển cục bộ
// if (!axios.defaults.baseURL) {
//     axios.defaults.baseURL = 'http://localhost:5000/api';
// }
// -------------------------------------------------------------------


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)