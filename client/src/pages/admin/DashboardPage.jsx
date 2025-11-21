import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
    RiDashboardLine, RiArrowLeftLine, RiDeleteBinLine, 
    RiShieldUserLine, RiSearchLine, RiCloseLine,
    RiFlag2Line, RiChat1Line, RiUser3Line, 
    RiCheckLine, RiTimeLine, RiBookOpenLine, RiProhibitedLine, RiErrorWarningLine
} from 'react-icons/ri';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('users'); // users | reports | comments
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State cho User Actions
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banDays, setBanDays] = useState(1);

  // --- FETCH DATA ---
  const fetchData = async () => {
      setLoading(true);
      try {
          const token = localStorage.getItem('user_token');
          const headers = { Authorization: `Bearer ${token}` };
          let res;

          if (activeTab === 'users') {
              res = await axios.get('/api/user/admin/users', { headers });
          } else if (activeTab === 'reports') {
              res = await axios.get('/api/reports/admin/all', { headers });
          } else if (activeTab === 'comments') {
              res = await axios.get('/api/comments/admin/all', { headers });
          }
          
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
      if (!searchTerm) return data;
      const lowerSearch = searchTerm.toLowerCase();

      return data.filter(item => {
          if (activeTab === 'users') {
              return item.username.toLowerCase().includes(lowerSearch) || item.email.toLowerCase().includes(lowerSearch);
          } else if (activeTab === 'reports') {
              return item.comic_slug.toLowerCase().includes(lowerSearch) || item.reason.toLowerCase().includes(lowerSearch);
          } else if (activeTab === 'comments') {
              return item.content.toLowerCase().includes(lowerSearch) || item.username.toLowerCase().includes(lowerSearch);
          }
          return false;
      });
  }, [data, searchTerm, activeTab]);

  // --- ACTIONS USER ---
  const handleDeleteUser = async (id) => {
      if(!window.confirm('Xóa user này?')) return;
      try {
          const token = localStorage.getItem('user_token');
          await axios.delete(`/api/user/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setData(prev => prev.filter(u => u.id !== id));
      } catch(e) { alert('Lỗi xóa'); }
  };

  const handleWarn = async (id) => {
      try {
          const token = localStorage.getItem('user_token');
          await axios.post(`/api/user/admin/users/${id}/warn`, {}, { headers: { Authorization: `Bearer ${token}` } });
          alert('Đã cảnh báo!');
          fetchData(); 
      } catch(e) { alert('Lỗi'); }
  };

  const handleUnban = async (id) => {
      if(!window.confirm('Mở khóa?')) return;
      try {
        const token = localStorage.getItem('user_token');
        await axios.post(`/api/user/admin/users/${id}/unban`, {}, { headers: { Authorization: `Bearer ${token}` } });
        alert('Đã mở khóa!');
        fetchData();
      } catch(e) { alert('Lỗi'); }
  }

  const openBanModal = (user) => { setSelectedUser(user); setShowBanModal(true); };
  const confirmBan = async () => {
      if (!selectedUser) return;
      try {
          const token = localStorage.getItem('user_token');
          await axios.post(`/api/user/admin/users/${selectedUser.id}/ban`, { days: parseInt(banDays) }, { headers: { Authorization: `Bearer ${token}` } });
          alert('Đã chặn!');
          setShowBanModal(false);
          fetchData();
      } catch(e) { alert('Lỗi'); }
  };

  // --- ACTIONS REPORT & COMMENT ---
  const handleResolveReport = async (id) => {
      if(!window.confirm('Xóa báo cáo này?')) return;
      try {
          const token = localStorage.getItem('user_token');
          await axios.delete(`/api/reports/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setData(prev => prev.filter(r => r.id !== id));
      } catch(e) { alert('Lỗi'); }
  };

  const handleDeleteComment = async (id) => {
      if(!window.confirm('Xóa bình luận này?')) return;
      try {
          const token = localStorage.getItem('user_token');
          await axios.delete(`/api/comments/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setData(prev => prev.filter(c => c.id !== id));
      } catch(e) { alert('Lỗi'); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a16] text-gray-300 font-display flex">
        
        {/* SIDEBAR */}
        <div className="w-64 bg-[#151525] border-r border-white/5 p-6 flex flex-col gap-6 fixed h-full z-20">
            <h1 className="text-2xl font-black text-white flex items-center gap-2"><RiShieldUserLine className="text-red-500" /> ADMIN</h1>
            <nav className="flex flex-col gap-2">
                <button onClick={() => setActiveTab('users')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'users' ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/5'}`}>
                    <RiUser3Line /> Users
                </button>
                <button onClick={() => setActiveTab('reports')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'reports' ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/5'}`}>
                    <RiFlag2Line /> Báo Lỗi
                </button>
                <button onClick={() => setActiveTab('comments')} className={`px-4 py-3 rounded-lg font-bold cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'comments' ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-white/5'}`}>
                    <RiChat1Line /> Bình Luận
                </button>
            </nav>
            <Link to="/" className="mt-auto flex items-center gap-2 text-sm text-gray-500 hover:text-white"><RiArrowLeftLine /> Về Trang Web</Link>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-8 ml-64">
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-3xl font-bold text-white capitalize">Quản Lý {activeTab}</h2>
            </div>

            {/* TOOLBAR */}
            <div className="bg-[#151525] p-4 rounded-xl border border-white/5 mb-6 flex items-center shadow-lg">
                <RiSearchLine className="text-gray-500 mr-3" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    className="bg-transparent border-none focus:outline-none text-white w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && <button onClick={() => setSearchTerm('')}><RiCloseLine /></button>}
            </div>
            
            {/* TABLE */}
            <div className="bg-[#151525] rounded-xl border border-white/5 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1f1f3a] text-white text-xs uppercase font-bold">
                                <th className="p-4 border-b border-white/10 w-16">ID</th>
                                <th className="p-4 border-b border-white/10">Nội Dung</th>
                                <th className="p-4 border-b border-white/10">Thông Tin</th>
                                <th className="p-4 border-b border-white/10 text-right">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map(item => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 text-sm">
                                    <td className="p-4 text-gray-500">#{item.id}</td>
                                    
                                    {/* 1. TAB USERS */}
                                    {activeTab === 'users' && (
                                        <>
                                            <td className="p-4">
                                                <div className="font-bold text-white">{item.full_name}</div>
                                                <div className="text-xs text-gray-600">@{item.username}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${item.role === 'admin' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>{item.role}</div>
                                                <div className="mt-1 text-xs text-gray-500">Warns: {item.warnings}</div>
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                {item.role !== 'admin' && (
                                                    <>
                                                        <button onClick={() => handleWarn(item.id)} className="p-2 rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black"><RiErrorWarningLine /></button>
                                                        {item.status === 'banned' ? (
                                                            <button onClick={() => handleUnban(item.id)} className="p-2 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"><RiCheckLine /></button>
                                                        ) : (
                                                            <button onClick={() => openBanModal(item)} className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-white hover:text-black"><RiProhibitedLine /></button>
                                                        )}
                                                        <button onClick={() => handleDeleteUser(item.id)} className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"><RiDeleteBinLine /></button>
                                                    </>
                                                )}
                                            </td>
                                        </>
                                    )}

                                    {/* 2. TAB REPORTS */}
                                    {activeTab === 'reports' && (
                                        <>
                                            <td className="p-4">
                                                <div className="font-bold text-white"><RiBookOpenLine className="inline text-primary mr-1"/> {item.comic_slug}</div>
                                                <div className="text-xs text-gray-400">Lỗi: <span className="text-red-400">{item.reason}</span></div>
                                            </td>
                                            <td className="p-4 text-xs text-gray-500">
                                                Bởi: {item.username}<br/>
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleResolveReport(item.id)} className="px-3 py-1.5 rounded bg-green-600 text-white text-xs font-bold hover:bg-green-500">Đã Xử Lý</button>
                                            </td>
                                        </>
                                    )}

                                    {/* 3. TAB COMMENTS */}
                                    {activeTab === 'comments' && (
                                        <>
                                            <td className="p-4">
                                                <div className="font-bold text-white max-w-xs truncate">{item.content}</div>
                                            </td>
                                            <td className="p-4 text-xs text-gray-400">
                                                <div>User: <span className="text-white">{item.username}</span></div>
                                                <div>Truyện: <span className="text-primary">{item.comic_slug}</span></div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDeleteComment(item.id)} className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"><RiDeleteBinLine /></button>
                                            </td>
                                        </>
                                    )}

                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500 italic">Không có dữ liệu.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
    </div>
  );
};

export default DashboardPage;