import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { 
  RiTrophyFill, RiCalendarCheckFill, RiFireFill, RiTimeLine,
  RiArrowUpSFill, RiArrowRightSLine, RiEyeFill
} from 'react-icons/ri';

const RankingPage = () => {
  const [activeTab, setActiveTab] = useState('daily'); // daily | weekly | monthly
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainAnh, setDomainAnh] = useState('');

  // Định nghĩa các Tab và API tương ứng (Giả lập)
  const tabs = [
    { id: 'daily', name: 'Top Ngày', icon: <RiTimeLine />, api: 'https://otruyenapi.com/v1/api/danh-sach/truyen-moi' },
    { id: 'weekly', name: 'Top Tuần', icon: <RiFireFill />, api: 'https://otruyenapi.com/v1/api/danh-sach/dang-phat-hanh' },
    { id: 'monthly', name: 'Top Tháng', icon: <RiTrophyFill />, api: 'https://otruyenapi.com/v1/api/danh-sach/hoan-thanh' },
  ];

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setStories([]);
      try {
        // Tìm API URL dựa trên tab đang chọn
        const currentTab = tabs.find(t => t.id === activeTab);
        
        // Gọi 2 trang để lấy khoảng 48 truyện cho danh sách dài
        const [res1, res2] = await Promise.all([
            axios.get(`${currentTab.api}?page=1`),
            axios.get(`${currentTab.api}?page=2`)
        ]);

        const data1 = res1.data.data;
        const data2 = res2.data.data;
        
        setDomainAnh(data1.APP_DOMAIN_CDN_IMAGE);
        
        // Gộp dữ liệu
        const allItems = [...data1.items, ...data2.items];
        setStories(allItems);
        setLoading(false);

      } catch (error) {
        console.error("Lỗi tải bảng xếp hạng:", error);
        setLoading(false);
      }
    };

    fetchRanking();
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Helper render badge top
  const getRankBadge = (index) => {
      if (index === 0) return <RiTrophyFill className="text-yellow-400 text-3xl" />; // Top 1 Vàng
      if (index === 1) return <RiTrophyFill className="text-gray-300 text-2xl" />;   // Top 2 Bạc
      if (index === 2) return <RiTrophyFill className="text-orange-400 text-xl" />;  // Top 3 Đồng
      return <span className="text-lg font-bold text-gray-600">#{index + 1}</span>;
  };

  const formatChapter = (truyen) => {
    const chapRaw = truyen.latest_chapter || (truyen.chaptersLatest && truyen.chaptersLatest[0]?.chapter_name) || 'Full';
    return `Chương ${chapRaw.replace(/\D/g, '')}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- HEADER RANKING --- */}
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider mb-2">
                <span className="text-primary">Bảng</span> Xếp Hạng
            </h1>
            <p className="text-sm text-gray-500">Truyện được đọc nhiều nhất trong thời gian qua</p>
        </div>

        {/* --- TABS SWITCHER --- */}
        <div className="flex justify-center mb-10">
            <div className="bg-[#1a1a2e] p-1.5 rounded-full border border-white/10 flex gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                            activeTab === tab.id 
                            ? 'bg-primary text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.icon} {tab.name}
                    </button>
                ))}
            </div>
        </div>

        {/* --- LOADING --- */}
        {loading && (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        )}

        {/* --- RANKING CONTENT --- */}
        {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: TOP 3 (Nổi bật) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {stories.slice(0, 3).map((truyen, index) => (
                        <Link 
                            key={truyen._id} 
                            to={`/truyen-tranh/${truyen.slug}`}
                            className="relative flex items-center gap-4 p-4 rounded-xl bg-[#1f1f3a] border border-white/5 hover:border-primary/50 transition-all group overflow-hidden"
                        >
                            {/* Rank Number Background Effect */}
                            <div className="absolute -right-4 -bottom-6 text-[100px] font-black text-white/5 select-none group-hover:text-primary/10 transition-colors z-0">
                                {index + 1}
                            </div>

                            {/* Image */}
                            <div className="w-24 h-32 md:w-28 md:h-36 flex-shrink-0 rounded-lg overflow-hidden shadow-lg border border-white/10 relative z-10">
                                <img 
                                    src={`${domainAnh}/uploads/comics/${truyen.thumb_url}`} 
                                    alt={truyen.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {index === 0 && <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-br">TOP 1</div>}
                            </div>

                            {/* Info */}
                            <div className="flex-1 z-10">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        {getRankBadge(index)}
                                        <span className="text-xs font-bold text-green-500 flex items-center gap-0.5">
                                            <RiArrowUpSFill /> Top Thịnh Hành
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                    {truyen.name}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2 mt-1 mb-2">
                                    Thể loại: {truyen.category.map(c => c.name).join(', ')}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><RiEyeFill /> N/A Views</span>
                                    <span className="px-2 py-0.5 bg-white/5 rounded text-gray-300 border border-white/5">
                                        {formatChapter(truyen)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* RIGHT COLUMN: RANK 4-10+ (Danh sách gọn) */}
                <div className="bg-[#151525] rounded-xl border border-white/5 p-4 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3 uppercase">
                        Xếp Hạng Tiếp Theo
                    </h3>
                    <div className="flex flex-col gap-1 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {stories.slice(3).map((truyen, index) => (
                            <Link 
                                key={truyen._id} 
                                to={`/truyen-tranh/${truyen.slug}`}
                                className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors group"
                            >
                                {/* Rank Number Small */}
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0 ${index + 4 <= 10 ? 'bg-[#252538] text-white' : 'text-gray-600'}`}>
                                    {index + 4}
                                </div>

                                {/* Image Small */}
                                <div className="w-10 h-14 rounded overflow-hidden border border-white/10 flex-shrink-0">
                                    <img 
                                        src={`${domainAnh}/uploads/comics/${truyen.thumb_url}`} 
                                        alt={truyen.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-300 truncate group-hover:text-primary transition-colors">
                                        {truyen.name}
                                    </h4>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-gray-500">
                                            {formatChapter(truyen)}
                                        </span>
                                        <span className="text-[10px] text-green-500 flex items-center">
                                            <RiEyeFill className="mr-1"/> N/A
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default RankingPage;