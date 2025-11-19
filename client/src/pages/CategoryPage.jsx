import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { 
  RiArrowRightSLine, RiErrorWarningLine, RiFilter3Line, 
  RiCloseLine, RiCheckLine, RiLoader4Line 
} from 'react-icons/ri';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // --- STATE DỮ LIỆU ---
  const [stories, setStories] = useState([]);
  const [fullCategories, setFullCategories] = useState([]); // Danh sách tất cả thể loại để lọc
  const [categoryInfo, setCategoryInfo] = useState({ name: '', total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [domainAnh, setDomainAnh] = useState('');
  
  // --- STATE PHÂN TRANG ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- STATE BỘ LỌC ---
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all | ongoing | completed
  const [sortBy, setSortBy] = useState('default'); // default | name | new_update

  // 1. Lấy danh sách tất cả thể loại (để hiển thị trong bộ lọc)
  useEffect(() => {
    const fetchAllCats = async () => {
        try {
            const res = await axios.get('https://otruyenapi.com/v1/api/the-loai');
            setFullCategories(res.data.data.items);
        } catch (e) { console.error(e); }
    };
    fetchAllCats();
  }, []);

  // 2. Hàm gọi dữ liệu truyện (Hỗ trợ phân trang)
  const fetchStories = async (pageNum, isNewSlug = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await axios.get(`https://otruyenapi.com/v1/api/the-loai/${slug}?page=${pageNum}`);
      const data = response.data.data;
      
      setCategoryInfo({ 
          name: data.titlePage, 
          total: data.params.pagination.totalItems 
      });
      setDomainAnh(data.APP_DOMAIN_CDN_IMAGE);

      const newItems = data.items;
      
      if (isNewSlug) {
          setStories(newItems);
      } else {
          // Lọc trùng lặp khi load more (đề phòng API trả trùng)
          setStories(prev => {
              const existingIds = new Set(prev.map(s => s._id));
              const filteredNew = newItems.filter(s => !existingIds.has(s._id));
              return [...prev, ...filteredNew];
          });
      }

      // Kiểm tra xem còn trang sau không
      const totalPages = Math.ceil(data.params.pagination.totalItems / data.params.pagination.totalItemsPerPage);
      setHasMore(pageNum < totalPages);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reset khi đổi thể loại (slug thay đổi)
  useEffect(() => {
    setPage(1);
    setStories([]);
    setFilterStatus('all');
    setSortBy('default');
    setShowFilter(false);
    fetchStories(1, true);
    window.scrollTo(0, 0);
  }, [slug]);

  // Xử lý Load More
  const handleLoadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStories(nextPage);
  };

  // --- LOGIC LỌC & SẮP XẾP CLIENT-SIDE ---
  // Do API không hỗ trợ query params filter, ta lọc trên danh sách đã tải
  const filteredStories = useMemo(() => {
      let result = [...stories];

      // 1. Lọc theo trạng thái
      if (filterStatus !== 'all') {
          result = result.filter(s => s.status === filterStatus);
      }

      // 2. Sắp xếp
      if (sortBy === 'name') {
          result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'new_update') {
          // API mặc định thường đã là mới cập nhật, nhưng ta sort lại cho chắc nếu cần
          result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      }

      return result;
  }, [stories, filterStatus, sortBy]);

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
        
        {/* --- HEADER & FILTER TOGGLE --- */}
        <div className="mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase mb-2">
                <Link to="/" className="hover:text-primary">Trang chủ</Link>
                <RiArrowRightSLine />
                <span>Thể loại</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 uppercase">
                        <span className="text-primary">#</span> {categoryInfo.name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Khoảng {categoryInfo.total} truyện
                    </p>
                </div>

                {/* Nút Mở Bộ Lọc */}
                <button 
                    onClick={() => setShowFilter(!showFilter)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${showFilter ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-[#1a1a2e] border border-white/10 hover:bg-white/10'}`}
                >
                    {showFilter ? <RiCloseLine size={18} /> : <RiFilter3Line size={18} />}
                    {showFilter ? 'Đóng Bộ Lọc' : 'Bộ Lọc & Sắp Xếp'}
                </button>
            </div>
        </div>

        {/* --- FILTER PANEL (EXPANDABLE) --- */}
        {showFilter && (
            <div className="mb-8 bg-[#151525] p-6 rounded-2xl border border-white/5 shadow-xl animate-fade-in-down">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* 1. Trạng Thái */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-primary pl-2">Trạng Thái</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'all', label: 'Tất Cả' },
                                { id: 'ongoing', label: 'Đang Tiến Hành' },
                                { id: 'completed', label: 'Hoàn Thành' }
                            ].map(status => (
                                <button
                                    key={status.id}
                                    onClick={() => setFilterStatus(status.id)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterStatus === status.id ? 'bg-primary border-primary text-white' : 'bg-[#1a1a2e] border-white/10 hover:border-white/30'}`}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Sắp Xếp */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-green-500 pl-2">Sắp Xếp</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'default', label: 'Mặc Định' },
                                { id: 'new_update', label: 'Mới Cập Nhật' },
                                { id: 'name', label: 'Tên A-Z' }
                            ].map(sort => (
                                <button
                                    key={sort.id}
                                    onClick={() => setSortBy(sort.id)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${sortBy === sort.id ? 'bg-green-600 border-green-600 text-white' : 'bg-[#1a1a2e] border-white/10 hover:border-white/30'}`}
                                >
                                    {sort.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Chuyển Nhanh Thể Loại */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-purple-500 pl-2">Chuyển Thể Loại</h4>
                        <div className="relative">
                            <select 
                                onChange={(e) => navigate(`/the-loai/${e.target.value}`)}
                                value={slug}
                                className="w-full bg-[#1a1a2e] border border-white/10 text-gray-300 text-sm rounded-lg p-2.5 focus:outline-none focus:border-primary"
                            >
                                {fullCategories.map(cat => (
                                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- LOADING INITIAL --- */}
        {loading && (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm animate-pulse">Đang tải kho truyện...</p>
            </div>
        )}

        {/* --- EMPTY STATE --- */}
        {!loading && filteredStories.length === 0 && (
            <div className="py-20 text-center text-gray-500 bg-[#151525] rounded-xl border border-white/5 border-dashed">
                <RiErrorWarningLine className="text-5xl mx-auto mb-4 opacity-50" />
                <p>Không tìm thấy truyện nào phù hợp với bộ lọc.</p>
                <button onClick={() => {setFilterStatus('all'); setSortBy('default');}} className="mt-4 text-primary hover:underline text-sm font-bold">
                    Xóa bộ lọc
                </button>
            </div>
        )}

        {/* --- GRID TRUYỆN --- */}
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
                                <div className="absolute top-1.5 right-1.5 bg-green-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    {formatChapter(truyen)}
                                </div>
                                
                                {/* Status Badge on Grid (Optional but useful for filter check) */}
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

                {/* --- LOAD MORE BUTTON --- */}
                {hasMore && (
                    <div className="mt-12 text-center">
                        <button 
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="group relative px-8 py-3 rounded-full bg-[#1a1a2e] border border-white/10 hover:bg-primary hover:text-white hover:border-primary text-gray-300 font-bold transition-all disabled:opacity-50 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loadingMore && <RiLoader4Line className="animate-spin" />}
                                {loadingMore ? 'Đang tải thêm...' : 'Xem Thêm Truyện'}
                            </span>
                        </button>
                        <p className="text-xs text-gray-600 mt-3">
                            Đang hiển thị {filteredStories.length} truyện
                        </p>
                    </div>
                )}
            </>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;