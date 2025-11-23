import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { useAuth } from '../contexts/AuthContext';
import { 
  RiHistoryLine, RiLoader4Line, RiEmotionUnhappyLine, 
  RiPlayCircleLine, RiTimeLine 
} from 'react-icons/ri';

const HistoryPage = () => {
  const { user } = useAuth();
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('user_token');
        // Gọi API lấy toàn bộ lịch sử (có thể chứa nhiều dòng cho cùng 1 truyện)
        const response = await axios.get('/api/user/history', {
           headers: { Authorization: `Bearer ${token}` }
        });

        const rawData = response.data;

        // --- 🛠️ LOGIC LỌC TRÙNG LẶP ---
        // Chỉ giữ lại record có thời gian đọc (read_at) mới nhất cho mỗi comic_slug
        const uniqueHistoryMap = rawData.reduce((acc, item) => {
            const existingItem = acc[item.comic_slug];
            
            // Nếu chưa có truyện này trong map, HOẶC item hiện tại mới hơn item đã lưu
            if (!existingItem || new Date(item.read_at) > new Date(existingItem.read_at)) {
                acc[item.comic_slug] = item;
            }
            return acc;
        }, {});

        // Chuyển đổi Object thành Array và sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
        const uniqueHistoryArray = Object.values(uniqueHistoryMap).sort((a, b) => 
            new Date(b.read_at) - new Date(a.read_at)
        );

        setComics(uniqueHistoryArray);
        // --- ✅ KẾT THÚC LOGIC LỌC ---

      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (!user) {
      return (
          <div className="min-h-screen bg-[#101022] font-display text-white flex flex-col">
              <Header />
              <div className="flex-grow flex flex-col items-center justify-center gap-4">
                  <p>Vui lòng đăng nhập để xem lịch sử đọc.</p>
                  <Link to="/login" className="px-6 py-2 bg-primary rounded-full font-bold">Đăng Nhập</Link>
              </div>
              <Footer />
          </div>
      )
  }

  return (
    <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <RiHistoryLine size={24} />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase">
                    Lịch Sử Đọc
                </h1>
                <p className="text-sm text-gray-500">
                    Bạn đang theo dõi <span className="text-white font-bold">{comics.length}</span> truyện
                </p>
            </div>
        </div>

        {/* Loading */}
        {loading && (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 animate-pulse">Đang tải ký ức...</p>
            </div>
        )}

        {/* Empty State */}
        {!loading && comics.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-[#151525] rounded-xl border border-white/5 border-dashed">
                <RiEmotionUnhappyLine size={64} className="text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Chưa có lịch sử đọc</h3>
                <p className="text-sm text-gray-600 mt-2 mb-6">Hãy bắt đầu đọc một bộ truyện nào đó nhé.</p>
                <Link to="/" className="px-6 py-2 bg-[#252538] hover:bg-white/10 border border-white/10 rounded-full text-white font-bold transition-all">
                    Về Trang Chủ
                </Link>
            </div>
        )}

        {/* Grid Content */}
        {!loading && comics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 animate-fade-in-up">
                {comics.map((item) => (
                    <div key={item.id} className="relative group">
                        {/* Link bao quanh để click vào ảnh về trang chi tiết */}
                        <Link to={`/truyen-tranh/${item.comic_slug}`} className="flex flex-col gap-2 cursor-pointer">
                            <div className="w-full aspect-[2/3] bg-[#1f1f3a] rounded-lg overflow-hidden relative border border-white/5 group-hover:border-blue-500/50 transition-all shadow-sm">
                                <img 
                                    src={item.comic_image}
                                    alt={item.comic_name}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    loading="lazy"
                                />
                                
                                {/* Nút Play Overlay -> Vào thẳng chương đang đọc */}
                                <Link 
                                    to={`/doc-truyen/${item.comic_slug}/${item.chapter_name}`}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    onClick={(e) => e.stopPropagation()} // Ngăn chặn click lan truyền lên thẻ cha
                                >
                                    <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform">
                                        <RiPlayCircleLine size={24} />
                                    </div>
                                </Link>

                                {/* Info Badge Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm py-1.5 px-2 border-t border-white/5">
                                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <RiTimeLine size={10} /> 
                                            {new Date(item.read_at).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className="text-blue-400 font-bold truncate max-w-[60px]">
                                            Chap {item.chapter_name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <h4 className="text-gray-200 text-xs md:text-sm font-bold leading-snug line-clamp-2 group-hover:text-blue-500 transition-colors min-h-[2.5em]">
                                {item.comic_name}
                            </h4>
                        </Link>
                    </div>
                ))}
            </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default HistoryPage;