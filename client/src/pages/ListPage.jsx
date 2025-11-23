import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { 
  RiArrowRightSLine, RiLayoutGridFill, RiFilter3Line, 
  RiCloseLine, RiLoader4Line, RiErrorWarningLine, 
  RiCheckLine, RiDeleteBinLine, RiTimeLine, RiBookOpenLine
} from 'react-icons/ri';

const ListPage = () => {
  const { slug } = useParams(); // Lấy slug nếu đang ở route /the-loai/:slug
  const navigate = useNavigate();
  const location = useLocation();

  // --- CONFIG API ---
  // Otruyen cung cấp các endpoint danh sách riêng biệt
  const API_ENDPOINTS = {
      NEW: 'truyen-moi',
      ONGOING: 'dang-phat-hanh',
      COMPLETED: 'hoan-thanh',
      UPCOMING: 'sap-ra-mat'
  };

  // --- STATE ---
  const [stories, setStories] = useState([]);
  const [fullCategories, setFullCategories] = useState([]); 
  const [pageTitle, setPageTitle] = useState('Kho Truyện');
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [domainAnh, setDomainAnh] = useState('');
  
  // Phân trang
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Bộ lọc
  const [showFilter, setShowFilter] = useState(false);
  
  // Mặc định: Nếu có slug (trang thể loại) thì status là all, nếu trang danh sách thì mặc định là truyen-moi
  const [filter, setFilter] = useState({
      status: 'NEW', // NEW | ONGOING | COMPLETED | UPCOMING
      category: slug || '', // Nếu có slug từ URL thì set vào đây
      sort: 'default' 
  });

  // --- 1. INIT LOAD (Lấy danh sách thể loại để hiển thị dropdown) ---
  useEffect(() => {
    const fetchCats = async () => {
        try {
            const res = await axios.get('https://otruyenapi.com/v1/api/the-loai');
            setFullCategories(res.data.data.items);
        } catch (e) { console.error(e); }
    };
    fetchCats();
  }, []);

  // --- 2. RESET KHI URL THAY ĐỔI (Chuyển từ ds thường sang thể loại hoặc ngược lại) ---
  useEffect(() => {
      setStories([]);
      setPage(1);
      setHasMore(true);
      setFilter(prev => ({
          ...prev,
          category: slug || '', // Cập nhật category theo URL
          status: slug ? 'all' : 'NEW' // Nếu là thể loại thì reset status về all, nếu list thường thì về NEW
      }));
  }, [slug, location.pathname]);

  // --- 3. FETCH DATA CHÍNH ---
  useEffect(() => {
      const fetchData = async () => {
          if (page === 1) setLoading(true);
          else setLoadingMore(true);

          try {
              let apiUrl = '';
              
              // LOGIC CHỌN API:
              // Ưu tiên 1: Nếu đang lọc theo Category (hoặc ở trang thể loại) -> Gọi API Thể loại
              if (filter.category) {
                  apiUrl = `https://otruyenapi.com/v1/api/the-loai/${filter.category}?page=${page}`;
              } 
              // Ưu tiên 2: Nếu không có Category -> Gọi API theo Status (Truyện mới, Hoàn thành...)
              else {
                  const endpoint = API_ENDPOINTS[filter.status] || API_ENDPOINTS.NEW;
                  apiUrl = `https://otruyenapi.com/v1/api/danh-sach/${endpoint}?page=${page}`;
              }

              const res = await axios.get(apiUrl);
              const data = res.data.data;

              setDomainAnh(data.APP_DOMAIN_CDN_IMAGE);
              setPageTitle(data.titlePage);
              setTotalItems(data.params.pagination.totalItems);

              const newItems = data.items;

              if (page === 1) {
                  setStories(newItems);
              } else {
                  // Tránh trùng lặp khi load more
                  setStories(prev => {
                      const existing = new Set(prev.map(s => s._id));
                      return [...prev, ...newItems.filter(s => !existing.has(s._id))];
                  });
              }

              // Check còn trang tiếp theo không
              const totalPages = Math.ceil(data.params.pagination.totalItems / data.params.pagination.totalItemsPerPage);
              setHasMore(page < totalPages);

          } catch (error) {
              console.error("Lỗi fetch:", error);
          } finally {
              setLoading(false);
              setLoadingMore(false);
          }
      };

      // Debounce nhẹ để tránh gọi kép khi filter đổi
      const timer = setTimeout(() => {
          fetchData();
      }, 100);
      return () => clearTimeout(timer);

  }, [page, filter.category, filter.status]); // Chạy lại khi trang, thể loại, hoặc trạng thái đổi

  // --- HANDLERS ---
  const handleLoadMore = () => setPage(prev => prev + 1);

  const handleFilterChange = (key, value) => {
      // Khi đổi bộ lọc -> Reset về trang 1 và xóa data cũ
      setStories([]);
      setPage(1);
      setFilter(prev => ({ ...prev, [key]: value }));
      
      // Nếu đổi Category -> Navigate URL để đồng bộ (tùy chọn)
      if (key === 'category') {
          if (value) navigate(`/the-loai/${value}`);
          else navigate('/danh-sach');
      }
  };

  // --- CLIENT SIDE SORTING (Vì API không hỗ trợ sort params) ---
  // Chỉ sắp xếp trên những truyện ĐÃ TẢI VỀ (Hạn chế nhưng tốt hơn không có)
  const displayedStories = useMemo(() => {
      let result = [...stories];
      
      // Nếu đang ở trang Thể loại -> Client filter Status (vì API thể loại trả về hỗn hợp)
      if (filter.category && filter.status !== 'all') {
          // Mapping status của API trả về (Completed/Ongoing)
          const statusKey = filter.status === 'COMPLETED' ? 'Completed' : 'Ongoing';
          result = result.filter(s => s.status === statusKey || s.status === filter.status.toLowerCase());
      }

      // Sort
      if (filter.sort === 'name_az') {
          result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (filter.sort === 'chapter_desc') {
          // Sắp xếp theo chương mới nhất (nhiều chương nhất)
          result.sort((a, b) => {
             const getNum = (item) => parseFloat(item.latest_chapter?.match(/\d+/)?.[0] || 0);
             return getNum(b) - getNum(a);
          });
      }
      // Mặc định API đã trả về theo Update mới nhất nên không cần sort lại nếu chọn 'default'

      return result;
  }, [stories, filter.sort, filter.status, filter.category]);


  // --- HELPERS ---
  const formatChapter = (truyen) => {
    const chap = truyen.latest_chapter || (truyen.chaptersLatest && truyen.chaptersLatest[0]?.chapter_name);
    if (!chap) return '??';
    return String(chap).includes('hapter') ? chap : `Chap ${chap}`;
  };

  const timeAgo = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER & TOGGLE */}
        <div className="mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase mb-2">
                <Link to="/" className="hover:text-primary">Trang chủ</Link>
                <RiArrowRightSLine />
                <span>{filter.category ? 'Thể loại' : 'Danh sách'}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 uppercase">
                        <span className="text-primary">#</span> {pageTitle}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {totalItems > 0 ? `Tìm thấy ${totalItems} truyện` : 'Kho truyện khổng lồ'}
                    </p>
                </div>

                <button 
                    onClick={() => setShowFilter(!showFilter)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${showFilter ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-[#1a1a2e] border border-white/10 hover:bg-white/10'}`}
                >
                    {showFilter ? <RiCloseLine size={18} /> : <RiFilter3Line size={18} />}
                    {showFilter ? 'Ẩn Bộ Lọc' : 'Lọc & Sắp Xếp'}
                </button>
            </div>
        </div>

        {/* --- FILTER PANEL --- */}
        {showFilter && (
            <div className="mb-8 bg-[#151525] p-6 rounded-2xl border border-white/5 shadow-xl animate-fade-in-down">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* 1. Trạng Thái (API MAPPING) */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-primary pl-2">Trạng Thái / Loại</h4>
                        <div className="flex flex-wrap gap-2">
                            {/* Nếu đang ở trang Thể loại, cho phép chọn All. Nếu trang List thường, dùng API map */}
                            {filter.category && (
                                <button onClick={() => handleFilterChange('status', 'all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${filter.status === 'all' ? 'bg-primary text-white border-primary' : 'bg-[#1a1a2e] border-white/10'}`}>Tất Cả</button>
                            )}
                            
                            <button onClick={() => handleFilterChange('status', 'NEW')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${filter.status === 'NEW' ? 'bg-primary text-white border-primary' : 'bg-[#1a1a2e] border-white/10'}`}>Truyện Mới</button>
                            <button onClick={() => handleFilterChange('status', 'ONGOING')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${filter.status === 'ONGOING' ? 'bg-green-600 text-white border-green-600' : 'bg-[#1a1a2e] border-white/10'}`}>Đang Tiến Hành</button>
                            <button onClick={() => handleFilterChange('status', 'COMPLETED')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${filter.status === 'COMPLETED' ? 'bg-blue-600 text-white border-blue-600' : 'bg-[#1a1a2e] border-white/10'}`}>Hoàn Thành</button>
                            <button onClick={() => handleFilterChange('status', 'UPCOMING')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${filter.status === 'UPCOMING' ? 'bg-purple-600 text-white border-purple-600' : 'bg-[#1a1a2e] border-white/10'}`}>Sắp Ra Mắt</button>
                        </div>
                        {!filter.category && <p className="text-[10px] text-gray-500 mt-2 italic">*Chọn trạng thái sẽ tải lại danh sách từ server.</p>}
                    </div>

                    {/* 2. Sắp Xếp (Client Side) */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-green-500 pl-2">Sắp Xếp (Trang hiện tại)</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'default', label: 'Mặc Định' },
                                { id: 'name_az', label: 'Tên A-Z' },
                                { id: 'chapter_desc', label: 'Nhiều Chương' },
                            ].map(s => (
                                <button key={s.id} onClick={() => handleFilterChange('sort', s.id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${filter.sort === s.id ? 'bg-green-600 text-white border-green-600' : 'bg-[#1a1a2e] border-white/10'}`}>{s.label}</button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Thể Loại (Navigate) */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-purple-500 pl-2">Chuyển Thể Loại</h4>
                        <select 
                            onChange={(e) => handleFilterChange('category', e.target.value)} 
                            value={filter.category} 
                            className="w-full bg-[#1a1a2e] border border-white/10 text-gray-300 text-sm rounded-lg p-2.5 focus:outline-none focus:border-primary cursor-pointer"
                        >
                            <option value="">-- Tất cả thể loại --</option>
                            {fullCategories.map(cat => (
                                <option key={cat._id} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        )}

        {/* LOADING */}
        {loading && (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm animate-pulse">Đang tải dữ liệu...</p>
            </div>
        )}

        {/* CONTENT */}
        {!loading && displayedStories.length > 0 ? (
            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 animate-fade-in-up">
                    {displayedStories.map((truyen) => (
                        <Link key={truyen._id} to={`/truyen-tranh/${truyen.slug}`} className="flex flex-col gap-2 group cursor-pointer">
                            <div className="w-full aspect-[2/3] bg-[#1f1f3a] rounded-lg overflow-hidden relative border border-white/5 group-hover:border-green-500/50 transition-all shadow-sm">
                                <img 
                                    src={`${domainAnh}/uploads/comics/${truyen.thumb_url}`}
                                    alt={truyen.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute top-1.5 right-1.5 flex flex-row items-center gap-1">
                                    <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <RiTimeLine size={8} className="text-primary"/> {timeAgo(truyen.updatedAt)}
                                    </span>
                                    <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <RiBookOpenLine size={8} /> {formatChapter(truyen)}
                                    </span>
                                </div>
                                <div className={`absolute bottom-0 left-0 right-0 text-[9px] text-center font-bold text-white py-0.5 ${truyen.status === 'ongoing' ? 'bg-green-600/80' : 'bg-blue-600/80'}`}>
                                    {truyen.status === 'ongoing' ? 'ĐANG TIẾN HÀNH' : 'HOÀN THÀNH'}
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
                        <button 
                            onClick={handleLoadMore} 
                            disabled={loadingMore} 
                            className="px-8 py-3 rounded-full bg-[#1a1a2e] border border-white/10 hover:bg-primary hover:text-white hover:border-primary text-gray-300 font-bold transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                        >
                            {loadingMore && <RiLoader4Line className="animate-spin" />}
                            {loadingMore ? 'Đang tải thêm...' : 'Xem Thêm Truyện'}
                        </button>
                    </div>
                )}
            </>
        ) : (
            !loading && (
                <div className="py-20 text-center text-gray-500 bg-[#151525] rounded-xl border border-white/5 border-dashed">
                    <RiErrorWarningLine className="text-5xl mx-auto mb-4 opacity-50" />
                    <p>Không tìm thấy truyện nào phù hợp.</p>
                    <button onClick={() => setFilter({ status: 'NEW', category: '', sort: 'default' })} className="mt-4 text-primary hover:underline text-sm font-bold">Đặt lại bộ lọc</button>
                </div>
            )
        )}

      </main>
      <Footer />
    </div>
  );
};

export default ListPage;