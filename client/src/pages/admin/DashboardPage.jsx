import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
    RiDashboardLine, RiArrowLeftLine, RiDeleteBinLine, 
    RiErrorWarningLine, RiProhibitedLine, RiCheckLine, 
    RiShieldUserLine, RiSearchLine, RiFilter3Line, RiCloseLine,
    RiFlag2Line, RiChat1Line, RiUser3Line, RiBookOpenLine,
    RiTaskLine, RiAddLine, RiEditLine, 
    RiBookmarkLine, // <--- ĐÃ SỬA TÊN ĐÚNG (m thường)
    RiEyeOffLine, RiStarLine, RiSave3Line, 
    RiGlobalLine, RiDownloadCloud2Line
} from 'react-icons/ri';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- State chung ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); 
  const [filterStatus, setFilterStatus] = useState('all'); 

  // --- Modals ---
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banDays, setBanDays] = useState(1);

  const [showQuestModal, setShowQuestModal] = useState(false);
  const [isEditingQuest, setIsEditingQuest] = useState(false);
  const [questForm, setQuestForm] = useState({ id: null, quest_key: '', name: '', description: '', target_count: 1, reward_exp: 10, type: 'daily', action_type: 'read' });

  // --- COMIC MANAGEMENT ---
  const [managedComics, setManagedComics] = useState([]);
  const [comicForm, setComicForm] = useState({ slug: '', name: '', is_hidden: false, is_recommended: false });
  
  // State tìm kiếm từ nguồn Otruyen
  const [externalSearch, setExternalSearch] = useState('');
  const [externalResults, setExternalResults] = useState([]);
  const [searchingExternal, setSearchingExternal] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
      setLoading(true);
      try {
          const token = localStorage.getItem('user_token');
          const headers = { Authorization: `Bearer ${token}` };
          let res;

          if (activeTab === 'users') res = await axios.get('/api/user/admin/users', { headers });
          else if (activeTab === 'reports') res = await axios.get('/api/reports/admin/all', { headers });
          else if (activeTab === 'comments') res = await axios.get('/api/comments/admin/all', { headers });
          else if (activeTab === 'quests') res = await axios.get('/api/quests/admin/all', { headers });
          else if (activeTab === 'comics') res = await axios.get('/api/user/admin/comics', { headers });
          
          if (activeTab === 'comics') setManagedComics(res.data);
          else setData(res.data);

      } catch (error) { 
          console.error("Lỗi load data:", error); 
          if(error.response?.status === 403) alert("Bạn không có quyền truy cập!");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
      setSearchTerm('');
      setExternalResults([]); // Reset tìm kiếm ngoài khi đổi tab
      setExternalSearch('');
  }, [activeTab]);

  // --- LOGIC LỌC ---
  const filteredData = useMemo(() => {
      if (!searchTerm && filterRole === 'all' && filterStatus === 'all') return data;
      const lowerSearch = searchTerm.toLowerCase();

      return data.filter(item => {
          if (activeTab === 'users') {
              const matchSearch = item.username.toLowerCase().includes(lowerSearch) || item.email.toLowerCase().includes(lowerSearch) || (item.full_name && item.full_name.toLowerCase().includes(lowerSearch));
              const matchRole = filterRole === 'all' || item.role === filterRole;
              const matchStatus = filterStatus === 'all' || item.status === filterStatus;
              return matchSearch && matchRole && matchStatus;
          } 
          else if (activeTab === 'reports') { return item.comic_slug.toLowerCase().includes(lowerSearch) || item.reason.toLowerCase().includes(lowerSearch); } 
          else if (activeTab === 'comments') { return item.content.toLowerCase().includes(lowerSearch) || item.username.toLowerCase().includes(lowerSearch) || item.comic_slug.toLowerCase().includes(lowerSearch); }
          else if (activeTab === 'quests') { return item.name.toLowerCase().includes(lowerSearch) || item.quest_key.toLowerCase().includes(lowerSearch); }
          return false;
      });
  }, [data, searchTerm, filterRole, filterStatus, activeTab]);

  // --- ACTIONS USER/REPORT/COMMENT (Giữ nguyên) ---
  const handleDeleteUser = async (id) => { if(!window.confirm('Xóa user?')) return; try { const token = localStorage.getItem('user_token'); await axios.delete(`/api/user/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }); setData(prev => prev.filter(u => u.id !== id)); } catch(e) { alert('Lỗi xóa'); } };
  const handleWarn = async (id) => { try { const token = localStorage.getItem('user_token'); await axios.post(`/api/user/admin/users/${id}/warn`, {}, { headers: { Authorization: `Bearer ${token}` } }); alert('Đã cảnh báo'); fetchData(); } catch(e) { alert('Lỗi'); } };
  const handleUnban = async (id) => { if(!window.confirm('Mở khóa?')) return; try { const token = localStorage.getItem('user_token'); await axios.post(`/api/user/admin/users/${id}/unban`, {}, { headers: { Authorization: `Bearer ${token}` } }); alert('Đã mở khóa!'); fetchData(); } catch(e) { alert('Lỗi'); } }
  const openBanModal = (user) => { setSelectedUser(user); setShowBanModal(true); };
  const confirmBan = async () => { if (!selectedUser) return; try { const token = localStorage.getItem('user_token'); await axios.post(`/api/user/admin/users/${selectedUser.id}/ban`, { days: parseInt(banDays) }, { headers: { Authorization: `Bearer ${token}` } }); alert('Đã chặn!'); setShowBanModal(false); fetchData(); } catch(e) { alert('Lỗi'); } };
  const handleResolveReport = async (id) => { if(!window.confirm('Xóa báo cáo?')) return; try { const token = localStorage.getItem('user_token'); await axios.delete(`/api/reports/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } }); setData(prev => prev.filter(r => r.id !== id)); } catch(e) { alert('Lỗi'); } };
  const handleDeleteComment = async (id) => { if(!window.confirm('Xóa bình luận?')) return; try { const token = localStorage.getItem('user_token'); await axios.delete(`/api/comments/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } }); setData(prev => prev.filter(c => c.id !== id)); } catch(e) { alert('Lỗi'); } };
  const handleDeleteQuest = async (id) => { if(!window.confirm('Xóa nhiệm vụ?')) return; try { const token = localStorage.getItem('user_token'); await axios.delete(`/api/quests/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } }); setData(prev => prev.filter(q => q.id !== id)); } catch(e) { alert('Lỗi'); } };

  // --- QUEST ACTIONS ---
  const openQuestModal = (quest = null) => { if (quest) { setQuestForm(quest); setIsEditingQuest(true); } else { setQuestForm({ id: null, quest_key: '', name: '', description: '', target_count: 1, reward_exp: 10, type: 'daily', action_type: 'read' }); setIsEditingQuest(false); } setShowQuestModal(true); };
  const handleSubmitQuest = async (e) => { e.preventDefault(); try { const token = localStorage.getItem('user_token'); const headers = { Authorization: `Bearer ${token}` }; if (isEditingQuest) await axios.put(`/api/quests/admin/${questForm.id}`, questForm, { headers }); else await axios.post('/api/quests/admin', questForm, { headers }); setShowQuestModal(false); fetchData(); alert('Thành công!'); } catch (error) { alert(error.response?.data?.message || 'Lỗi'); } };

  // --- COMIC ACTIONS (NÂNG CẤP) ---
  const handleSearchOtruyen = async (e) => {
      e.preventDefault();
      if (!externalSearch.trim()) return;
      setSearchingExternal(true);
      try {
          // Gọi trực tiếp API Otruyen
          const res = await axios.get(`https://otruyenapi.com/v1/api/tim-kiem?keyword=${externalSearch}`);
          setExternalResults(res.data.data.items);
      } catch (error) { console.error(error); alert("Lỗi kết nối Otruyen"); }
      finally { setSearchingExternal(false); }
  };

  const selectExternalComic = (comic) => {
      // Khi chọn truyện từ nguồn -> Điền vào form
      setComicForm({
          slug: comic.slug,
          name: comic.name,
          is_hidden: false,
          is_recommended: false
      });
      setExternalResults([]); // Ẩn kết quả tìm kiếm đi cho gọn
      setExternalSearch('');
  };

  const handleUpdateComic = async (e) => {
      e.preventDefault();
      if (!comicForm.slug) return alert("Chưa nhập Slug!");
      try {
          const token = localStorage.getItem('user_token');
          await axios.post('/api/user/admin/comics', comicForm, { headers: { Authorization: `Bearer ${token}` } });
          alert("Cập nhật thành công!");
          fetchData(); // Refresh list
          setComicForm({ slug: '', name: '', is_hidden: false, is_recommended: false });
      } catch (error) { alert("Lỗi cập nhật"); }
  };

  const editComic = (comic) => {
      setComicForm({
          slug: comic.slug,
          name: comic.name,
          is_hidden: comic.is_hidden === 1,
          is_recommended: comic.is_recommended === 1
      });
  };

  const clearFilters = () => { setSearchTerm(''); setFilterRole('all'); setFilterStatus('all'); };

  return (
    <div className="min-h-screen bg-[#0a0a16] text-gray-300 font-display flex">
        
        {/* SIDEBAR */}
        <div className="w-64 bg-[#151525] border-r border-white/5 p-6 flex flex-col gap-6 fixed h-full z-20 overflow-y-auto">
            <h1 className="text-2xl font-black text-white flex items-center gap-2"><RiShieldUserLine className="text-red-500" /> ADMIN</h1>
            <nav className="flex flex-col gap-2">
                <button onClick={() => setActiveTab('users')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'users' ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/5'}`}><RiUser3Line /> Users</button>
                <button onClick={() => setActiveTab('reports')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'reports' ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/5'}`}><RiFlag2Line /> Báo Lỗi</button>
                <button onClick={() => setActiveTab('comments')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'comments' ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-white/5'}`}><RiChat1Line /> Bình Luận</button>
                <button onClick={() => setActiveTab('quests')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'quests' ? 'bg-green-500/20 text-green-500' : 'hover:bg-white/5'}`}><RiTaskLine /> Nhiệm Vụ</button>
                <button onClick={() => setActiveTab('comics')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'comics' ? 'bg-purple-500/20 text-purple-500' : 'hover:bg-white/5'}`}>
                    {/* ICON ĐÃ SỬA */}
                    <RiBookmarkLine /> Truyện
                </button>
            </nav>
            <Link to="/" className="mt-auto flex items-center gap-2 text-sm text-gray-500 hover:text-white"><RiArrowLeftLine /> Về Trang Web</Link>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-8 ml-64">
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-3xl font-bold text-white capitalize">Quản Lý {activeTab}</h2>
                {activeTab === 'quests' && <button onClick={() => openQuestModal()} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all shadow-lg"><RiAddLine /> Thêm Mới</button>}
            </div>

            {/* TOOLBAR (Ẩn ở tab Comics vì nó có toolbar riêng) */}
            {activeTab !== 'comics' && (
                <div className="bg-[#151525] p-4 rounded-xl border border-white/5 mb-6 flex flex-col md:flex-row gap-4 items-center shadow-lg">
                    <div className="flex-1 w-full relative">
                        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="Tìm kiếm..." className="w-full bg-[#1f1f3a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><RiCloseLine /></button>}
                    </div>
                    {activeTab === 'users' && (
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative"><select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-[#1f1f3a] border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:border-red-500 appearance-none cursor-pointer"><option value="all">Tất cả Role</option><option value="admin">Admin</option><option value="user">User</option></select><RiFilter3Line className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14}/></div>
                            <div className="relative"><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#1f1f3a] border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:border-red-500 appearance-none cursor-pointer"><option value="all">Tất cả Trạng thái</option><option value="active">Hoạt động</option><option value="banned">Bị chặn</option></select><RiFilter3Line className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14}/></div>
                            {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && <button onClick={clearFilters} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-red-400 text-sm font-bold rounded-lg border border-white/5 transition-colors">Xóa Lọc</button>}
                        </div>
                    )}
                </div>
            )}
            
            {/* TAB COMICS (GIAO DIỆN RIÊNG) */}
            {activeTab === 'comics' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Cột Trái: Cấu hình + Tìm kiếm nguồn */}
                    <div className="flex flex-col gap-8">
                        
                        {/* 1. Form Cấu Hình (Edit/Add) */}
                        <div className="bg-[#151525] p-6 rounded-xl border border-white/10 h-fit">
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Cấu Hình Truyện</h3>
                            <form onSubmit={handleUpdateComic} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Slug Truyện</label>
                                    <input 
                                        type="text" 
                                        placeholder="VD: one-piece" 
                                        value={comicForm.slug}
                                        onChange={e => setComicForm({...comicForm, slug: e.target.value})}
                                        className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white mt-1 focus:border-primary outline-none"
                                    />
                                    <p className="text-[10px] text-gray-600 mt-1">Lấy từ URL truyện.</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tên Gợi Nhớ</label>
                                    <input 
                                        type="text" 
                                        placeholder="VD: Đảo Hải Tặc" 
                                        value={comicForm.name}
                                        onChange={e => setComicForm({...comicForm, name: e.target.value})}
                                        className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white mt-1 focus:border-primary outline-none"
                                    />
                                </div>
                                
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={comicForm.is_hidden} 
                                            onChange={e => setComicForm({...comicForm, is_hidden: e.target.checked})}
                                            className="accent-red-500 w-4 h-4"
                                        />
                                        <span className="text-sm font-bold text-red-400">Ẩn Truyện</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={comicForm.is_recommended} 
                                            onChange={e => setComicForm({...comicForm, is_recommended: e.target.checked})}
                                            className="accent-yellow-500 w-4 h-4"
                                        />
                                        <span className="text-sm font-bold text-yellow-400">Đề Cử (Hot)</span>
                                    </label>
                                </div>

                                <button type="submit" className="mt-2 w-full py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                                    <RiSave3Line /> Lưu Cấu Hình
                                </button>
                            </form>
                        </div>

                        {/* 2. Tìm kiếm từ Nguồn (Otruyen) */}
                        <div className="bg-[#151525] p-6 rounded-xl border border-white/10">
                             <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                                <RiGlobalLine className="text-green-500"/> Tìm Từ Kho Truyện
                             </h3>
                             <form onSubmit={handleSearchOtruyen} className="flex gap-2 mb-4">
                                 <input 
                                    type="text" 
                                    placeholder="Nhập tên truyện..." 
                                    value={externalSearch}
                                    onChange={(e) => setExternalSearch(e.target.value)}
                                    className="flex-1 bg-[#252538] border border-white/10 rounded p-2 text-white text-sm outline-none"
                                 />
                                 <button type="submit" disabled={searchingExternal} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded">{searchingExternal ? '...' : <RiSearchLine />}</button>
                             </form>
                             
                             {/* Kết quả tìm kiếm */}
                             <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                                 {externalResults.map(item => (
                                     <div key={item._id} className="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer" onClick={() => selectExternalComic(item)}>
                                         <div className="flex items-center gap-2 overflow-hidden">
                                             <div className="w-8 h-10 bg-black/50 rounded flex-shrink-0 overflow-hidden">
                                                <img src={`https://otruyenapi.com/uploads/comics/${item.thumb_url}`} className="w-full h-full object-cover" alt=""/>
                                             </div>
                                             <div className="min-w-0">
                                                 <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                                 <p className="text-[10px] text-gray-500 truncate">{item.slug}</p>
                                             </div>
                                         </div>
                                         <RiDownloadCloud2Line className="text-primary flex-shrink-0 ml-2" />
                                     </div>
                                 ))}
                                 {externalResults.length === 0 && !searchingExternal && <p className="text-center text-gray-600 text-xs italic">Nhập tên để tìm...</p>}
                             </div>
                        </div>
                    </div>

                    {/* Cột Phải: Danh sách đã quản lý */}
                    <div className="lg:col-span-2 bg-[#151525] rounded-xl border border-white/5 overflow-hidden h-fit">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#1f1f3a] text-white text-xs uppercase font-bold">
                                    <th className="p-4 border-b border-white/10">Slug / Tên</th>
                                    <th className="p-4 border-b border-white/10 text-center">Trạng Thái</th>
                                    <th className="p-4 border-b border-white/10 text-right">Sửa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {managedComics.map(c => (
                                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 text-sm">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{c.name || c.slug}</div>
                                            <div className="text-xs text-gray-500">{c.slug}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {c.is_hidden === 1 && <span className="inline-block bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-1 rounded mr-2">BỊ ẨN</span>}
                                            {c.is_recommended === 1 && <span className="inline-block bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded">ĐỀ CỬ</span>}
                                            {c.is_hidden === 0 && c.is_recommended === 0 && <span className="text-gray-500 text-xs">Bình thường</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => editComic(c)} className="text-blue-500 hover:text-white font-bold text-xs underline">Sửa</button>
                                        </td>
                                    </tr>
                                ))}
                                {managedComics.length === 0 && <tr><td colSpan="3" className="p-6 text-center text-gray-500 italic">Chưa có dữ liệu.</td></tr>}
                            </tbody>
                        </table>
                    </div>

                </div>
            )}
            
            {/* TABLE FOR OTHER TABS */}
            {activeTab !== 'comics' && (
                <div className="bg-[#151525] rounded-xl border border-white/5 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#1f1f3a] text-white text-xs uppercase font-bold">
                                    <th className="p-4 border-b border-white/10 w-16">ID</th>
                                    {activeTab === 'users' && <><th className="p-4 border-b border-white/10">User Info</th><th className="p-4 border-b border-white/10 text-center">Role</th><th className="p-4 border-b border-white/10 text-center">Status</th><th className="p-4 border-b border-white/10 text-center">Warns</th></>}
                                    {activeTab === 'reports' && <><th className="p-4 border-b border-white/10">Truyện</th><th className="p-4 border-b border-white/10">Lý Do</th><th className="p-4 border-b border-white/10">Reporter</th></>}
                                    {activeTab === 'comments' && <><th className="p-4 border-b border-white/10">Nội Dung</th><th className="p-4 border-b border-white/10">User</th><th className="p-4 border-b border-white/10">Truyện</th></>}
                                    {activeTab === 'quests' && <><th className="p-4 border-b border-white/10">Tên</th><th className="p-4 border-b border-white/10">Action</th><th className="p-4 border-b border-white/10">Chu Kỳ</th><th className="p-4 border-b border-white/10">Mục Tiêu</th><th className="p-4 border-b border-white/10">XP</th></>}
                                    <th className="p-4 border-b border-white/10 text-right">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? filteredData.map(item => (
                                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                                        <td className="p-4 text-gray-500">#{item.id}</td>
                                        
                                        {/* TAB USERS */}
                                        {activeTab === 'users' && (
                                            <>
                                                <td className="p-4"><div className="font-bold text-white">{item.full_name}</div><div className="text-xs text-gray-600">@{item.username}</div></td>
                                                <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.role === 'admin' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>{item.role}</span></td>
                                                <td className="p-4 text-center">{item.status === 'banned' ? <span className="text-red-500 font-bold text-xs">BỊ CHẶN</span> : <span className="text-green-500 font-bold text-xs">Active</span>}</td>
                                                <td className="p-4 text-center text-yellow-500 font-bold">{item.warnings > 0 ? item.warnings : '-'}</td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    {item.role !== 'admin' && (
                                                        <>
                                                            <button onClick={() => handleWarn(item.id)} title="Warn" className="p-2 rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black"><RiErrorWarningLine /></button>
                                                            {item.status === 'banned' ? <button onClick={() => handleUnban(item.id)} className="p-2 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"><RiCheckLine /></button> : <button onClick={() => openBanModal(item)} className="p-2 rounded bg-gray-700 hover:bg-white hover:text-black"><RiProhibitedLine /></button>}
                                                            <button onClick={() => handleDeleteUser(item.id)} className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"><RiDeleteBinLine /></button>
                                                        </>
                                                    )}
                                                </td>
                                            </>
                                        )}

                                        {/* TAB REPORTS */}
                                        {activeTab === 'reports' && (
                                            <>
                                                <td className="p-4"><div className="font-bold text-white">{item.comic_slug}</div><div className="text-xs text-gray-400">{item.chapter_name}</div></td>
                                                <td className="p-4 text-red-400 font-bold">{item.reason}</td>
                                                <td className="p-4 text-xs text-gray-500">{item.username}<br/>{new Date(item.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 text-right"><button onClick={() => handleResolveReport(item.id)} className="px-3 py-1.5 rounded bg-green-600 text-white text-xs font-bold hover:bg-green-500">Đã Xử Lý</button></td>
                                            </>
                                        )}

                                        {/* TAB COMMENTS */}
                                        {activeTab === 'comments' && (
                                            <>
                                                <td className="p-4"><div className="font-bold text-white max-w-xs truncate">{item.content}</div></td>
                                                <td className="p-4 text-xs text-gray-300">{item.username}</td>
                                                <td className="p-4 text-xs text-primary truncate max-w-[100px]">{item.comic_slug}</td>
                                                <td className="p-4 text-right"><button onClick={() => handleDeleteComment(item.id)} className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"><RiDeleteBinLine /></button></td>
                                            </>
                                        )}

                                        {/* TAB QUESTS */}
                                        {activeTab === 'quests' && (
                                            <>
                                                <td className="p-4"><div className="font-bold text-white">{item.name}</div><div className="text-[10px] text-gray-500">{item.quest_key}</div></td>
                                                <td className="p-4 text-gray-400 uppercase text-xs font-bold">{item.action_type}</td>
                                                <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${item.type === 'daily' ? 'bg-green-500/20 text-green-500' : item.type === 'weekly' ? 'bg-blue-500/20 text-blue-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{item.type}</span></td>
                                                <td className="p-4 text-white font-bold">{item.target_count}</td>
                                                <td className="p-4 text-primary font-bold">+{item.reward_exp}</td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <button onClick={() => openQuestModal(item)} className="p-2 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white"><RiEditLine /></button>
                                                    <button onClick={() => handleDeleteQuest(item.id)} className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"><RiDeleteBinLine /></button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                )) : <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">Không có dữ liệu.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

        {/* BAN MODAL */}
        {showBanModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-scale-up">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><RiProhibitedLine className="text-red-500" /> Chặn User: {selectedUser?.username}</h3>
                    <select value={banDays} onChange={(e) => setBanDays(e.target.value)} className="w-full bg-[#252538] border border-white/10 text-white p-3 rounded-lg mb-6 focus:outline-none focus:border-red-500">
                        <option value="1">1 Ngày</option><option value="3">3 Ngày</option><option value="7">1 Tuần</option><option value="-1">Vĩnh Viễn</option>
                    </select>
                    <div className="flex gap-3">
                        <button onClick={() => setShowBanModal(false)} className="flex-1 py-2.5 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600">Hủy</button>
                        <button onClick={confirmBan} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-900/30">Xác Nhận</button>
                    </div>
                </div>
            </div>
        )}

        {/* QUEST MODAL */}
        {showQuestModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-scale-up">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">{isEditingQuest ? 'Sửa Nhiệm Vụ' : 'Thêm Nhiệm Vụ'}</h3>
                    <form onSubmit={handleSubmitQuest} className="flex flex-col gap-4">
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Hành Động</label><select value={questForm.action_type} onChange={e => { const act = e.target.value; setQuestForm({...questForm, action_type: act, quest_key: isEditingQuest ? questForm.quest_key : `${act}_${Date.now()}` }) }} disabled={isEditingQuest} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white cursor-pointer"><option value="read">Đọc Truyện</option><option value="comment">Bình Luận</option><option value="login">Đăng Nhập</option></select></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Key</label><input type="text" disabled value={questForm.quest_key} className="w-full bg-[#1a1a2e] border border-white/10 rounded p-2 text-gray-500" /></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Tên</label><input type="text" required value={questForm.name} onChange={e => setQuestForm({...questForm, name: e.target.value})} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white" /></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Mô tả</label><input type="text" value={questForm.description} onChange={e => setQuestForm({...questForm, description: e.target.value})} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white" /></div>
                        <div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-gray-500 font-bold uppercase">Mục Tiêu</label><input type="number" min="1" value={questForm.target_count} onChange={e => setQuestForm({...questForm, target_count: e.target.value})} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white" /></div><div><label className="text-xs text-gray-500 font-bold uppercase">Thưởng XP</label><input type="number" min="0" value={questForm.reward_exp} onChange={e => setQuestForm({...questForm, reward_exp: e.target.value})} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white" /></div></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Chu Kỳ</label><select value={questForm.type} onChange={e => setQuestForm({...questForm, type: e.target.value})} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white cursor-pointer"><option value="daily">Hàng Ngày</option><option value="weekly">Hàng Tuần</option><option value="achievement">Thành Tựu</option></select></div>
                        <div className="flex gap-3 mt-4"><button type="button" onClick={() => setShowQuestModal(false)} className="flex-1 py-2.5 rounded-lg bg-gray-700 text-white font-bold">Hủy</button><button type="submit" className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-bold shadow-lg">Lưu</button></div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default DashboardPage;