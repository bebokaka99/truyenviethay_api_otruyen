import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    RiDashboardLine, RiArrowLeftLine, RiDeleteBinLine,
    RiErrorWarningLine, RiProhibitedLine, RiCheckLine,
    RiShieldUserLine, RiSearchLine, RiFilter3Line, RiCloseLine,
    RiFlag2Line, RiChat1Line, RiUser3Line,
    RiTaskLine, RiAddLine, RiEditLine,
    RiBookmarkLine, RiGlobalLine, RiDownloadCloud2Line,
    RiBarChartFill, RiSave3Line, RiSpamLine, RiAdminLine, RiUserStarLine, RiStarFill, RiTimeLine, RiLoader4Line, RiSendPlaneFill
} from 'react-icons/ri';

// --- ĐỔI URL BACKEND CỦA BẠN NẾU CẦN ---
const BACKEND_URL = 'https://truyenviethay-backend.onrender.com';

const DashboardPage = () => {
    // --- STATES QUẢN LÝ TAB VÀ DỮ LIỆU ---
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- STATES CHO LỌC VÀ TÌM KIẾM ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // --- STATES CHO PHÂN TRANG (TAB USERS) ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // --- STATES CHO CÁC MODAL ---
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Modal Ban
    const [showBanModal, setShowBanModal] = useState(false);
    const [banDays, setBanDays] = useState(1);

    // Modal Warn (Cảnh báo) - MỚI
    const [showWarnModal, setShowWarnModal] = useState(false);
    const [warnReason, setWarnReason] = useState('');

    // Modal Quest
    const [showQuestModal, setShowQuestModal] = useState(false);
    const [isEditingQuest, setIsEditingQuest] = useState(false);
    const [questForm, setQuestForm] = useState({ id: null, quest_key: '', name: '', description: '', target_count: 1, reward_exp: 10, type: 'daily', action_type: 'read' });

    // --- STATES CHO QUẢN LÝ TRUYỆN ---
    const [managedComics, setManagedComics] = useState([]);
    const [comicForm, setComicForm] = useState({ slug: '', name: '', is_hidden: false, is_recommended: false });
    const [externalSearch, setExternalSearch] = useState('');
    const [externalResults, setExternalResults] = useState([]);
    const [searchingExternal, setSearchingExternal] = useState(false);

    // ==========================================
    // --- HÀM FETCH DỮ LIỆU TỪ API ---
    // ==========================================
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('user_token');
            const api = axios.create({
                baseURL: BACKEND_URL,
                headers: { Authorization: `Bearer ${token}` }
            });
            
            let res;

            if (activeTab === 'users') {
                res = await api.get(`/api/user/admin/users?page=${currentPage}&limit=${itemsPerPage}`);
                setData(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
            }
            else if (activeTab === 'reports') res = await api.get('/api/reports/admin/all');
            else if (activeTab === 'comment_reports') res = await api.get('/api/reports/comments/admin/all');
            else if (activeTab === 'comments') res = await api.get('/api/comments/admin/all');
            else if (activeTab === 'quests') res = await api.get('/api/quests/admin/all');
            else if (activeTab === 'comics') res = await api.get('/api/user/admin/comics');

            if (activeTab === 'comics') setManagedComics(res.data);
            else if (activeTab !== 'dashboard' && activeTab !== 'users') setData(res.data);

        } catch (error) {
            console.error("Lỗi load data:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert("Phiên đăng nhập hết hạn hoặc bạn không có quyền admin.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== 'dashboard') fetchData();
        setSearchTerm('');
        setExternalResults([]);
        setExternalSearch('');
        if (activeTab !== 'users') setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, currentPage]);

    // ==========================================
    // --- LOGIC LỌC DỮ LIỆU CLIENT-SIDE ---
    // ==========================================
    const filteredData = useMemo(() => {
        if (!data || activeTab === 'dashboard') return [];
        if (activeTab === 'users') return data;

        const lowerSearch = searchTerm.toLowerCase();

        return data.filter(item => {
             if (activeTab === 'reports') {
                return item.comic_slug?.toLowerCase().includes(lowerSearch) || item.reason?.toLowerCase().includes(lowerSearch);
            }
            else if (activeTab === 'comment_reports') {
                return item.comment_content?.toLowerCase().includes(lowerSearch) || item.reporter_name?.toLowerCase().includes(lowerSearch) || item.reason?.toLowerCase().includes(lowerSearch);
            }
            else if (activeTab === 'comments') {
                return item.content?.toLowerCase().includes(lowerSearch) || item.username?.toLowerCase().includes(lowerSearch);
            }
            else if (activeTab === 'quests') {
                return item.name?.toLowerCase().includes(lowerSearch) || item.quest_key?.toLowerCase().includes(lowerSearch);
            }
            return false;
        });
    }, [data, searchTerm, activeTab]);


    // ==========================================
    // --- CÁC HÀM XỬ LÝ HÀNH ĐỘNG (ACTIONS) ---
    // ==========================================
    
    const callApi = async (method, endpoint, body = null) => {
        const token = localStorage.getItem('user_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const url = `${BACKEND_URL}${endpoint}`;
        try {
            if (method === 'post') return await axios.post(url, body, config);
            if (method === 'put') return await axios.put(url, body, config);
            if (method === 'delete') return await axios.delete(url, config);
        } catch (error) {
            throw error;
        }
    };

    // --- USER ACTIONS ---
    const handleDeleteUser = async (id) => { if (!window.confirm('Xóa user này? Hành động không thể hoàn tác!')) return; try { await callApi('delete', `/api/user/admin/users/${id}`); setData(prev => prev.filter(u => u.id !== id)); alert('Đã xóa user.'); } catch (e) { alert(e.response?.data?.message || 'Lỗi xóa user.'); } };
    
    // Mở modal cảnh báo (Thay vì gọi API ngay)
    const openWarnModal = (user) => {
        setSelectedUser(user);
        setWarnReason(''); // Reset lý do
        setShowWarnModal(true);
    };

    // Xác nhận cảnh báo (Gọi API mới kèm lý do)
    const confirmWarn = async () => {
        if (!selectedUser || !warnReason) return;
        try {
            await callApi('post', `/api/user/admin/users/${selectedUser.id}/warn`, { reason: warnReason });
            alert(`Đã gửi cảnh báo và thông báo cho user ${selectedUser.username}.`);
            setShowWarnModal(false);
            fetchData(); // Load lại để cập nhật số warnings
        } catch (e) {
            alert(e.response?.data?.message || 'Lỗi gửi cảnh báo.');
        }
    };

    const handleUnban = async (id) => { if (!window.confirm('Mở khóa tài khoản này?')) return; try { await callApi('post', `/api/user/admin/users/${id}/unban`); alert('Đã mở khóa!'); fetchData(); } catch (e) { alert('Lỗi mở khóa.'); } }
    const openBanModal = (user) => { setSelectedUser(user); setShowBanModal(true); };
    const confirmBan = async () => { if (!selectedUser) return; try { await callApi('post', `/api/user/admin/users/${selectedUser.id}/ban`, { days: parseInt(banDays) }); alert(`Đã chặn user ${selectedUser.username}.`); setShowBanModal(false); fetchData(); } catch (e) { alert('Lỗi khi chặn user.'); } };
    
    const handleChangeRole = async (userId, newRole, currentRole) => {
        if (newRole === currentRole) return;
        const roleName = newRole === 'admin' ? 'QUẢN TRỊ VIÊN (ADMIN)' : 'NGƯỜI DÙNG (USER)';
        if (!window.confirm(`Bạn có chắc chắn muốn thay đổi quyền của người dùng này thành ${roleName}?`)) { fetchData(); return; }
        try { await callApi('put', `/api/user/admin/users/${userId}/role`, { newRole }); alert(`Thành công! Đã thay đổi quyền thành ${newRole.toUpperCase()}.`); fetchData(); } catch (error) { alert(error.response?.data?.message || 'Lỗi khi thay đổi quyền.'); fetchData(); }
    };

    // --- OTHER ACTIONS ---
    const handleResolveReport = async (id) => { if (!window.confirm('Xác nhận đã xử lý xong báo cáo này?')) return; try { await callApi('delete', `/api/reports/admin/${id}`); setData(prev => prev.filter(r => r.id !== id)); } catch (e) { alert('Lỗi server.'); } };
    const handleDeleteComment = async (id) => { if (!window.confirm('Xóa bình luận này?')) return; try { await callApi('delete', `/api/comments/admin/${id}`); setData(prev => prev.filter(c => c.id !== id)); } catch (e) { alert('Lỗi xóa bình luận.'); } };
    const handleDeleteQuest = async (id) => { if (!window.confirm('Xóa nhiệm vụ này?')) return; try { await callApi('delete', `/api/quests/admin/${id}`); setData(prev => prev.filter(q => q.id !== id)); } catch (e) { alert('Lỗi xóa nhiệm vụ.'); } };
    const openQuestModal = (quest = null) => { if (quest) { setQuestForm(quest); setIsEditingQuest(true); } else { setQuestForm({ id: null, quest_key: '', name: '', description: '', target_count: 1, reward_exp: 10, type: 'daily', action_type: 'read' }); setIsEditingQuest(false); } setShowQuestModal(true); };
    const handleSubmitQuest = async (e) => { e.preventDefault(); try { if (isEditingQuest) await callApi('put', `/api/quests/admin/${questForm.id}`, questForm); else await callApi('post', '/api/quests/admin', questForm); setShowQuestModal(false); fetchData(); alert('Lưu nhiệm vụ thành công!'); } catch (error) { alert(error.response?.data?.message || 'Lỗi lưu nhiệm vụ.'); } };
    const handleSearchOtruyen = async (e) => { e.preventDefault(); if (!externalSearch.trim()) return; setSearchingExternal(true); try { const res = await axios.get(`https://otruyenapi.com/v1/api/tim-kiem?keyword=${externalSearch}`); setExternalResults(res.data.data.items); } catch (error) { console.error(error); alert("Lỗi kết nối Otruyen API."); } finally { setSearchingExternal(false); } };
    const selectExternalComic = (comic) => { setComicForm({ slug: comic.slug, name: comic.name, is_hidden: false, is_recommended: false }); setExternalResults([]); setExternalSearch(''); };
    const handleUpdateComic = async (e) => { e.preventDefault(); if (!comicForm.slug) return alert("Chưa nhập Slug!"); try { await callApi('post', '/api/user/admin/comics', comicForm); alert("Cập nhật trạng thái truyện thành công!"); fetchData(); setComicForm({ slug: '', name: '', is_hidden: false, is_recommended: false }); } catch (error) { alert("Lỗi cập nhật."); } };
    const editComic = (comic) => { setComicForm({ slug: comic.slug, name: comic.name, is_hidden: comic.is_hidden === 1, is_recommended: comic.is_recommended === 1 }); };
    const clearFilters = () => { setSearchTerm(''); setFilterRole('all'); setFilterStatus('all'); fetchData(); };


    // --- COMMENT REPORT ACTIONS ---
    const handleResolveCommentReport = async (reportId, action) => {
        const confirmMsg = action === 'delete_comment' 
            ? 'Bạn có chắc muốn XÓA bình luận này? Người dùng sẽ nhận được thông báo.' 
            : 'Bạn có chắc muốn BỎ QUA báo cáo này?';
            
        if (!window.confirm(confirmMsg)) return;

        try {
            // Gọi API mới đã cập nhật ở backend
            await callApi('post', `/api/reports/comments/admin/${reportId}/resolve`, { action });
            setData(prev => prev.filter(r => r.id !== reportId));
            alert(action === 'delete_comment' ? 'Đã xóa bình luận và gửi thông báo.' : 'Đã bỏ qua báo cáo.');
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi server khi xử lý báo cáo.');
        }
    };

    const currentAdminId = useMemo(() => {
        try {
            const token = localStorage.getItem('user_token');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                return JSON.parse(window.atob(base64)).id;
            }
            return null;
        } catch (e) { return null; }
    }, []);


    // ==========================================
    // --- GIAO DIỆN (JSX) ---
    // ==========================================
    return (
        <div className="min-h-screen bg-[#0a0a16] text-gray-300 font-display flex">

            {/* --- SIDEBAR --- */}
            <div className="w-64 bg-[#151525] border-r border-white/5 p-6 flex flex-col gap-6 fixed h-full z-20 overflow-y-auto no-scrollbar shadow-xl">
                <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight"><RiShieldUserLine className="text-red-500" /> ADMIN PANEL</h1>
                
                <nav className="flex flex-col gap-2 flex-1">
                    {/* Helper tạo menu item */}
                    {[
                        { id: 'dashboard', icon: RiBarChartFill, label: 'Tổng Quan', color: 'gray' },
                        { id: 'users', icon: RiUser3Line, label: 'Quản Lý Users', color: 'red' },
                        { id: 'reports', icon: RiFlag2Line, label: 'Báo Lỗi Truyện', color: 'yellow' },
                        { id: 'comment_reports', icon: RiSpamLine, label: 'Báo Cáo Bình Luận', color: 'orange' },
                        { id: 'comments', icon: RiChat1Line, label: 'Tất Cả Bình Luận', color: 'blue' },
                        { id: 'quests', icon: RiTaskLine, label: 'Hệ Thống Nhiệm Vụ', color: 'green' },
                        { id: 'comics', icon: RiBookmarkLine, label: 'Cấu Hình Truyện', color: 'purple' },
                    ].map(item => {
                        const isActive = activeTab === item.id;
                        // Mapping màu sắc cho Tailwind
                        const colorClasses = {
                            gray: isActive ? 'bg-gray-700 text-white shadow-lg shadow-gray-900/20' : 'hover:bg-white/5 text-gray-400 hover:text-white',
                            red: isActive ? 'bg-red-500/20 text-red-500 shadow-lg shadow-red-900/10' : 'hover:bg-white/5 text-gray-400 hover:text-red-400',
                            yellow: isActive ? 'bg-yellow-500/20 text-yellow-500 shadow-lg shadow-yellow-900/10' : 'hover:bg-white/5 text-gray-400 hover:text-yellow-400',
                            orange: isActive ? 'bg-orange-500/20 text-orange-500 shadow-lg shadow-orange-900/10' : 'hover:bg-white/5 text-gray-400 hover:text-orange-400',
                            blue: isActive ? 'bg-blue-500/20 text-blue-500 shadow-lg shadow-blue-900/10' : 'hover:bg-white/5 text-gray-400 hover:text-blue-400',
                            green: isActive ? 'bg-green-500/20 text-green-500 shadow-lg shadow-green-900/10' : 'hover:bg-white/5 text-gray-400 hover:text-green-400',
                            purple: isActive ? 'bg-purple-500/20 text-purple-500 shadow-lg shadow-purple-900/10' : 'hover:bg-white/5 text-gray-400 hover:text-purple-400',
                        };
                        
                        return (
                            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`px-4 py-3 rounded-xl font-bold cursor-pointer flex items-center gap-3 transition-all duration-300 ${colorClasses[item.color]} ${isActive ? 'scale-[1.02]' : ''}`}>
                                <item.icon size={20} /> {item.label}
                            </button>
                        );
                    })}
                </nav>
                <Link to="/" className="mt-auto flex items-center gap-2 text-sm text-gray-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors font-bold"><RiArrowLeftLine /> Quay về Trang Chủ</Link>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 p-8 ml-64">
                {/* HEADER */}
                <div className="flex justify-between items-end mb-8 animate-fade-in-down">
                    <div>
                        <h2 className="text-3xl font-black text-white capitalize tracking-tight mb-1">
                            {activeTab === 'dashboard' ? 'Tổng Quan Hệ Thống' : 
                             activeTab === 'comment_reports' ? 'Quản Lý Báo Cáo Bình Luận' : 
                             activeTab === 'users' ? 'Danh Sách Người Dùng' :
                             `Quản Lý ${activeTab}`}
                        </h2>
                        <p className="text-gray-500 text-sm">Chào mừng trở lại, Admin!</p>
                    </div>
                    {activeTab === 'quests' && <button onClick={() => openQuestModal()} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/40 hover:-translate-y-1"><RiAddLine size={18} /> Thêm Nhiệm Vụ Mới</button>}
                </div>

                {/* --- DASHBOARD OVERVIEW TAB --- */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-up">
                        {/* Helper tạo thẻ thống kê */}
                        {[
                            { id: 'users', icon: RiUser3Line, title: 'Người dùng', subtitle: 'Quản lý User & Role', color: 'red' },
                            { id: 'reports', icon: RiFlag2Line, title: 'Báo lỗi truyện', subtitle: 'Xử lý báo cáo lỗi', color: 'yellow' },
                            { id: 'comment_reports', icon: RiSpamLine, title: 'Spam / Độc hại', subtitle: 'Báo cáo bình luận', color: 'orange' },
                            { id: 'comics', icon: RiBookmarkLine, title: 'Nội dung', subtitle: 'Cấu hình Truyện', color: 'purple' },
                        ].map(card => {
                            const colorClasses = {
                                red: 'hover:border-red-500/50 text-red-500 bg-red-500/20',
                                yellow: 'hover:border-yellow-500/50 text-yellow-500 bg-yellow-500/20',
                                orange: 'hover:border-orange-500/50 text-orange-500 bg-orange-500/20',
                                purple: 'hover:border-purple-500/50 text-purple-500 bg-purple-500/20',
                            };
                            return (
                                <div key={card.id} className={`bg-[#151525] p-6 rounded-2xl border border-white/5 shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${colorClasses[card.color].split(' ')[0]}`} onClick={() => setActiveTab(card.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${colorClasses[card.color].split(' ').slice(1).join(' ')}`}><card.icon /></div>
                                        <div><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{card.title}</p><h3 className="text-xl font-black text-white mt-1">{card.subtitle}</h3></div>
                                    </div>
                                    <div className={`text-xs font-bold mt-6 flex items-center gap-1 group-hover:gap-2 transition-all ${colorClasses[card.color].split(' ')[1]}`}>Truy cập ngay <RiArrowLeftLine className="rotate-180" /></div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- SEARCH & FILTER BAR --- */}
                {activeTab !== 'comics' && activeTab !== 'dashboard' && (
                    <div className="bg-[#151525] p-4 rounded-2xl border border-white/5 mb-8 flex flex-col md:flex-row gap-4 items-center shadow-lg animate-fade-in">
                        <div className="flex-1 w-full relative">
                            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input type="text" placeholder={activeTab === 'users' ? "Tìm theo tên, email..." : "Tìm kiếm..."} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl pl-12 pr-10 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600 text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"><RiCloseLine size={18} /></button>}
                        </div>
                        
                        {/* Bộ lọc riêng cho tab Users */}
                        {activeTab === 'users' && (
                            <div className="flex gap-3 w-full md:w-auto animate-fade-in">
                                <div className="relative group">
                                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-[#1f1f3a] border border-white/10 group-hover:border-white/30 text-white text-sm font-bold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-primary appearance-none cursor-pointer transition-all"><option value="all">Tất cả Role</option><option value="admin">Admin</option><option value="user">User</option></select>
                                    <RiFilter3Line className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                </div>
                                <div className="relative group">
                                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#1f1f3a] border border-white/10 group-hover:border-white/30 text-white text-sm font-bold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-primary appearance-none cursor-pointer transition-all"><option value="all">Tất cả Trạng thái</option><option value="active">Hoạt động</option><option value="banned">Bị chặn</option></select>
                                    <RiFilter3Line className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                </div>
                                <button onClick={clearFilters} className="px-5 py-3 bg-white/5 hover:bg-white/10 text-red-400 text-sm font-bold rounded-xl border border-white/5 transition-all hover:border-red-400/30 flex items-center gap-2"><RiCloseLine /> Đặt lại</button>
                                <button onClick={() => fetchData()} className="px-5 py-3 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"><RiSearchLine /> Tìm</button>
                            </div>
                        )}
                    </div>
                )}

                {/* --- DATA TABLE (CHO CÁC TAB TRỪ COMICS & DASHBOARD) --- */}
                {activeTab !== 'comics' && activeTab !== 'dashboard' && (
                    <div className="bg-[#151525] rounded-2xl border border-white/5 overflow-hidden shadow-xl animate-scale-up">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#1f1f3a]/80 text-gray-400 text-xs uppercase font-bold tracking-wider backdrop-blur-sm">
                                        <th className="p-5 border-b border-white/10 w-20">ID</th>
                                        
                                        {/* Headers theo từng tab */}
                                        {activeTab === 'users' && <><th className="p-5 border-b border-white/10">Thông Tin User</th><th className="p-5 border-b border-white/10 text-center">Vai Trò Hiện Tại</th><th className="p-5 border-b border-white/10 text-center">Đổi Vai Trò (Role)</th><th className="p-5 border-b border-white/10 text-center">Trạng Thái</th><th className="p-5 border-b border-white/10 text-center">Cảnh Báo</th></>}
                                        
                                        {activeTab === 'reports' && <><th className="p-5 border-b border-white/10">Chi Tiết Báo Lỗi</th><th className="p-5 border-b border-white/10">Người Báo Cáo</th></>}
                                        
                                        {/* --- HEADERS CHO TAB REPORT COMMENT MỚI --- */}
                                        {activeTab === 'comment_reports' && <><th className="p-5 border-b border-white/10 w-[35%]">Bình Luận Bị Báo Cáo</th><th className="p-5 border-b border-white/10 w-[20%]">Lý Do Vi Phạm</th><th className="p-5 border-b border-white/10">Người Báo Cáo</th></>}
                                        
                                        {activeTab === 'comments' && <><th className="p-5 border-b border-white/10 w-[40%]">Nội Dung Bình Luận</th><th className="p-5 border-b border-white/10">Người Đăng</th><th className="p-5 border-b border-white/10">Tại Truyện</th></>}
                                        
                                        {activeTab === 'quests' && <><th className="p-5 border-b border-white/10">Tên Nhiệm Vụ</th><th className="p-5 border-b border-white/10 text-center">Loại Hành Động</th><th className="p-5 border-b border-white/10 text-center">Chu Kỳ</th><th className="p-5 border-b border-white/10 text-center">Mục Tiêu</th><th className="p-5 border-b border-white/10 text-center">Phần Thưởng</th></>}
                                        
                                        <th className="p-5 border-b border-white/10 text-right">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan="10" className="p-10 text-center"><div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></td></tr>
                                    ) : filteredData.length > 0 ? (
                                        filteredData.map(item => (
                                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors text-sm group">
                                                <td className="p-5 text-gray-500 font-mono">#{item.id}</td>

                                                {/* --- TAB USERS CONTENT --- */}
                                                {activeTab === 'users' && (
                                                    <>
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-3">
                                                                {/* AVATAR ĐÃ ĐƯỢC SỬA ĐỂ HIỂN THỊ ĐÚNG */}
                                                                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                                                    <img src={item.avatar && item.avatar.startsWith('http') ? item.avatar : `https://ui-avatars.com/api/?name=${item.full_name}&background=random`} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div><div className="font-bold text-white text-base">{item.full_name}</div><div className="text-xs text-gray-500 font-medium">@{item.username} | {item.email}</div></div>
                                                            </div>
                                                        </td>
                                                        <td className="p-5 text-center"><span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${item.role === 'admin' ? 'bg-red-500/20 text-red-500 ring-1 ring-red-500/30' : 'bg-blue-500/20 text-blue-500 ring-1 ring-blue-500/30'}`}>{item.role === 'admin' ? <><RiAdminLine className="inline mb-0.5 mr-1"/> ADMIN</> : <><RiUser3Line className="inline mb-0.5 mr-1"/> USER</>}</span></td>
                                                        
                                                        <td className="p-5 text-center">
                                                            <div className="relative inline-block">
                                                                <select value={item.role} onChange={(e) => handleChangeRole(item.id, e.target.value, item.role)} className={`bg-[#252538] border border-white/10 text-white text-xs font-bold rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-primary appearance-none cursor-pointer transition-all hover:border-white/30 ${item.id === currentAdminId ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={item.id === currentAdminId}>
                                                                    <option value="user">Chuyển thành USER</option><option value="admin">Chuyển thành ADMIN</option>
                                                                </select>
                                                                <RiUserStarLine className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                                                            </div>
                                                            {item.id === currentAdminId && <div className="text-[10px] text-gray-500 mt-1 italic">(Bạn)</div>}
                                                        </td>
                                                        
                                                        <td className="p-5 text-center">{item.status === 'banned' ? <span className="inline-flex items-center gap-1 text-red-500 font-bold text-xs bg-red-500/10 px-2 py-1 rounded-lg"><RiProhibitedLine/> BỊ CHẶN</span> : <span className="inline-flex items-center gap-1 text-green-500 font-bold text-xs bg-green-500/10 px-2 py-1 rounded-lg"><RiCheckLine/> HOẠT ĐỘNG</span>}</td>
                                                        <td className="p-5 text-center"><span className={`font-bold ${item.warnings > 0 ? 'text-yellow-500' : 'text-gray-600'}`}>{item.warnings}</span></td>
                                                        <td className="p-5 text-right">
                                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {item.role !== 'admin' && (
                                                                    <>
                                                                        {/* NÚT WARN GỌI MODAL MỚI */}
                                                                        <button onClick={() => openWarnModal(item)} title="Gửi cảnh báo kèm lý do" className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all"><RiErrorWarningLine size={18} /></button>
                                                                        {item.status === 'banned' ? <button onClick={() => handleUnban(item.id)} title="Mở khóa tài khoản" className="p-2.5 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"><RiCheckLine size={18} /></button> : <button onClick={() => openBanModal(item)} title="Chặn tài khoản" className="p-2.5 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-white hover:text-black transition-all"><RiProhibitedLine size={18} /></button>}
                                                                        <button onClick={() => handleDeleteUser(item.id)} title="Xóa người dùng" className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><RiDeleteBinLine size={18} /></button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </>
                                                )}

                                                {/* --- TAB REPORTS CONTENT --- */}
                                                {activeTab === 'reports' && (
                                                     <><td className="p-5"><div className="flex gap-3">{item.comic_image && (<div className="w-12 h-16 bg-white/5 rounded-lg flex-shrink-0 overflow-hidden"><img src={`https://img.otruyenapi.com/uploads/comics/${item.comic_image}`} alt="" className="w-full h-full object-cover opacity-50" onError={(e) => e.target.style.display='none'} /></div>)}<div><div className="font-bold text-white text-base">{item.comic_name || item.comic_slug}</div><div className="text-xs text-primary font-bold mt-0.5">{item.comic_slug} {item.chapter_name && <span className="text-gray-400">| Chương: {item.chapter_name}</span>}</div><div className="mt-2 bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 text-sm italic">"<span className="font-bold">Lý do:</span> {item.reason}"</div></div></div></td><td className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden"><img src={item.avatar?.startsWith('http') ? item.avatar : `https://ui-avatars.com/api/?name=${item.username}&background=random`} alt="" className="w-full h-full object-cover" /></div><div><div className="font-bold text-white">{item.full_name}</div><div className="text-xs text-gray-500">@{item.username}</div><div className="text-[11px] text-gray-600 mt-1 font-medium">{new Date(item.created_at).toLocaleString('vi-VN')}</div></div></div></td><td className="p-5 text-right"><button onClick={() => handleResolveReport(item.id)} className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-500 shadow-lg shadow-green-900/20 transition-all flex items-center gap-2 ml-auto hover:scale-105 active:scale-95"><RiCheckLine size={16}/> Xác nhận đã xử lý</button></td></>
                                                )}

                                                {/* --- TAB COMMENT REPORTS CONTENT --- */}
                                                {activeTab === 'comment_reports' && (
                                                    <>
                                                        <td className="p-5">
                                                            <div className="bg-[#1f1f3a] p-4 rounded-xl border border-white/5 relative group/comment">
                                                                <RiChat1Line className="absolute top-4 left-4 text-gray-600 opacity-20 z-0" size={40}/>
                                                                <div className="relative z-10 pl-2">
                                                                    <p className="text-gray-300 text-sm italic line-clamp-3 leading-relaxed">"{item.comment_content}"</p>
                                                                    <div className="flex items-center gap-2 mt-3 text-xs border-t border-white/5 pt-2">
                                                                        <span className="text-gray-500 font-bold">Tác giả:</span>
                                                                        {item.reported_user_id ? (
                                                                             <Link to={`/profile/${item.reported_user_id}`} className="flex items-center gap-2 hover:bg-white/5 p-1 rounded-lg transition-colors group/author">
                                                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10"><img src={item.reported_user_avatar?.startsWith('http') ? item.reported_user_avatar : `https://ui-avatars.com/api/?name=${item.reported_user_name}&background=random`} alt="" className="w-full h-full object-cover" /></div>
                                                                                <span className="text-blue-400 font-bold group-hover/author:underline">{item.reported_user_name}</span> <span className="text-gray-600">(ID: {item.reported_user_id})</span>
                                                                             </Link>
                                                                        ) : (
                                                                            <span className="text-gray-500 italic">Người dùng đã bị xóa</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-5">
                                                             <span className="inline-block bg-red-500/20 text-red-500 px-3 py-2 rounded-lg font-bold text-sm border border-red-500/20 flex items-center gap-2"><RiFlag2Line /> {item.reason}</span>
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden"><img src={item.reporter_avatar?.startsWith('http') ? item.reporter_avatar : `https://ui-avatars.com/api/?name=${item.reporter_name}&background=random`} alt="" className="w-full h-full object-cover" /></div>
                                                                <div>
                                                                    <div className="font-bold text-white">{item.reporter_name}</div>
                                                                    <div className="text-[11px] text-gray-500 mt-1 font-medium flex items-center gap-1"><RiTimeLine size={12}/> {new Date(item.created_at).toLocaleString('vi-VN')}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-5 text-right">
                                                            <div className="flex justify-end gap-3">
                                                                <button onClick={() => handleResolveCommentReport(item.id, 'delete_comment')} title="Xóa bình luận vi phạm và gửi thông báo" className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"><RiDeleteBinLine size={16} /> Xóa & Thông báo</button>
                                                                <button onClick={() => handleResolveCommentReport(item.id, 'dismiss')} title="Bỏ qua báo cáo này" className="px-4 py-2.5 rounded-xl bg-gray-700 text-gray-300 text-xs font-bold hover:bg-gray-600 hover:text-white transition-all flex items-center gap-2 hover:scale-105 active:scale-95"><RiCloseLine size={16} /> Bỏ qua</button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}

                                                {/* --- TAB COMMENTS CONTENT --- */}
                                                {activeTab === 'comments' && (
                                                    <><td className="p-5"><div className="bg-[#1f1f3a] p-4 rounded-xl border border-white/5"><p className="text-gray-300 text-sm line-clamp-2 font-medium">"{item.content}"</p><div className="text-[10px] text-gray-600 mt-2 font-bold flex items-center gap-1"><RiTimeLine size={12}/> {new Date(item.created_at).toLocaleString('vi-VN')}</div></div></td><td className="p-5"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden"><img src={item.avatar?.startsWith('http') ? item.avatar : `https://ui-avatars.com/api/?name=${item.username}&background=random`} alt="" className="w-full h-full object-cover" /></div><span className="text-sm font-bold text-white">{item.username}</span></div></td><td className="p-5"><span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">{item.comic_slug}</span></td><td className="p-5 text-right"><button onClick={() => handleDeleteComment(item.id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><RiDeleteBinLine size={18} /></button></td></>
                                                )}

                                                {/* --- TAB QUESTS CONTENT --- */}
                                                {activeTab === 'quests' && (
                                                     <><td className="p-5"><div className="font-bold text-white text-base">{item.name}</div><div className="text-xs text-gray-500 font-mono mt-1 bg-white/5 px-2 py-0.5 rounded inline-block">{item.quest_key}</div><div className="text-xs text-gray-400 mt-2 italic">{item.description}</div></td><td className="p-5 text-center"><span className="text-gray-400 uppercase text-[11px] font-black tracking-wider bg-gray-700/50 px-3 py-1.5 rounded-lg">{item.action_type}</span></td><td className="p-5 text-center"><span className={`px-3 py-1.5 rounded-lg text-[11px] uppercase font-black tracking-wider ${item.type === 'daily' ? 'bg-green-500/20 text-green-500 ring-1 ring-green-500/30' : item.type === 'weekly' ? 'bg-blue-500/20 text-blue-500 ring-1 ring-blue-500/30' : 'bg-yellow-500/20 text-yellow-500 ring-1 ring-yellow-500/30'}`}>{item.type === 'daily' ? 'Hàng Ngày' : item.type === 'weekly' ? 'Hàng Tuần' : 'Thành Tựu'}</span></td><td className="p-5 text-center"><span className="text-white font-black text-lg">{item.target_count}</span> <span className="text-gray-500 text-xs font-bold">lần</span></td><td className="p-5 text-center"><span className="text-primary font-black text-lg">+{item.reward_exp}</span> <span className="text-primary/70 text-xs font-bold">XP</span></td><td className="p-5 text-right"><div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openQuestModal(item)} className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><RiEditLine size={18} /></button><button onClick={() => handleDeleteQuest(item.id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><RiDeleteBinLine size={18} /></button></div></td></>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="10" className="p-10 text-center text-gray-500 italic flex flex-col items-center justify-center gap-2"><RiSpamLine size={32} className="text-gray-700"/> Không có dữ liệu nào.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* --- UI PHÂN TRANG --- */}
                        {activeTab === 'users' && totalPages > 1 && (
                            <div className="flex justify-between items-center p-5 bg-[#151525] border-t border-white/5">
                                <div className="text-sm text-gray-500 font-medium">Đang xem trang <span className="font-bold text-white">{currentPage}</span> trên tổng số <span className="font-bold text-white">{totalPages}</span> trang</div>
                                <div className="flex gap-3">
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-4 py-2 rounded-xl border border-white/10 text-sm font-bold transition-all flex items-center gap-1 ${currentPage === 1 ? 'text-gray-600 cursor-not-allowed bg-white/5' : 'text-white hover:bg-white/10 hover:border-white/30 hover:-translate-x-1'}`}><RiArrowLeftLine /> Trang Trước</button>
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-xl border border-white/10 text-sm font-bold transition-all flex items-center gap-1 flex-row-reverse ${currentPage === totalPages ? 'text-gray-600 cursor-not-allowed bg-white/5' : 'text-white hover:bg-white/10 hover:border-white/30 hover:translate-x-1'}`}><RiArrowLeftLine className="rotate-180" /> Trang Sau</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB COMICS CONTENT --- */}
                {activeTab === 'comics' && (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                        <div className="flex flex-col gap-8"><div className="bg-[#151525] p-6 rounded-2xl border border-white/10 h-fit shadow-xl"><h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><RiSave3Line className="text-primary"/> Cấu Hình Truyện</h3><form onSubmit={handleUpdateComic} className="flex flex-col gap-5"><div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Slug Truyện (ID)</label><input type="text" placeholder="VD: one-piece" value={comicForm.slug} onChange={e => setComicForm({ ...comicForm, slug: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white font-medium focus:border-primary outline-none transition-colors" /></div><div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Tên Hiển Thị Tùy Chỉnh</label><input type="text" placeholder="VD: Đảo Hải Tặc (để trống sẽ lấy tên gốc)" value={comicForm.name} onChange={e => setComicForm({ ...comicForm, name: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white font-medium focus:border-primary outline-none transition-colors" /></div><div className="flex gap-6 mt-2"><label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-red-500/30 hover:bg-red-500/5 transition-all"><input type="checkbox" checked={comicForm.is_hidden} onChange={e => setComicForm({ ...comicForm, is_hidden: e.target.checked })} className="accent-red-500 w-5 h-5" /><span className="text-sm font-bold text-red-400 group-hover:text-red-500 transition-colors">Ẩn Truyện Này</span></label><label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all"><input type="checkbox" checked={comicForm.is_recommended} onChange={e => setComicForm({ ...comicForm, is_recommended: e.target.checked })} className="accent-yellow-500 w-5 h-5" /><span className="text-sm font-bold text-yellow-400 group-hover:text-yellow-500 transition-colors">Đề Cử (Hot)</span></label></div><button type="submit" className="mt-4 w-full py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-1"><RiSave3Line size={18} /> Lưu Cấu Hình</button></form></div>
                        <div className="bg-[#151525] p-6 rounded-2xl border border-white/10 shadow-xl"><h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><RiGlobalLine className="text-green-500" /> Tìm Từ Kho Truyện Online</h3><form onSubmit={handleSearchOtruyen} className="flex gap-3 mb-6"><input type="text" placeholder="Nhập tên truyện cần tìm..." value={externalSearch} onChange={(e) => setExternalSearch(e.target.value)} className="flex-1 bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white text-sm font-medium outline-none focus:border-green-500 transition-colors" /><button type="submit" disabled={searchingExternal} className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/40">{searchingExternal ? <RiLoader4Line className="animate-spin" size={20}/> : <RiSearchLine size={20}/>}</button></form><div className="max-h-[400px] overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">{externalResults.length > 0 ? externalResults.map(item => (<div key={item._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all border border-transparent hover:border-white/20 group" onClick={() => selectExternalComic(item)}><div className="flex items-center gap-3 overflow-hidden"><div className="w-10 h-14 bg-black/50 rounded-lg flex-shrink-0 overflow-hidden shadow-md"><img src={`https://img.otruyenapi.com/uploads/comics/${item.thumb_url}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" /></div><div className="min-w-0"><p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{item.name}</p><p className="text-xs text-gray-500 truncate font-mono mt-1">{item.slug}</p></div></div><RiDownloadCloud2Line className="text-gray-500 group-hover:text-primary flex-shrink-0 ml-3 transition-all" size={18} /></div>)) : !searchingExternal && <div className="text-center text-gray-500 text-sm italic py-10 flex flex-col items-center gap-2"><RiSearchLine size={24} className="text-gray-700"/>Nhập tên để tìm kiếm...</div>}</div></div></div>
                        <div className="lg:col-span-2 bg-[#151525] rounded-2xl border border-white/5 overflow-hidden h-fit shadow-xl"><div className="p-5 border-b border-white/10"><h3 className="text-xl font-black text-white flex items-center gap-2"><RiBookmarkLine className="text-purple-500"/> Danh Sách Truyện Đã Cấu Hình <span className="text-sm text-gray-500 font-normal">({managedComics.length})</span></h3></div><table className="w-full text-left border-collapse"><thead><tr className="bg-[#1f1f3a]/80 text-gray-400 text-xs uppercase font-bold tracking-wider backdrop-blur-sm"><th className="p-5 border-b border-white/10">Thông Tin Truyện</th><th className="p-5 border-b border-white/10 text-center">Trạng Thái</th><th className="p-5 border-b border-white/10 text-right">Hành Động</th></tr></thead><tbody className="divide-y divide-white/5">{managedComics.length > 0 ? managedComics.map(c => (<tr key={c.id} className="hover:bg-white/[0.02] transition-colors text-sm group"><td className="p-5"><div className="font-bold text-white text-base">{c.name || c.slug}</div><div className="text-xs text-gray-500 font-mono mt-1 bg-white/5 px-2 py-0.5 rounded inline-block">{c.slug}</div></td><td className="p-5 text-center"><div className="flex items-center justify-center gap-2">{c.is_hidden === 1 && <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-500 text-[10px] font-black uppercase px-2 py-1 rounded-lg ring-1 ring-red-500/30"><RiProhibitedLine/> BỊ ẨN</span>}{c.is_recommended === 1 && <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase px-2 py-1 rounded-lg ring-1 ring-yellow-500/30"><RiStarFill/> ĐỀ CỬ</span>}{c.is_hidden === 0 && c.is_recommended === 0 && <span className="text-gray-500 text-xs font-bold italic">Mặc định</span>}</div></td><td className="p-5 text-right"><button onClick={() => editComic(c)} className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-bold text-xs transition-all flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100"><RiEditLine size={16}/> Sửa Cấu Hình</button></td></tr>)) : <tr><td colSpan="3" className="p-10 text-center text-gray-500 italic">Chưa có truyện nào được cấu hình.</td></tr>}</tbody></table></div>
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}
            
            {/* MODAL BAN (Giữ nguyên) */}
            {showBanModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a1a2e] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-scale-up relative"><button onClick={() => setShowBanModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-1"><RiCloseLine size={24}/></button><h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3"><RiProhibitedLine className="text-red-500" size={28} /> Chặn Người Dùng</h3><p className="text-gray-400 text-sm mb-6">Bạn đang chặn <span className="font-bold text-white">{selectedUser?.username}</span>. Họ sẽ không thể đăng nhập.</p><div className="mb-6"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Thời gian chặn</label><select value={banDays} onChange={(e) => setBanDays(e.target.value)} className="w-full bg-[#252538] border border-white/10 text-white text-sm font-bold rounded-xl p-3 focus:outline-none focus:border-red-500 appearance-none cursor-pointer transition-all"><option value="1">1 Ngày - Cảnh cáo nhẹ</option><option value="3">3 Ngày - Vi phạm lần đầu</option><option value="7">1 Tuần - Vi phạm nghiêm trọng</option><option value="-1">Vĩnh Viễn - Vi phạm đặc biệt nghiêm trọng</option></select></div><div className="flex gap-4"><button onClick={() => setShowBanModal(false)} className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition-all">Hủy Bỏ</button><button onClick={confirmBan} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2"><RiProhibitedLine/> Xác Nhận Chặn</button></div></div>
                </div>
            )}

            {/* MODAL WARN (CẢNH BÁO) - MỚI */}
            {showWarnModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a1a2e] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-scale-up relative">
                        <button onClick={() => setShowWarnModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-1"><RiCloseLine size={24}/></button>
                        <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3"><RiErrorWarningLine className="text-yellow-500" size={28} /> Gửi Cảnh Báo</h3>
                        <p className="text-gray-400 text-sm mb-6">Cảnh báo user <span className="font-bold text-white">{selectedUser?.username}</span>. Họ sẽ nhận được thông báo.</p>
                        
                        <div className="space-y-3 mb-6">
                            <p className="text-sm font-bold text-white uppercase tracking-wider mb-2">Chọn lý do cảnh báo:</p>
                            {['Ngôn từ không phù hợp', 'Spam bình luận', 'Quảng cáo trái phép', 'Xúc phạm thành viên khác', 'Vi phạm quy định chung'].map((reason) => (
                                <label key={reason} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${warnReason === reason ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-[#252538] border-transparent hover:border-white/10 hover:bg-white/5 text-gray-300'}`}>
                                    <input type="radio" name="warnReason" value={reason} checked={warnReason === reason} onChange={(e) => setWarnReason(e.target.value)} className="accent-yellow-500 w-4 h-4" />
                                    <span className="text-sm font-medium">{reason}</span>
                                </label>
                            ))}
                        </div>
                        
                        <div className="flex gap-4">
                            <button onClick={() => setShowWarnModal(false)} className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition-all">Hủy Bỏ</button>
                            <button onClick={confirmWarn} disabled={!warnReason} className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${warnReason ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20 hover:bg-yellow-400' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
                                <RiSendPlaneFill/> Gửi Cảnh Báo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL QUEST (Giữ nguyên) */}
            {showQuestModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1a1a2e] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-scale-up relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-blue-500"></div><button onClick={() => setShowQuestModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-1"><RiCloseLine size={24}/></button><h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><RiTaskLine className="text-green-500" size={28} /> {isEditingQuest ? 'Chỉnh Sửa Nhiệm Vụ' : 'Thêm Nhiệm Vụ Mới'}</h3><form onSubmit={handleSubmitQuest} className="flex flex-col gap-5"><div className="grid grid-cols-2 gap-5"><div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Loại Hành Động</label><select value={questForm.action_type} onChange={e => { const act = e.target.value; setQuestForm({ ...questForm, action_type: act, quest_key: isEditingQuest ? questForm.quest_key : `${act}_${Date.now()}` }) }} disabled={isEditingQuest} className="w-full bg-[#252538] border border-white/10 rounded-xl p-3 text-white text-sm font-bold cursor-pointer focus:border-green-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"><option value="read">Đọc Truyện</option><option value="comment">Bình Luận</option><option value="login">Đăng Nhập</option><option value="streak">Chuỗi (Streak)</option></select></div><div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Mã Key (Tự động)</label><input type="text" disabled value={questForm.quest_key} className="w-full bg-[#1a1a2e] border border-white/5 rounded-xl p-3 text-gray-600 text-sm font-mono italic cursor-not-allowed" /></div></div><div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Tên Nhiệm Vụ</label><input type="text" required placeholder="VD: Đọc 5 chương truyện" value={questForm.name} onChange={e => setQuestForm({ ...questForm, name: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white font-medium focus:border-green-500 outline-none placeholder:text-gray-600" /></div><div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Mô Tả Ngắn</label><input type="text" placeholder="VD: Hoàn thành để nhận thưởng..." value={questForm.description} onChange={e => setQuestForm({ ...questForm, description: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white font-medium focus:border-green-500 outline-none placeholder:text-gray-600" /></div><div className="grid grid-cols-3 gap-5"><div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Mục Tiêu (Lần)</label><input type="number" min="1" required value={questForm.target_count} onChange={e => setQuestForm({ ...questForm, target_count: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white font-black text-center focus:border-green-500 outline-none" /></div><div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Thưởng XP</label><input type="number" min="0" required value={questForm.reward_exp} onChange={e => setQuestForm({ ...questForm, reward_exp: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-primary font-black text-center focus:border-green-500 outline-none" /></div><div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Chu Kỳ Lặp</label><select value={questForm.type} onChange={e => setQuestForm({ ...questForm, type: e.target.value })} className="w-full bg-[#252538] border border-white/10 rounded-xl p-3 text-white text-sm font-bold cursor-pointer focus:border-green-500 outline-none"><option value="daily">Hàng Ngày</option><option value="weekly">Hàng Tuần</option><option value="achievement">Thành Tựu (1 lần)</option></select></div></div><div className="flex gap-4 mt-2"><button type="button" onClick={() => setShowQuestModal(false)} className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition-all">Hủy Bỏ</button><button type="submit" className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-900/20 hover:bg-green-500 hover:shadow-green-900/40 transition-all flex items-center justify-center gap-2"><RiSave3Line size={18} /> {isEditingQuest ? 'Cập Nhật' : 'Tạo Nhiệm Vụ'}</button></div></form></div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;