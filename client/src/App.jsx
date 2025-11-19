import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComicDetailPage from './pages/ComicDetailPage';
import ChapterPage from './pages/ChapterPage';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';
import ListPage from './pages/ListPage';
import RankingPage from './pages/RankingPage'; // Import mới

function App() {
  return (
    <Routes>
       <Route path="/" element={<HomePage />} />
       <Route path="/truyen-tranh/:slug" element={<ComicDetailPage />} />
       <Route path="/doc-truyen/:slug/:chapterName" element={<ChapterPage />} />
       <Route path="/tim-kiem" element={<SearchPage />} />
       <Route path="/the-loai/:slug" element={<CategoryPage />} />
       <Route path="/danh-sach" element={<ListPage />} />
       
       {/* Route Xếp Hạng */}
       <Route path="/xep-hang" element={<RankingPage />} />
    </Routes>
  );
}

export default App;