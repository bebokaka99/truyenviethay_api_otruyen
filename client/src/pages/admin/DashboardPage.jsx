import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
    RiDashboardLine, RiArrowLeftLine, RiDeleteBinLine, 
    RiErrorWarningLine, RiProhibitedLine, RiCheckLine, 
    RiShieldUserLine, RiSearchLine, RiFilter3Line, RiCloseLine,
    RiFlag2Line, RiChat1Line, RiUser3Line, RiBookOpenLine,
    RiTaskLine, RiAddLine, RiEditLine // Icon mới
} from 'react-icons/ri';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('users'); // users | reports | comments | quests
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- State cho bộ lọc & tìm kiếm ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); 
  const [filterStatus, setFilterStatus] = useState('all'); 

  // State Modals
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banDays, setBanDays] = useState(1);

  const [showQuestModal, setShowQuestModal] = useState(false);
  const [isEditingQuest, setIsEditingQuest] = useState(false);
  const [questForm, setQuestForm] = useState({ id: null, quest_key: '', name: '', description: '', target_count: 1, reward_exp: 10, type: 'daily', action_type: 'read' });

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
          else if (activeTab === 'quests') res = await axios.get('/api/quests/admin/all', { headers }); // API QUESTS
          
          setData(res.data);
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
  }, [activeTab]);

  // --- SEARCH LOGIC ---
  const filteredData = useMemo(() => {
      if (!searchTerm && filterRole === 'all' && filterStatus === 'all') return data;
      const lowerSearch = searchTerm.toLowerCase();

      return data.filter(item => {
          if (activeTab === 'users') {
              const matchSearch = item.username.toLowerCase().includes(lowerSearch) || item.email.toLowerCase().includes(lowerSearch);
              const matchRole = filterRole === 'all' || item.role === filterRole;
              const matchStatus = filterStatus === 'all' || item.status === filterStatus;
              return matchSearch && matchRole && matchStatus;
          } 
          else if (activeTab === 'reports') {
              return item.comic_slug.toLowerCase().includes(lowerSearch) || item.reason.toLowerCase().includes(lowerSearch);
          } 
          else if (activeTab === 'comments') {
              return item.content.toLowerCase().includes(lowerSearch) || item.username.toLowerCase().includes(lowerSearch);
          }
          else if (activeTab === 'quests') {
              return item.name.toLowerCase().includes(lowerSearch) || item.quest_key.toLowerCase().includes(lowerSearch);
          }
          return false;
      });
  }, [data, searchTerm, filterRole, filterStatus, activeTab]);

  // --- ACTIONS ---
  const handleDeleteUser = async (id) => {
      if(!window.confirm('Xóa user?')) return;
      try {
          const token = localStorage.getItem('user_token');
          await axios.delete(`/api/user/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setData(prev => prev.filter(u => u.id !== id));
      } catch(e) { alert('Lỗi xóa'); }
  };
  const handleWarn = async (id) => { try { const token = localStorage.getItem('user_token'); await axios.post(`/api/user/admin/users/${id}/warn`, {}, { headers: { Authorization: `Bearer ${token}` } }); alert('Đã cảnh báo'); fetchData(); } catch(e) { alert('Lỗi'); } };
  const handleUnban = async (id) => { try { const token = localStorage.getItem('user_token'); await axios.post(`/api/user/admin/users/${id}/unban`, {}, { headers: { Authorization: `Bearer ${token}` } }); alert('Mở khóa thành công'); fetchData(); } catch(e) { alert('Lỗi'); } };
  const openBanModal = (user) => { setSelectedUser(user); setShowBanModal(true); };
  const confirmBan = async () => { if (!selectedUser) return; try { const token = localStorage.getItem('user_token'); await axios.post(`/api/user/admin/users/${selectedUser.id}/ban`, { days: parseInt(banDays) }, { headers: { Authorization: `Bearer ${token}` } }); alert('Đã chặn'); setShowBanModal(false); fetchData(); } catch(e) { alert('Lỗi'); } };
  
  const handleResolveReport = async (id) => { if(!window.confirm('Xóa báo cáo?')) return; try { const token = localStorage.getItem('user_token'); await axios.delete(`/api/reports/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } }); setData(prev => prev.filter(r => r.id !== id)); } catch(e) { alert('Lỗi'); } };
  const handleDeleteComment = async (id) => { if(!window.confirm('Xóa bình luận?')) return; try { const token = localStorage.getItem('user_token'); await axios.delete(`/api/comments/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } }); setData(prev => prev.filter(c => c.id !== id)); } catch(e) { alert('Lỗi'); } };

  // QUEST ACTIONS
  const handleDeleteQuest = async (id) => {
      if(!window.confirm('Xóa nhiệm vụ này?')) return;
      try {
          const token = localStorage.getItem('user_token');
          await axios.delete(`/api/quests/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setData(prev => prev.filter(q => q.id !== id));
      } catch(e) { alert('Lỗi xóa'); }
  };
  const openQuestModal = (quest = null) => {
      if (quest) { setQuestForm(quest); setIsEditingQuest(true); }
      else { setQuestForm({ id: null, quest_key: '', name: '', description: '', target_count: 1, reward_exp: 10, type: 'daily', action_type: 'read' }); setIsEditingQuest(false); }
      setShowQuestModal(true);
  };
  const handleSubmitQuest = async (e) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('user_token');
          const headers = { Authorization: `Bearer ${token}` };
          if (isEditingQuest) await axios.put(`/api/quests/admin/${questForm.id}`, questForm, { headers });
          else await axios.post('/api/quests/admin', questForm, { headers });
          setShowQuestModal(false); fetchData(); alert('Thành công!');
      } catch (error) { alert(error.response?.data?.message || 'Lỗi'); }
  };

  const clearFilters = () => { setSearchTerm(''); setFilterRole('all'); setFilterStatus('all'); };

  return (
    <div className="min-h-screen bg-[#0a0a16] text-gray-300 font-display flex">
        
        <div className="w-64 bg-[#151525] border-r border-white/5 p-6 flex flex-col gap-6 fixed h-full z-20 overflow-y-auto">
            <h1 className="text-2xl font-black text-white flex items-center gap-2"><RiShieldUserLine className="text-red-500" /> ADMIN</h1>
            <nav className="flex flex-col gap-2">
                <button onClick={() => setActiveTab('users')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'users' ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/5'}`}><RiUser3Line /> Users</button>
                <button onClick={() => setActiveTab('reports')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'reports' ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/5'}`}><RiFlag2Line /> Báo Lỗi</button>
                <button onClick={() => setActiveTab('comments')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'comments' ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-white/5'}`}><RiChat1Line /> Bình Luận</button>
                <button onClick={() => setActiveTab('quests')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'quests' ? 'bg-green-500/20 text-green-500' : 'hover:bg-white/5'}`}><RiTaskLine /> Nhiệm Vụ</button>
            </nav>
            <Link to="/" className="mt-auto flex items-center gap-2 text-sm text-gray-500 hover:text-white"><RiArrowLeftLine /> Về Trang Web</Link>
        </div>

        <div className="flex-1 p-8 ml-64">
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-3xl font-bold text-white capitalize">Quản Lý {activeTab}</h2>
                {activeTab === 'quests' && <button onClick={() => openQuestModal()} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg"><RiAddLine /> Thêm Nhiệm Vụ</button>}
            </div>

            {/* TOOLBAR */}
            <div className="bg-[#151525] p-4 rounded-xl border border-white/5 mb-6 flex items-center shadow-lg">
                <RiSearchLine className="text-gray-500 mr-3" />
                <input type="text" placeholder="Tìm kiếm..." className="bg-transparent border-none focus:outline-none text-white w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                {searchTerm && <button onClick={() => setSearchTerm('')}><RiCloseLine /></button>}
                {activeTab === 'users' && (
                    <>
                       {/* Filter code for users - Giữ nguyên code cũ của bạn ở đây */}
                    </>
                )}
            </div>
            
            {/* TABLE */}
            <div className="bg-[#151525] rounded-xl border border-white/5 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1f1f3a] text-white text-xs uppercase font-bold">
                                <th className="p-4 border-b border-white/10 w-16">ID</th>
                                {activeTab === 'users' && <><th className="p-4 border-b border-white/10">Info</th><th className="p-4 border-b border-white/10">Role</th><th className="p-4 border-b border-white/10">Status</th><th className="p-4 border-b border-white/10">Warns</th></>}
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
                                    
                                    {/* USERS */}
                                    {activeTab === 'users' && (
                                        <>
                                            <td className="p-4"><div className="font-bold text-white">{item.full_name}</div><div className="text-xs text-gray-600">@{item.username}</div></td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${item.role === 'admin' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>{item.role}</span></td>
                                            <td className="p-4">{item.status === 'banned' ? <span className="text-red-500 text-xs font-bold">BỊ CHẶN</span> : <span className="text-green-500 text-xs">Active</span>}</td>
                                            <td className="p-4 text-yellow-500 font-bold">{item.warnings > 0 ? item.warnings : '-'}</td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                {item.role !== 'admin' && (
                                                    <>
                                                        <button onClick={() => handleWarn(item.id)} className="p-2 rounded bg-yellow-500/10 text-yellow-500"><RiErrorWarningLine /></button>
                                                        {item.status === 'banned' ? <button onClick={() => handleUnban(item.id)} className="p-2 rounded bg-green-500/10 text-green-500"><RiCheckLine /></button> : <button onClick={() => openBanModal(item)} className="p-2 rounded bg-gray-700 text-white"><RiProhibitedLine /></button>}
                                                        <button onClick={() => handleDeleteUser(item.id)} className="p-2 rounded bg-red-500/10 text-red-500"><RiDeleteBinLine /></button>
                                                    </>
                                                )}
                                            </td>
                                        </>
                                    )}

                                    {/* REPORTS */}
                                    {activeTab === 'reports' && (
                                        <>
                                            <td className="p-4"><div className="font-bold text-white">{item.comic_slug}</div></td>
                                            <td className="p-4 text-red-400">{item.reason}</td>
                                            <td className="p-4 text-xs text-gray-500">{item.username}<br/>{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 text-right"><button onClick={() => handleResolveReport(item.id)} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded font-bold">Đã Xử Lý</button></td>
                                        </>
                                    )}

                                    {/* COMMENTS */}
                                    {activeTab === 'comments' && (
                                        <>
                                            <td className="p-4"><div className="font-bold text-white max-w-xs truncate">{item.content}</div></td>
                                            <td className="p-4 text-xs text-gray-300">{item.username}</td>
                                            <td className="p-4 text-xs text-primary">{item.comic_slug}</td>
                                            <td className="p-4 text-right"><button onClick={() => handleDeleteComment(item.id)} className="p-2 rounded bg-red-500/10 text-red-500"><RiDeleteBinLine /></button></td>
                                        </>
                                    )}

                                    {/* QUESTS */}
                                    {activeTab === 'quests' && (
                                        <>
                                            <td className="p-4"><div className="font-bold text-white">{item.name}</div><div className="text-[10px] text-gray-500">{item.quest_key}</div></td>
                                            <td className="p-4 text-gray-400 uppercase text-xs font-bold">{item.action_type}</td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${item.type === 'daily' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>{item.type}</span></td>
                                            <td className="p-4 text-white font-bold">{item.target_count}</td>
                                            <td className="p-4 text-primary font-bold">+{item.reward_exp}</td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={() => openQuestModal(item)} className="p-2 rounded bg-blue-500/10 text-blue-500"><RiEditLine /></button>
                                                <button onClick={() => handleDeleteQuest(item.id)} className="p-2 rounded bg-red-500/10 text-red-500"><RiDeleteBinLine /></button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            )) : <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">Không có dữ liệu.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* BAN MODAL */}
        {showBanModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><RiProhibitedLine className="text-red-500" /> Chặn User: {selectedUser?.username}</h3>
                    <select value={banDays} onChange={(e) => setBanDays(e.target.value)} className="w-full bg-[#252538] border border-white/10 text-white p-3 rounded-lg mb-6 focus:outline-none focus:border-red-500">
                        <option value="1">1 Ngày</option><option value="3">3 Ngày</option><option value="7">1 Tuần</option><option value="-1">Vĩnh Viễn</option>
                    </select>
                    <div className="flex gap-3">
                        <button onClick={() => setShowBanModal(false)} className="flex-1 py-2.5 rounded-lg bg-gray-700 text-white font-bold">Hủy</button>
                        <button onClick={confirmBan} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold shadow-lg">Xác Nhận</button>
                    </div>
                </div>
            </div>
        )}

        {/* QUEST MODAL */}
        {showQuestModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">{isEditingQuest ? 'Sửa Nhiệm Vụ' : 'Thêm Nhiệm Vụ'}</h3>
                    <form onSubmit={handleSubmitQuest} className="flex flex-col gap-4">
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Hành Động</label><select value={questForm.action_type || 'read'} onChange={e => { const act = e.target.value; setQuestForm({...questForm, action_type: act, quest_key: isEditingQuest ? questForm.quest_key : `${act}_${Date.now()}` }) }} disabled={isEditingQuest} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white cursor-pointer"><option value="read">Đọc Truyện</option><option value="comment">Bình Luận</option><option value="login">Đăng Nhập</option></select></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Key</label><input type="text" disabled value={questForm.quest_key} className="w-full bg-[#1a1a2e] border border-white/10 rounded p-2 text-gray-500" /></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Tên</label><input type="text" required value={questForm.name} onChange={e => setQuestForm({...questForm, name: e.target.value})} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white" /></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Mô tả</label><input type="text" value={questForm.description} onChange={e => setQuestForm({...questForm, description: e.target.value})} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs text-gray-500 font-bold uppercase">Mục Tiêu</label><input type="number" min="1" value={questForm.target_count} onChange={e => setQuestForm({...questForm, target_count: e.target.value})} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white" /></div>
                            <div><label className="text-xs text-gray-500 font-bold uppercase">Thưởng XP</label><input type="number" min="0" value={questForm.reward_exp} onChange={e => setQuestForm({...questForm, reward_exp: e.target.value})} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white" /></div>
                        </div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Chu Kỳ</label><select value={questForm.type} onChange={e => setQuestForm({...questForm, type: e.target.value})} className="w-full bg-[#252538] border border-white/10 rounded p-2 text-white cursor-pointer"><option value="daily">Ngày</option><option value="weekly">Tuần</option><option value="achievement">Thành Tựu</option></select></div>
                        <div className="flex gap-3 mt-4"><button type="button" onClick={() => setShowQuestModal(false)} className="flex-1 py-2.5 rounded-lg bg-gray-700 text-white font-bold">Hủy</button><button type="submit" className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-bold shadow-lg">Lưu</button></div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default DashboardPage;