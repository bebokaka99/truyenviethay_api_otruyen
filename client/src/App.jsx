import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComicDetailPage from './pages/ComicDetailPage';
import ChapterPage from './pages/ChapterPage';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';
import ListPage from './pages/ListPage';
import RankingPage from './pages/RankingPage';
import LoginPage from './pages/LoginPage'; 
import RegisterPage from './pages/RegisterPage'; 
import LibraryPage from './pages/LibraryPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/admin/DashboardPage';
import AdminRoute from './components/auth/AdminRoute';   // Import bảo vệ route admin
function App() {
  return (
    <Routes>
       {/* ... các route cũ ... */}
       <Route path="/" element={<HomePage />} />
       <Route path="/truyen-tranh/:slug" element={<ComicDetailPage />} />
       <Route path="/doc-truyen/:slug/:chapterName" element={<ChapterPage />} />
       <Route path="/tim-kiem" element={<SearchPage />} />
       <Route path="/the-loai/:slug" element={<CategoryPage />} />
       <Route path="/danh-sach" element={<ListPage />} />
       <Route path="/xep-hang" element={<RankingPage />} />

       {/* Route Auth */}
       <Route path="/login" element={<LoginPage />} />
       <Route path="/register" element={<RegisterPage />} />
       <Route path="/theo-doi" element={<LibraryPage />} />
       <Route path="/lich-su" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* --- ADMIN ROUTES (Được bảo vệ) --- */}
       <Route element={<AdminRoute />}>
          <Route path="/admin" element={<DashboardPage />} />
       </Route>
    </Routes>
  );
}

export default App;