import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { 
    RiTrophyFill, RiStarFill, RiCalendarEventLine, 
    RiFireFill, RiTimeLine 
} from 'react-icons/ri';

const RankingPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  // Mặc định vào là All Time
  const [filterType, setFilterType] = useState('all'); 

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setStories([]); 
      try {
        // Gọi API Local
        const dbRes = await axios.get(`/api/rating/top?type=${filterType}`);
        const topList = dbRes.data; 

        if (topList.length === 0) {
            setStories([]);
            setLoading(false);
            return;
        }

        // Gọi API Otruyen lấy chi tiết
        const promises = topList.map(async (item) => {
            try {
                const detailRes = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${item.comic_slug}`);
                const comicData = detailRes.data.data.item;
                const domain = detailRes.data.data.APP_DOMAIN_CDN_IMAGE;
                return {
                    ...comicData,
                    thumb_url: `${domain}/uploads/comics/${comicData.thumb_url}`,
                    avg_score: item.avg_score,
                    total_votes: item.total_votes
                };
            } catch (e) { return null; }
        });

        const results = await Promise.all(promises);
        setStories(results.filter(s => s !== null));

      } catch (error) {
        console.error("Lỗi tải BXH:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [filterType]);

  const getRankBadge = (index) => {
      if (index === 0) return <div className="w-12 h-12 flex items-center justify-center bg-yellow-500/20 rounded-full border-2 border-yellow-500 text-yellow-500"><RiTrophyFill className="text-2xl" /></div>;
      if (index === 1) return <div className="w-10 h-10 flex items-center justify-center bg-gray-400/20 rounded-full border-2 border-gray-400 text-gray-300"><RiTrophyFill className="text-xl" /></div>;
      if (index === 2) return <div className="w-10 h-10 flex items-center justify-center bg-orange-600/20 rounded-full border-2 border-orange-600 text-orange-500"><RiTrophyFill className="text-xl" /></div>;
      return <span className="text-2xl font-black text-gray-600 w-10 text-center">#{index + 1}</span>;
  };

  return (
    <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-3">
                <RiTrophyFill className="text-yellow-500" /> Bảng Xếp Hạng
            </h1>
            <p className="text-sm text-gray-500 mt-2">Top truyện được cộng đồng đánh giá cao nhất</p>
        </div>

        {/* TABS LỌC THỜI GIAN (Sắp xếp lại thứ tự) */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
                { id: 'all', label: 'Mọi Thời Đại', icon: <RiTrophyFill /> },
                { id: 'daily', label: 'Top Ngày', icon: <RiFireFill /> },
                { id: 'weekly', label: 'Top Tuần', icon: <RiTimeLine /> },
                { id: 'monthly', label: 'Top Tháng', icon: <RiCalendarEventLine /> },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${
                        filterType === tab.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                        : 'bg-[#1f1f3a] text-gray-400 hover:text-white border border-white/5'
                    }`}
                >
                    {tab.icon} <span>{tab.label}</span>
                </button>
            ))}
        </div>

        {/* DANH SÁCH */}
        {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm animate-pulse">Đang tổng hợp dữ liệu...</p>
            </div>
        ) : (
            <div className="flex flex-col gap-4">
                {stories.length > 0 ? stories.map((truyen, index) => (
                    <Link key={truyen._id} to={`/truyen-tranh/${truyen.slug}`} className="flex items-center gap-4 p-4 bg-[#151525] rounded-2xl border border-white/5 hover:border-primary/50 hover:bg-[#1a1a2e] transition-all group shadow-lg">
                        
                        <div className="flex-shrink-0 w-12 flex justify-center">
                            {getRankBadge(index)}
                        </div>

                        <div className="w-16 h-24 sm:w-20 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden shadow-md relative">
                            <img src={truyen.thumb_url} alt={truyen.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white group-hover:text-primary transition-colors text-base sm:text-lg truncate">
                                {truyen.name}
                            </h3>
                            <p className="text-xs text-gray-500 truncate mt-1 mb-2">
                                {truyen.author || 'Đang cập nhật'}
                            </p>
                            
                            <div className="inline-flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                                <RiStarFill className="text-yellow-500" />
                                <span className="font-black text-white text-sm">{parseFloat(truyen.avg_score).toFixed(1)}</span>
                                <span className="text-gray-500 text-xs border-l border-white/10 pl-2 ml-1">{truyen.total_votes} lượt vote</span>
                            </div>
                        </div>

                    </Link>
                )) : (
                    <div className="text-center py-20 bg-[#151525] rounded-2xl border border-white/5 border-dashed">
                        <p className="text-gray-500 italic">Chưa có dữ liệu đánh giá cho mốc thời gian này.</p>
                        <p className="text-xs text-gray-600 mt-2">Hãy là người đầu tiên đánh giá các bộ truyện bạn yêu thích!</p>
                    </div>
                )}
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RankingPage;