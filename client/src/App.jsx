// Thay thế file client/src/App.jsx bằng code dưới đây

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { AuthProvider } from './contexts/AuthContext';
import AdminRoute from './components/auth/AdminRoute'; 

// --- PAGES ---
import HomePage from './pages/HomePage';
import ComicDetailPage from './pages/ComicDetailPage';
import ChapterPage from './pages/ChapterPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import LibraryPage from './pages/LibraryPage';
import RankingPage from './pages/RankingPage';
import ListPage from './pages/ListPage';
import SearchPage from './pages/SearchPage'; 
import NotFoundPage from './pages/NotFoundPage'; 
import AboutPage from './pages/AboutPage'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// --- ADMIN PAGES ---
import DashboardPage from './pages/admin/DashboardPage';


function App() {
  return (
    <AuthProvider>
      {/* Cấu hình Toast Notification Global */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'dark-toast',
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid #33334d',
            borderRadius: '8px'
          },
        }}
      />
      
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/gioi-thieu" element={<AboutPage />} /> 
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/truyen-tranh/:slug" element={<ComicDetailPage />} />
        <Route path="/doc-truyen/:slug/:chapterName" element={<ChapterPage />} />
        
        <Route path="/the-loai/:slug" element={<ListPage />} />
        <Route path="/danh-sach" element={<ListPage />} />
        <Route path="/tim-kiem" element={<SearchPage />} />
        <Route path="/xep-hang" element={<RankingPage />} />
        
        {/* --- AUTHENTICATED ROUTES (Không cần ProtectedRoute vì logic đã được handle bên trong từng Page) --- */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/lich-su" element={<HistoryPage />} />
        <Route path="/theo-doi" element={<LibraryPage />} />

        {/* --- ADMIN ROUTES (Protected by Role) --- */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<DashboardPage />} />
        </Route>

        {/* --- 404 NOT FOUND (ĐẶT Ở CUỐI CÙNG) --- */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;