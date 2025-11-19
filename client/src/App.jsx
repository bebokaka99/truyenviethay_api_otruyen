import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComicDetailPage from './pages/ComicDetailPage';
import ChapterPage from './pages/ChapterPage'; // Import file sắp tạo

function App() {
  return (
    <Routes>
       <Route path="/" element={<HomePage />} />
       <Route path="/truyen-tranh/:slug" element={<ComicDetailPage />} />
       
       {/* Route Đọc Truyện: cần slug và tên chương */}
       <Route path="/doc-truyen/:slug/:chapterName" element={<ChapterPage />} />
    </Routes>
  );
}

export default App;