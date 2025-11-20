import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { RiSearchLine, RiEmotionUnhappyLine, RiLoader4Line } from 'react-icons/ri';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword'); 
  
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainAnh, setDomainAnh] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!keyword) return;

      setLoading(true);
      setStories([]);
      setError(null);

      try {
        console.log("Đang tìm kiếm:", keyword);
        // API Tìm kiếm của Otruyen
        const response = await axios.get(`https://otruyenapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
        
        // Kiểm tra cấu trúc dữ liệu trả về
        if (response.data && response.data.data) {
            const data = response.data.data;
            setDomainAnh(data.APP_DOMAIN_CDN_IMAGE);
            setStories(data.items);
        } else {
            // Trường hợp API trả về cấu trúc lạ hoặc lỗi
            setStories([]); 
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Lỗi API Tìm kiếm:", error);
        setError("Có lỗi xảy ra khi kết nối đến máy chủ.");
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword]); // Chạy lại khi từ khóa thay đổi

  // Helper format chương
  const formatChapter = (truyen) => {
    const chapRaw = truyen.latest_chapter || (truyen.chaptersLatest && truyen.chaptersLatest[0]?.chapter_name) || 'Full';
    const chapNum = chapRaw.replace(/chapter/gi, '').replace(/chương/gi, '').trim();
    return isNaN(chapNum) && chapNum !== 'Full' ? `Chương ${chapNum}` : (chapNum === 'Full' ? 'Full' : `Chương ${chapNum}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Kết quả */}
        <div className="mb-8 border-b border-white/10 pb-4">
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                <RiSearchLine className="text-primary" />
                Kết quả: <span className="text-primary">"{keyword}"</span>
            </h1>
            {!loading && !error && (
                <p className="text-sm text-gray-500 mt-2 font-bold">
                    Tìm thấy <span className="text-white">{stories.length}</span> bộ truyện
                </p>
            )}
        </div>

        {/* Loading State */}
        {loading && (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm animate-pulse">Đang lục lọi kho truyện...</p>
            </div>
        )}

        {/* Error State */}
        {error && (
             <div className="py-20 text-center text-red-400 bg-[#151525] rounded-xl border border-red-500/20">
                <p>{error}</p>
             </div>
        )}

        {/* Empty State (Không tìm thấy) */}
        {!loading && !error && stories.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-[#151525] rounded-xl border border-white/5 border-dashed">
                <RiEmotionUnhappyLine size={64} className="text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Không tìm thấy truyện nào</h3>
                <p className="text-sm text-gray-600 mt-2">Hãy thử từ khóa ngắn gọn hơn (ví dụ: "võ luyện", "one piece")</p>
            </div>
        )}

        {/* Result Grid (Đồng bộ giao diện với CategoryPage) */}
        {!loading && stories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 animate-fade-in-up">
                {stories.map((truyen) => (
                    <Link key={truyen._id} to={`/truyen-tranh/${truyen.slug}`} className="flex flex-col gap-2 group cursor-pointer">
                        <div className="w-full aspect-[2/3] bg-[#1f1f3a] rounded-lg overflow-hidden relative border border-white/5 group-hover:border-green-500/50 transition-all shadow-sm">
                            <img 
                                src={`${domainAnh}/uploads/comics/${truyen.thumb_url}`}
                                alt={truyen.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute top-1.5 right-1.5 bg-green-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                {formatChapter(truyen)}
                            </div>
                            
                            {/* Status Badge */}
                            <div className={`absolute bottom-0 left-0 right-0 text-[9px] text-center font-bold text-white py-0.5 ${truyen.status === 'ongoing' ? 'bg-black/60' : 'bg-blue-600/80'}`}>
                                {truyen.status === 'ongoing' ? 'ONGOING' : 'FULL'}
                            </div>
                        </div>
                        <h4 className="text-gray-200 text-xs md:text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5em]">
                            {truyen.name}
                        </h4>
                    </Link>
                ))}
            </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;