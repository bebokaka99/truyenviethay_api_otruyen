import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LevelBadge from '../common/LevelBadge';
import {
    RiSearchLine, RiMenu3Line, RiCloseLine,
    RiHistoryLine, RiHeart3Line,
    RiLogoutBoxRLine, RiArrowDownSLine,
    RiUserSettingsLine, RiAdminLine,
    // --- THÊM CÁC ICON MỚI CHO THÔNG BÁO ---
    RiNotification3Line, RiLayoutGridFill, RiTrophyFill, RiInformationLine,
    RiLoader4Line, RiFlag2Line, RiTaskLine, RiAlertLine, RiChat1Line
} from 'react-icons/ri';

const BACKEND_URL = 'https://truyenviethay-backend.onrender.com';
const COMIC_IMAGE_DOMAIN = 'https://img.otruyenapi.com/uploads/comics/';

const Header = () => {
    const [categories, setCategories] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [keyword, setKeyword] = useState('');

    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null;
        if (avatarPath.startsWith('http')) return avatarPath;
        return `${BACKEND_URL}/${avatarPath.replace(/^\//, '')}`;
    };

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('user_token');
            const res = await axios.get(`${BACKEND_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
            setNotifications(res.data.items);
            setUnreadCount(res.data.unread);
        } catch (e) { console.error(e); }
    };

    const handleReadNotify = async () => {
        if (unreadCount > 0) {
            try {
                const token = localStorage.getItem('user_token');
                await axios.put(`${BACKEND_URL}/api/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
                setUnreadCount(0);
            } catch (e) { console.error(e); }
        }
    };

    useEffect(() => {
        if (keyword.trim().length < 2) { setSearchResults([]); setShowDropdown(false); return; }
        setIsSearching(true); setShowDropdown(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await axios.get(`https://otruyenapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
                setSearchResults(response.data.data.items.slice(0, 5));
            } catch (error) { console.error("Lỗi live search:", error); setSearchResults([]); } finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    useEffect(() => {
        function handleClickOutside(event) { if (searchRef.current && !searchRef.current.contains(event.target)) { setShowDropdown(false); } }
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('https://otruyenapi.com/v1/api/the-loai');
                setCategories(response.data.data.items);
            } catch (error) { console.error(error); }
        };
        fetchCategories();
        if (user) fetchNotifications();
        const interval = setInterval(() => { if (user) fetchNotifications(); }, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleSearchSubmit = () => {
        if (keyword.trim()) { setShowDropdown(false); setMobileMenuOpen(false); navigate(`/tim-kiem?keyword=${encodeURIComponent(keyword)}`) }
    };
    const handleKeyDown = (e) => { if (e.key === 'Enter') { handleSearchSubmit(); } };
    const handleLogout = () => { logout(); setShowUserMenu(false); setMobileMenuOpen(false); };

    const SearchResultItem = ({ item }) => {
        const latestChapName = item.chaptersLatest?.[0]?.chapter_name;
        return (
            <Link to={`/truyen-tranh/${item.slug}`} className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => { setShowDropdown(false); setKeyword(''); setMobileMenuOpen(false); }}>
                <img src={`${COMIC_IMAGE_DOMAIN}${item.thumb_url}`} alt={item.name} className="w-10 h-12 object-cover rounded-md flex-shrink-0" />
                <div className="min-w-0">
                    <h4 className="text-white text-sm font-bold truncate">{item.name}</h4>
                    <p className="text-green-500 text-xs font-bold truncate">{latestChapName ? `Chương ${latestChapName}` : 'Đang cập nhật'}</p>
                </div>
            </Link>
        );
    };

    // ==========================================
    // --- HELPER: XÁC ĐỊNH STYLE CHO THÔNG BÁO ---
    // ==========================================
    const getNotificationStyle = (type) => {
        switch (type) {
            case 'system': // Cảnh báo, xóa comment
                return { icon: RiAlertLine, colorClass: 'text-red-500', borderClass: 'border-l-red-500', bgHover: 'hover:bg-red-500/10' };
            case 'quest': // Hoàn thành nhiệm vụ
                return { icon: RiTaskLine, colorClass: 'text-green-500', borderClass: 'border-l-green-500', bgHover: 'hover:bg-green-500/10' };
            case 'comment': // Có người trả lời (Mặc định)
            default:
                return { icon: RiChat1Line, colorClass: 'text-blue-500', borderClass: 'border-l-blue-500', bgHover: 'hover:bg-blue-500/10' };
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5 font-display">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex-shrink-0"><img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" /></Link>

                    {/* Desktop Nav (Giữ nguyên) */}
                    <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
                        <Link to="/" className="text-gray-300 hover:text-primary text-xs font-bold uppercase tracking-wider transition-colors">Trang Chủ</Link>
                        <div className="group relative py-4">
                            <button className="text-gray-300 hover:text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">Thể Loại</button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-6 grid grid-cols-4 gap-3 z-50">
                                {categories.slice(0, 24).map((cat) => (<Link key={cat._id} to={`/the-loai/${cat.slug}`} className="text-gray-400 hover:text-white hover:bg-white/5 px-2 py-1 rounded text-xs font-bold truncate transition-colors">{cat.name}</Link>))}
                                <Link to="/danh-sach" className="col-span-4 text-center text-primary text-xs font-bold pt-2 hover:underline">Xem tất cả</Link>
                            </div>
                        </div>
                        <Link to="/xep-hang" className="text-gray-300 hover:text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">Xếp Hạng</Link>
                        <Link to="/gioi-thieu" className="text-gray-300 hover:text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">Giới Thiệu</Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {/* Search Bar Desktop (Giữ nguyên) */}
                        <div className="hidden md:block relative" ref={searchRef}>
                            <div className="flex items-center bg-[#252538] rounded-full px-3 py-1.5 border border-white/5 focus-within:border-primary/50 transition-colors relative z-20">
                                <RiSearchLine className="text-gray-500 cursor-pointer hover:text-primary transition-colors" onClick={handleSearchSubmit} />
                                <input type="text" placeholder="Tìm truyện..." className="bg-transparent border-none focus:outline-none text-sm text-white px-2 w-24 lg:w-40" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => keyword.length >= 2 && setShowDropdown(true)} />
                                {isSearching && <RiLoader4Line className="animate-spin text-primary text-xs absolute right-3" />}
                            </div>
                            {showDropdown && keyword.length >= 2 && (
                                <div className="absolute top-full mt-2 left-0 w-64 lg:w-80 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl p-2 z-10 animate-fade-in-up">
                                    {isSearching ? (<div className="p-3 text-center text-gray-500 text-xs">Đang tìm kiếm...</div>) : searchResults.length > 0 ? (<div className="flex flex-col">{searchResults.map(item => (<SearchResultItem key={item._id} item={item} />))}<div className="border-t border-white/5 mt-2 pt-2"><button onClick={handleSearchSubmit} className="w-full text-center text-xs text-primary font-bold py-2 hover:underline">Xem tất cả kết quả cho "{keyword}"</button></div></div>) : (<div className="p-3 text-center text-gray-500 text-xs">Không tìm thấy truyện nào.</div>)}
                                </div>
                            )}
                        </div>

                        {user ? (
                            <div className="flex items-center gap-3 md:gap-4">
                                {/* Nút thông báo */}
                                <div className="relative group" onMouseEnter={() => window.innerWidth >= 1024 && handleReadNotify()}>
                                    <button onClick={() => { setShowNotifDropdown(!showNotifDropdown); handleReadNotify(); }} className="w-9 h-9 rounded-full bg-[#252538] hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/5 relative">
                                        <RiNotification3Line size={18} />
                                        {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1a1a2e] animate-pulse"></span>}
                                    </button>
                                    {/* Dropdown thông báo (CẬP NHẬT UI) */}
                                    <div className={`bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 fixed top-16 left-2 right-2 lg:absolute lg:top-full lg:right-0 lg:left-auto lg:w-80 lg:mt-2 transition-all duration-200 ${showNotifDropdown ? 'block' : 'hidden lg:group-hover:block lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>
                                        <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                                            <h4 className="text-white font-bold text-sm">Thông Báo</h4>
                                            <button onClick={() => setShowNotifDropdown(false)} className="lg:hidden text-gray-400"><RiCloseLine /></button>
                                        </div>
                                        <div className="max-h-[60vh] lg:max-h-60 overflow-y-auto custom-scrollbar">
                                            {notifications.length > 0 ? notifications.map(notif => {
                                                // Lấy style dựa trên loại thông báo
                                                const style = getNotificationStyle(notif.type);
                                                const Icon = style.icon;
                                                
                                                return (
                                                    <Link to={notif.link || '#'} key={notif.id} onClick={() => setShowNotifDropdown(false)} className={`flex gap-3 p-3 border-b border-white/5 transition-colors border-l-2 ${notif.is_read ? 'opacity-60 hover:bg-white/5 border-transparent' : `bg-white/5 ${style.bgHover} ${style.borderClass}`}`}>
                                                        {/* Icon thông báo */}
                                                        <div className={`mt-0.5 ${style.colorClass}`}>
                                                            <Icon size={18} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`text-xs font-bold mb-1 ${style.colorClass}`}>{notif.title}</p>
                                                            {/* Xử lý xuống dòng cho phần "Lý do:" */}
                                                            <p className="text-xs text-gray-400 line-clamp-3 whitespace-pre-wrap">
                                                                {notif.type === 'system' ? notif.message.replace('. Lý do:', '.\nLý do:') : notif.message}
                                                            </p>
                                                            <span className="text-[9px] text-gray-600 mt-1 block">{new Date(notif.created_at).toLocaleString('vi-VN')}</span>
                                                        </div>
                                                    </Link>
                                                );
                                            }) : <p className="text-center text-gray-500 text-xs p-6">Chưa có thông báo nào.</p>}
                                        </div>
                                        <Link to="/thong-bao" className="block text-center text-xs text-gray-400 hover:text-white py-3 bg-white/5 hover:bg-white/10 transition-colors border-t border-white/5" onClick={() => setShowNotifDropdown(false)}>Xem tất cả thông báo</Link>
                                    </div>
                                </div>

                                {/* User Menu (Giữ nguyên) */}
                                <div className="relative">
                                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 bg-[#252538] hover:bg-white/10 border border-white/5 rounded-full py-1 pr-3 pl-1 transition-all">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-white/10">{user.avatar ? <img src={getAvatarUrl(user.avatar)} alt="Avt" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-white bg-gradient-to-tr from-primary to-purple-600">{user.full_name?.charAt(0).toUpperCase()}</div>}</div>
                                        <div className="hidden sm:block"><LevelBadge exp={user.exp} rankStyle={user.rank_style} role={user.role} /></div><RiArrowDownSLine className="text-gray-400" />
                                    </button>
                                    {showUserMenu && (<div className="absolute right-0 mt-2 w-56 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl py-2 animate-fade-in-up z-50"><div className="px-4 py-3 border-b border-white/5 mb-1 bg-white/5"><p className="text-white text-sm font-bold truncate">{user.full_name}</p><p className="text-gray-500 text-xs truncate">@{user.username}</p></div>{user.role === 'admin' && <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-white/5 hover:text-red-400 transition-colors font-bold border-b border-white/5"><RiAdminLine size={18} /> Quản Trị Viên</Link>}<Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors font-medium"><RiUserSettingsLine size={18} /> Thông Tin Cá Nhân</Link><Link to="/lich-su" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors font-medium"><RiHistoryLine size={18} /> Lịch Sử Đọc</Link><Link to="/theo-doi" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors font-medium"><RiHeart3Line size={18} /> Tủ Truyện</Link><div className="border-t border-white/5 my-1"></div><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors text-left font-bold"><RiLogoutBoxRLine size={18} /> Đăng Xuất</button></div>)}
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:flex gap-2">
                                <Link to="/login" className="text-xs font-bold text-gray-300 hover:text-white px-3 py-2">Đăng nhập</Link>
                                <Link to="/register" className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-lg shadow-primary/20">Đăng ký</Link>
                            </div>
                        )}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-white text-2xl p-1 relative">{mobileMenuOpen ? <RiCloseLine /> : <RiMenu3Line />}</button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (Giữ nguyên phần lớn, chỉ cập nhật Live Search) */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-[#1a1a2e] border-t border-white/10 absolute w-full shadow-2xl z-40 h-[calc(100vh-64px)] overflow-y-auto pb-20 animate-fade-in-left">
                    <div className="p-4 flex flex-col gap-3">
                        {user && (<div className="flex items-center gap-3 bg-[#252538] p-3 rounded-xl border border-white/5 mb-2"><div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 border border-white/10">{user.avatar ? <img src={getAvatarUrl(user.avatar)} alt="Avt" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-white bg-gradient-to-tr from-primary to-purple-600">{user.full_name?.charAt(0).toUpperCase()}</div>}</div><div className="flex-1 min-w-0"><p className="text-white font-bold text-sm truncate">{user.full_name}</p><div className="flex items-center gap-2 mt-1"><LevelBadge exp={user.exp} rankStyle={user.rank_style} role={user.role} /></div></div></div>)}
                        
                        <div className="relative" ref={searchRef}>
                            <div className="flex items-center bg-[#252538] rounded-xl px-4 py-3 mb-2 border border-white/5 focus-within:border-primary/50 transition-colors relative">
                                <RiSearchLine className="text-gray-400 text-lg" onClick={handleSearchSubmit} />
                                <input type="text" placeholder="Tìm kiếm truyện..." className="bg-transparent border-none focus:outline-none text-sm text-white px-3 w-full" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => keyword.length >= 2 && setShowDropdown(true)} />
                                {isSearching && <RiLoader4Line className="animate-spin text-primary absolute right-4" />}
                            </div>
                            {showDropdown && keyword.length >= 2 && (
                                <div className="bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl p-2 mb-3 z-50 animate-fade-in-up">
                                    {isSearching ? (<div className="p-3 text-center text-gray-500 text-xs">Đang tìm kiếm...</div>) : searchResults.length > 0 ? (<div className="flex flex-col">{searchResults.map(item => (<SearchResultItem key={item._id} item={item} />))}<div className="border-t border-white/5 mt-2 pt-2"><button onClick={handleSearchSubmit} className="w-full text-center text-xs text-primary font-bold py-2 hover:underline">Xem tất cả kết quả cho "{keyword}"</button></div></div>) : (<div className="p-3 text-center text-gray-500 text-xs">Không tìm thấy truyện nào.</div>)}
                                </div>
                            )}
                        </div>
                        <Link to="/" className="text-gray-300 font-bold p-3 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setMobileMenuOpen(false)}>Trang Chủ</Link>
                        <Link to="/danh-sach" className="text-gray-300 font-bold p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><RiLayoutGridFill className="text-primary"/> Thể Loại</Link>
                        <Link to="/xep-hang" className="text-gray-300 font-bold p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><RiTrophyFill className="text-primary"/> Xếp Hạng</Link>
                        <Link to="/gioi-thieu" className="text-gray-300 font-bold p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><RiInformationLine className="text-primary"/> Giới Thiệu</Link>
                        <div className="border-t border-white/5 my-1"></div>
                        {user ? (<><Link to="/profile" className="text-gray-300 font-bold p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><RiUserSettingsLine className="text-primary" /> Hồ Sơ Cá Nhân</Link><Link to="/lich-su" className="text-gray-300 font-bold p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><RiHistoryLine className="text-primary" /> Lịch Sử Đọc</Link><Link to="/theo-doi" className="text-gray-300 font-bold p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><RiHeart3Line className="text-primary" /> Tủ Truyện</Link>{user.role === 'admin' && (<Link to="/admin" className="text-red-500 font-bold p-3 rounded-xl hover:bg-red-500/10 transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}><RiAdminLine /> Quản Trị Viên</Link>)}<button onClick={handleLogout} className="w-full mt-2 flex items-center gap-2 text-red-400 font-bold p-3 rounded-xl hover:bg-white/5 transition-colors text-left"><RiLogoutBoxRLine /> Đăng Xuất</button></>) : (<div className="flex flex-col gap-3 mt-2"><Link to="/login" className="text-center text-gray-300 font-bold py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link><Link to="/register" className="text-center bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-colors" onClick={() => setMobileMenuOpen(false)}>Đăng ký ngay</Link></div>)}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;