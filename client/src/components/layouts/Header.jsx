import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import axios from 'axios';
import { 
  RiSearchLine, RiMenu3Line, RiCloseLine, 
  RiBarChartHorizontalLine, RiHistoryLine, RiHeart3Line 
} from 'react-icons/ri';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 1. State lưu từ khóa tìm kiếm
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate(); // Hook để chuyển trang

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://otruyenapi.com/v1/api/the-loai');
        setCategories(response.data.data.items);
      } catch (error) { console.error(error); }
    };
    fetchCategories();
  }, []);

  // 2. Hàm xử lý khi bấm Enter hoặc nút Tìm
  const handleSearch = (e) => {
    if (e.key === 'Enter' && keyword.trim()) {
      setMobileMenuOpen(false); // Đóng menu mobile nếu đang mở
      navigate(`/tim-kiem?keyword=${encodeURIComponent(keyword)}`); // Chuyển sang trang tìm kiếm
      setKeyword(''); // (Tuỳ chọn) Xóa ô tìm kiếm sau khi enter
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5 font-display">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
             <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
             <span className="text-white font-black text-lg hidden sm:block tracking-tight">TRUYEN<span className="text-primary">VIETHAY</span></span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link to="/" className="text-gray-300 hover:text-primary text-xs font-bold uppercase tracking-wider">Trang Chủ</Link>
            
            <div className="group relative py-4">
              <button className="text-gray-300 hover:text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                 Thể Loại
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-6 grid grid-cols-4 gap-3 z-50">
                 {categories.slice(0, 24).map((cat) => (
                    <Link key={cat._id} to={`/the-loai/${cat.slug}`} className="text-gray-400 hover:text-white hover:bg-white/5 px-2 py-1 rounded text-xs font-bold truncate transition-colors">
                      {cat.name}
                    </Link>
                 ))}
                 <Link to="/danh-sach" className="col-span-4 text-center text-primary text-xs font-bold pt-2 hover:underline">Xem tất cả</Link>
              </div>
            </div>

            <Link to="/xep-hang" className="text-gray-300 hover:text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
               Xếp Hạng
            </Link>
            <Link to="/lich-su" className="text-gray-300 hover:text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
               Lịch Sử
            </Link>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            {/* 3. INPUT TÌM KIẾM (DESKTOP) */}
            <div className="hidden md:flex items-center bg-[#252538] rounded-full px-3 py-1.5 border border-white/5 focus-within:border-primary/50 transition-colors">
               <RiSearchLine className="text-gray-500" />
               <input 
                  type="text" 
                  placeholder="Tìm truyện..." 
                  className="bg-transparent border-none focus:outline-none text-sm text-white px-2 w-24 lg:w-40"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={handleSearch}
               />
            </div>
            
            <div className="hidden md:flex gap-2">
               <Link to="/login" className="text-xs font-bold text-gray-300 hover:text-white px-3 py-2">Đăng nhập</Link>
               <Link to="/register" className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-lg shadow-primary/20">Đăng ký</Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-white text-2xl p-1">
              {mobileMenuOpen ? <RiCloseLine /> : <RiMenu3Line />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1a1a2e] border-t border-white/10 p-4 absolute w-full shadow-2xl z-50 h-screen overflow-y-auto pb-20">
           <div className="flex flex-col gap-2">
              {/* 4. INPUT TÌM KIẾM (MOBILE) */}
              <div className="flex items-center bg-[#252538] rounded-lg px-3 py-2.5 mb-4 border border-white/5">
                 <RiSearchLine className="text-gray-400" />
                 <input 
                    type="text" 
                    placeholder="Tìm kiếm truyện..." 
                    className="bg-transparent border-none focus:outline-none text-sm text-white px-2 w-full"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleSearch} 
                 />
              </div>

              <Link to="/" className="text-gray-300 font-bold p-3 rounded hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>Trang Chủ</Link>
              {/* ... Giữ nguyên các link khác ... */}
           </div>
        </div>
      )}
    </header>
  );
};

export default Header;