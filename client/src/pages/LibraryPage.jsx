import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/common/ConfirmModal';
import { 
  RiHeart3Fill, RiDeleteBinLine, 
  RiEmotionUnhappyLine 
} from 'react-icons/ri';

const LibraryPage = () => {
  const { user } = useAuth();
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal Xóa
  const [deleteTarget, setDeleteTarget] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user) return; 

      try {
        const token = localStorage.getItem('user_token');
        const response = await axios.get('/api/user/library', {
           headers: { Authorization: `Bearer ${token}` }
        });
        setComics(response.data);
      } catch (error) {
        console.error("Lỗi tải thư viện:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [user]);

  // Hàm mở Modal (Thay vì confirm alert)
  const openDeleteModal = (e, comic) => {
      e.preventDefault(); 
      setDeleteTarget(comic); 
  };

  // Hàm thực thi xóa thật sự (Gắn vào nút Đồng Ý của Modal)
  const confirmDelete = async () => {
      if (!deleteTarget) return;
      setIsDeleting(true);

      try {
          const token = localStorage.getItem('user_token');
          await axios.delete(`/api/user/library/${deleteTarget.comic_slug}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          // Cập nhật UI
          setComics(prev => prev.filter(c => c.comic_slug !== deleteTarget.comic_slug));
          setDeleteTarget(null); // Đóng modal
      } catch (error) {
          alert('Lỗi khi xóa!');
      } finally {
          setIsDeleting(false);
      }
  };

  const formatChapter = (chap) => {
      if (!chap) return 'Mới';
      return String(chap).toLowerCase().includes('chương') || String(chap).toLowerCase().includes('chapter') 
        ? chap 
        : `Chương ${chap}`;
  };

  if (!user) {
      return (
          <div className="min-h-screen bg-[#101022] font-display text-white flex flex-col">
              <Header />
              <div className="flex-grow flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 bg-[#1f1f3a] rounded-full flex items-center justify-center">
                      <RiHeart3Fill className="text-gray-600 text-4xl" />
                  </div>
                  <p className="text-gray-400">Vui lòng đăng nhập để xem tủ truyện.</p>
                  <Link to="/login" className="px-8 py-3 bg-primary hover:bg-blue-600 rounded-full font-bold transition-colors shadow-lg">
                      Đăng Nhập Ngay
                  </Link>
              </div>
              <Footer />
          </div>
      )
  }

  return (
    <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 flex flex-col">
      <Header />
      
      {/* Gắn Component Modal */}
      <ConfirmModal 
         isOpen={!!deleteTarget}
         onClose={() => setDeleteTarget(null)}
         onConfirm={confirmDelete}
         title="Bỏ Theo Dõi?"
         message={`Bạn có chắc muốn xóa truyện "${deleteTarget?.comic_name}" khỏi tủ truyện không?`}
         isLoading={isDeleting}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-red-900/30">
                    <RiHeart3Fill size={28} />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide">
                        Tủ Truyện
                    </h1>
                    <p className="text-sm text-gray-500">
                        Đang theo dõi <span className="text-white font-bold">{comics.length}</span> bộ truyện
                    </p>
                </div>
            </div>
        </div>

        {/* Loading */}
        {loading && (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-red-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 animate-pulse text-sm font-bold">Đang tải kho báu...</p>
            </div>
        )}

        {/* Empty State */}
        {!loading && comics.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-[#151525] rounded-2xl border border-white/5 border-dashed">
                <RiEmotionUnhappyLine size={64} className="text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Tủ truyện đang trống!</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Hãy bấm nút "Theo dõi" ở trang chi tiết truyện để lưu vào đây nhé.</p>
                <Link to="/danh-sach" className="px-8 py-3 bg-[#252538] hover:bg-white/10 border border-white/10 rounded-full text-white font-bold transition-all hover:-translate-y-1">
                    Khám Phá Truyện Mới
                </Link>
            </div>
        )}

        {/* Grid Content */}
        {!loading && comics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 animate-fade-in-up">
                {comics.map((item) => (
                    <div key={item.id} className="group relative">
                        {/* Link Truyện */}
                        <Link to={`/truyen-tranh/${item.comic_slug}`} className="flex flex-col gap-2 cursor-pointer">
                            <div className="w-full aspect-[2/3] bg-[#1f1f3a] rounded-xl overflow-hidden relative border border-white/5 group-hover:border-red-500/50 transition-all shadow-md group-hover:shadow-red-900/20">
                                <img 
                                    src={item.comic_image}
                                    alt={item.comic_name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                
                                <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                    {formatChapter(item.latest_chapter)}
                                </div>
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            
                            <h4 className="text-gray-300 text-xs md:text-sm font-bold leading-snug line-clamp-2 group-hover:text-red-500 transition-colors min-h-[2.5em]">
                                {item.comic_name}
                            </h4>
                        </Link>

                        {/* Nút Xóa (Gọi hàm openDeleteModal) */}
                        <button 
                            onClick={(e) => openDeleteModal(e, item)}
                            className="absolute top-1 left-1 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 text-gray-300 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg z-10 scale-90 group-hover:scale-100"
                            title="Bỏ theo dõi"
                        >
                            <RiDeleteBinLine size={14} />
                        </button>
                    </div>
                ))}
            </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default LibraryPage;