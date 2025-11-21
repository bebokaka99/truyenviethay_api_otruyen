import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { 
  RiArrowRightSLine, RiLayoutGridFill, RiFilter3Line, 
  RiCloseLine, RiLoader4Line, RiErrorWarningLine, 
  RiCheckLine, RiDeleteBinLine 
} from 'react-icons/ri';

const ListPage = () => {
  const navigate = useNavigate();

  // --- STATE DỮ LIỆU ---
  const [stories, setStories] = useState([]);
  const [fullCategories, setFullCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [domainAnh, setDomainAnh] = useState('');
  
  // --- STATE PHÂN TRANG ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- STATE BỘ LỌC ---
  const [showFilter, setShowFilter] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState({ status: 'all', sortBy: 'latest_update' });
  const [tempFilter, setTempFilter] = useState({ status: 'all', sortBy: 'latest_update' });

  // Lấy danh sách thể loại
  useEffect(() => {
    const fetchAllCats = async () => {
        try {
            const res = await axios.get('https://otruyenapi.com/v1/api/the-loai');
            setFullCategories(res.data.data.items);
        } catch (e) { console.error(e); }
    };
    fetchAllCats();
  }, []);

  // Gọi API lấy truyện
  const fetchStories = async (pageNum) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await axios.get(`https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${pageNum}`);
      const data = response.data.data;
      
      setDomainAnh(data.APP_DOMAIN_CDN_IMAGE);
      const newItems = data.items;
      
      if (pageNum === 1) {
          setStories(newItems);
      } else {
          setStories(prev => {
              const existingIds = new Set(prev.map(s => s._id));
              const filteredNew = newItems.filter(s => !existingIds.has(s._id));
              return [...prev, ...filteredNew];
          });
      }

      const totalPages = Math.ceil(data.params.pagination.totalItems / data.params.pagination.totalItemsPerPage);
      setHasMore(pageNum < totalPages);

    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Init Load
  useEffect(() => {
    fetchStories(1);
    window.scrollTo(0, 0);
  }, []);

  // Load More
  const handleLoadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStories(nextPage);
  };

  // --- XỬ LÝ NÚT LỌC ---
  const handleApplyFilter = () => {
      setAppliedFilter(tempFilter);
      // setShowFilter(false); // Tùy chọn: Đóng filter sau khi apply
  };

  const handleClearFilter = () => {
      const defaultState = { status: 'all', sortBy: 'latest_update' };
      setTempFilter(defaultState);
      setAppliedFilter(defaultState);
  };

  // --- LOGIC LỌC & SẮP XẾP (CLIENT-SIDE FIX) ---
  const filteredStories = useMemo(() => {
      let result = [...stories];

      // 1. Lọc theo trạng thái
      if (appliedFilter.status !== 'all') {
          result = result.filter(s => s.status === appliedFilter.status);
      }

      // Hàm helper lấy số chương CHÍNH XÁC (Hỗ trợ số thập phân)
      const getChapNum = (str) => {
          if (!str) return 0;
          // Regex tìm số (bao gồm cả dấu chấm động): ví dụ "Chapter 10.5" -> lấy "10.5"
          const match = str.toString().match(/(\d+(\.\d+)?)/);
          return match ? parseFloat(match[0]) : 0;
      };

      // 2. Sắp xếp
      switch (appliedFilter.sortBy) {
          case 'name_az': // Tên A-Z
              result.sort((a, b) => a.name.localeCompare(b.name));
              break;
          
          case 'most_chapters': // Nhiều chương nhất (Giảm dần)
              result.sort((a, b) => getChapNum(b.latest_chapter) - getChapNum(a.latest_chapter));
              break;
          
          case 'fewest_chapters': // Ít chương nhất (Tăng dần)
              result.sort((a, b) => getChapNum(a.latest_chapter) - getChapNum(b.latest_chapter));
              break;

          case 'latest_update': // Mới cập nhật (Mặc định)
          default:
              result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
              break;
      }

      return result;
  }, [stories, appliedFilter]);

  // Helpers Render
  const formatChapter = (truyen) => {
    const chapRaw = truyen.latest_chapter || (truyen.chaptersLatest && truyen.chaptersLatest[0]?.chapter_name) || 'Full';
    const chapNum = chapRaw.replace(/chapter/gi, '').replace(/chương/gi, '').trim();
    return isNaN(chapNum) && chapNum !== 'Full' ? `Chương ${chapNum}` : (chapNum === 'Full' ? 'Full' : `Chương ${chapNum}`);
  };

  const timeAgo = (dateString) => {
      if (!dateString) return '';
      const now = new Date();
      const date = new Date(dateString);
      const seconds = Math.floor((now - date) / 1000);
      if (seconds < 60) return 'Vừa xong';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} phút trước`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} giờ trước`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} ngày trước`;
      return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- HEADER & FILTER TOGGLE --- */}
        <div className="mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase mb-2">
                <Link to="/" className="hover:text-primary">Trang chủ</Link>
                <RiArrowRightSLine />
                <span>Danh sách</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 uppercase">
                        <RiLayoutGridFill className="text-primary" /> Kho Truyện
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Cập nhật liên tục hàng ngày
                    </p>
                </div>

                <button 
                    onClick={() => setShowFilter(!showFilter)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${showFilter ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-[#1a1a2e] border border-white/10 hover:bg-white/10'}`}
                >
                    {showFilter ? <RiCloseLine size={18} /> : <RiFilter3Line size={18} />}
                    {showFilter ? 'Đóng Bộ Lọc' : 'Bộ Lọc & Sắp Xếp'}
                </button>
            </div>
        </div>

        {/* --- FILTER PANEL --- */}
        {showFilter && (
            <div className="mb-8 bg-[#151525] p-6 rounded-2xl border border-white/5 shadow-xl animate-fade-in-down">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    
                    {/* 1. Trạng Thái */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-primary pl-2">Trạng Thái</h4>
                        <div className="flex flex-wrap gap-2">
                            {[{ id: 'all', label: 'Tất Cả' }, { id: 'ongoing', label: 'Đang Tiến Hành' }, { id: 'completed', label: 'Hoàn Thành' }].map(status => (
                                <button key={status.id} onClick={() => setTempFilter({...tempFilter, status: status.id})} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.status === status.id ? 'bg-primary border-primary text-white' : 'bg-[#1a1a2e] border-white/10 hover:border-white/30'}`}>{status.label}</button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Sắp Xếp */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-green-500 pl-2">Sắp Xếp</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'latest_update', label: 'Mới Cập Nhật' },
                                { id: 'most_chapters', label: 'Nhiều Chương' },
                                { id: 'fewest_chapters', label: 'Ít Chương' },
                                { id: 'name_az', label: 'Tên A-Z' }
                            ].map(sort => (
                                <button key={sort.id} onClick={() => setTempFilter({...tempFilter, sortBy: sort.id})} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.sortBy === sort.id ? 'bg-green-600 border-green-600 text-white' : 'bg-[#1a1a2e] border-white/10 hover:border-white/30'}`}>{sort.label}</button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Lọc Theo Thể Loại */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-purple-500 pl-2">Lọc Theo Thể Loại</h4>
                        <div className="relative">
                            <select onChange={(e) => navigate(`/the-loai/${e.target.value}`)} className="w-full bg-[#1a1a2e] border border-white/10 text-gray-300 text-sm rounded-lg p-2.5 focus:outline-none focus:border-primary cursor-pointer" defaultValue="">
                                <option value="" disabled>-- Chọn thể loại --</option>
                                {fullCategories.map(cat => (<option key={cat._id} value={cat.slug}>{cat.name}</option>))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                    <button onClick={handleClearFilter} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#252538] hover:bg-red-500/20 hover:text-red-500 text-gray-400 text-sm font-bold transition-colors"><RiDeleteBinLine /> Xóa Lọc</button>
                    <button onClick={handleApplyFilter} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-bold shadow-lg shadow-green-900/30 transition-all"><RiCheckLine /> Áp Dụng</button>
                </div>
            </div>
        )}

        {/* Loading */}
        {loading && (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm animate-pulse">Đang tải danh sách...</p>
            </div>
        )}

        {/* Empty */}
        {!loading && filteredStories.length === 0 && (
            <div className="py-20 text-center text-gray-500 bg-[#151525] rounded-xl border border-white/5 border-dashed">
                <RiErrorWarningLine className="text-5xl mx-auto mb-4 opacity-50" />
                <p>Không tìm thấy truyện nào phù hợp với bộ lọc hiện tại.</p>
                <button onClick={handleClearFilter} className="mt-4 text-primary hover:underline text-sm font-bold">Xóa bộ lọc</button>
            </div>
        )}

        {/* Grid Content */}
        {!loading && filteredStories.length > 0 && (
            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 animate-fade-in-up">
                    {filteredStories.map((truyen) => (
                        <Link key={truyen._id} to={`/truyen-tranh/${truyen.slug}`} className="flex flex-col gap-2 group cursor-pointer">
                            <div className="w-full aspect-[2/3] bg-[#1f1f3a] rounded-lg overflow-hidden relative border border-white/5 group-hover:border-green-500/50 transition-all shadow-sm">
                                <img 
                                    src={`${domainAnh}/uploads/comics/${truyen.thumb_url}`}
                                    alt={truyen.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                {/* Badge Group */}
                                <div className="absolute top-1.5 right-1.5 flex flex-row items-center gap-1">
                                    <span className="bg-red-600 text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md whitespace-nowrap">
                                       {timeAgo(truyen.updatedAt)}
                                    </span>
                                    <span className="bg-green-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md whitespace-nowrap">
                                       {formatChapter(truyen)}
                                    </span>
                                </div>
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

                {hasMore && (
                    <div className="mt-12 text-center">
                        <button onClick={handleLoadMore} disabled={loadingMore} className="group relative px-8 py-3 rounded-full bg-[#1a1a2e] border border-white/10 hover:bg-primary hover:text-white hover:border-primary text-gray-300 font-bold transition-all disabled:opacity-50 overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                {loadingMore && <RiLoader4Line className="animate-spin" />}
                                {loadingMore ? 'Đang tải thêm...' : 'Xem Thêm Truyện'}
                            </span>
                        </button>
                        <p className="text-xs text-gray-600 mt-3">Đang hiển thị {filteredStories.length} truyện</p>
                    </div>
                )}
            </>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default ListPage;