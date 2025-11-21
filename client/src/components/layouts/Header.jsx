import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; 
import LevelBadge from '../common/LevelBadge'; 
import { 
  RiSearchLine, RiMenu3Line, RiCloseLine, 
  RiHistoryLine, RiHeart3Line,
  RiLogoutBoxRLine, RiArrowDownSLine, 
  RiUserSettingsLine, RiAdminLine,
  RiNotification3Line, RiLayoutGridFill, RiTrophyFill // Thêm icon
} from 'react-icons/ri';

const BACKEND_URL = 'http://192.168.1.154:5000';

const Header = () => {
  // ... (Giữ nguyên logic state, api call, fetchNotifications...) ...
  // (Code giống hệt phiên bản trước, chỉ thay đổi phần JSX render Mobile Menu ở cuối)
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // State thông báo
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${BACKEND_URL}/${avatarPath}`; 
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('user_token');
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.items);
      setUnreadCount(res.data.unread);
    } catch (e) { console.error(e); }
  };

  const handleReadNotify = async () => {
    if (unreadCount > 0) {
      try {
        const token = localStorage.getItem('user_token');
        await axios.put('/api/notifications/read-all', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(0);
      } catch (e) { console.error(e); }
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://otruyenapi.com/v1/api/the-loai');
        setCategories(response.data.data.items);
      } catch (error) { console.error(error); }
    };
    fetchCategories();
    if (user) fetchNotifications();
  }, [user]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && keyword.trim()) {
      setMobileMenuOpen(false);
      navigate(`/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
      setKeyword('');
    }
  };

  const handleLogout = () => {
      logout();
      setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5 font-display">
      {/* ... (Phần Desktop Navbar giữ nguyên) ... */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="flex-shrink-0">
             <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
          </Link>

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
            <Link to="/xep-hang" className="text-gray-300 hover:text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">Xếp Hạng</Link>
          </nav>

          <div className="flex items-center gap-3">
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
            
            {user ? (
                <div className="flex items-center gap-4">
                    <div className="relative group" onMouseEnter={handleReadNotify}>
                        <button className="w-9 h-9 rounded-full bg-[#252538] hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/5 relative">
                            <RiNotification3Line size={18} />
                            {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1a1a2e]"></span>}
                        </button>
                        <div className="absolute right-0 mt-2 w-80 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl p-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5"><h4 className="text-white font-bold text-sm">Thông Báo</h4></div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? notifications.map(notif => (
                                    <div key={notif.id} className={`p-3 border-b border-white/5 transition-colors ${notif.is_read ? 'opacity-50' : 'bg-white/5'}`}>
                                        <p className="text-xs text-gray-200 font-bold mb-1">{notif.title}</p>
                                        <p className="text-xs text-gray-400 line-clamp-2">{notif.message}</p>
                                        <span className="text-[9px] text-gray-600 mt-1 block">{new Date(notif.created_at).toLocaleString('vi-VN')}</span>
                                    </div>
                                )) : <p className="text-center text-gray-500 text-xs p-4">Chưa có thông báo nào.</p>}
                            </div>
                            <Link to="/thong-bao" className="block text-center text-xs text-gray-400 hover:text-white py-2 bg-white/5 hover:bg-white/10 transition-colors">Xem tất cả</Link>
                        </div>
                    </div>
                    <div className="relative">
                        <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 bg-[#252538] hover:bg-white/10 border border-white/5 rounded-full py-1 pr-3 pl-1 transition-all">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-white/10">
                                {user.avatar ? <img src={getAvatarUrl(user.avatar)} alt="Avt" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-white bg-gradient-to-tr from-primary to-purple-600">{user.full_name?.charAt(0).toUpperCase()}</div>}
                            </div>
                            <div className="hidden sm:block"><LevelBadge exp={user.exp} rankStyle={user.rank_style} role={user.role} /></div>
                            <RiArrowDownSLine className="text-gray-400" />
                        </button>
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl py-2 animate-fade-in-up z-50">
                                <div className="px-4 py-3 border-b border-white/5 mb-1 bg-white/5">
                                    <p className="text-white text-sm font-bold truncate">{user.full_name}</p>
                                    <p className="text-gray-500 text-xs truncate">@{user.username}</p>
                                </div>
                                {user.role === 'admin' && <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-white/5 hover:text-red-400 transition-colors font-bold border-b border-white/5"><RiAdminLine size={18} /> Quản Trị Viên</Link>}
                                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors font-medium"><RiUserSettingsLine size={18} /> Thông Tin Cá Nhân</Link>
                                <Link to="/lich-su" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors font-medium"><RiHistoryLine size={18} /> Lịch Sử Đọc</Link>
                                <Link to="/theo-doi" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors font-medium"><RiHeart3Line size={18} /> Tủ Truyện</Link>
                                <div className="border-t border-white/5 my-1"></div>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors text-left font-bold"><RiLogoutBoxRLine size={18} /> Đăng Xuất</button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex gap-2">
                    <Link to="/login" className="text-xs font-bold text-gray-300 hover:text-white px-3 py-2">Đăng nhập</Link>
                    <Link to="/register" className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-lg shadow-primary/20">Đăng ký</Link>
                </div>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-white text-2xl p-1">{mobileMenuOpen ? <RiCloseLine /> : <RiMenu3Line />}</button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1a1a2e] border-t border-white/10 p-4 absolute w-full shadow-2xl z-50 h-screen overflow-y-auto pb-20">
           <div className="flex flex-col gap-2">
              {/* Search */}
              <div className="flex items-center bg-[#252538] rounded-lg px-3 py-2.5 mb-4 border border-white/5">
                 <RiSearchLine className="text-gray-400" />
                 <input type="text" placeholder="Tìm kiếm truyện..." className="bg-transparent border-none focus:outline-none text-sm text-white px-2 w-full" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={handleSearch} />
              </div>

              <Link to="/" className="text-gray-300 font-bold p-3 rounded hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>Trang Chủ</Link>
              
              {/* --- MỚI: THỂ LOẠI & XẾP HẠNG (MOBILE) --- */}
              <Link to="/danh-sach" className="text-gray-300 font-bold p-3 rounded hover:bg-white/5 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                 <RiLayoutGridFill className="text-primary"/> Thể Loại
              </Link>
              <Link to="/xep-hang" className="text-gray-300 font-bold p-3 rounded hover:bg-white/5 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                 <RiTrophyFill className="text-primary"/> Xếp Hạng
              </Link>

              <div className="border-t border-white/5 my-2"></div>

              {user ? (
                  <>
                    {user.role === 'admin' && <Link to="/admin" className="text-red-500 font-bold p-3 rounded hover:bg-white/5 flex items-center gap-2"><RiAdminLine /> Quản Trị Viên</Link>}
                    <div className="text-gray-300 font-bold p-3 rounded hover:bg-white/5 flex items-center gap-2 justify-between">
                        <span className="flex items-center gap-2"><RiNotification3Line className="text-primary"/> Thông Báo</span>
                        {unreadCount > 0 && (<span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{unreadCount}</span>)}
                    </div>
                    <Link to="/profile" className="text-gray-300 font-bold p-3 rounded hover:bg-white/5 flex items-center gap-2"><RiUserSettingsLine className="text-primary"/> Thông Tin Cá Nhân</Link>
                    <Link to="/lich-su" className="text-gray-300 font-bold p-3 rounded hover:bg-white/5 flex items-center gap-2"><RiHistoryLine className="text-primary"/> Lịch Sử Đọc</Link>
                    <Link to="/theo-doi" className="text-gray-300 font-bold p-3 rounded hover:bg-white/5 flex items-center gap-2"><RiHeart3Line className="text-primary"/> Tủ Truyện</Link>
                    <button onClick={handleLogout} className="text-red-400 font-bold p-3 rounded hover:bg-white/5 text-left flex items-center gap-2"><RiLogoutBoxRLine /> Đăng Xuất</button>
                  </>
              ) : (
                  <div className="border-t border-white/10 pt-4 flex flex-col gap-3 mt-2">
                     <Link to="/login" className="text-center text-gray-300 font-bold py-2 rounded border border-white/10">Đăng nhập</Link>
                     <Link to="/register" className="text-center bg-primary text-white font-bold py-2 rounded shadow-lg shadow-primary/20">Đăng ký ngay</Link>
                  </div>
              )}
           </div>
        </div>
      )}
    </header>
  );
};

export default Header;