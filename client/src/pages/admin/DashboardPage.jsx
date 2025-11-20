import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
    RiDashboardLine, RiArrowLeftLine, RiDeleteBinLine, 
    RiErrorWarningLine, RiProhibitedLine, RiCheckLine, 
    RiShieldUserLine, RiSearchLine, RiFilter3Line, RiCloseLine
} from 'react-icons/ri';

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- State cho bộ lọc & tìm kiếm ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); 
  const [filterStatus, setFilterStatus] = useState('all'); 

  // State cho Ban Modal
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banDays, setBanDays] = useState(1);

  const fetchUsers = async () => {
      try {
          const token = localStorage.getItem('user_token');
          const res = await axios.get('http://localhost:5000/api/user/admin/users', {
              headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(res.data);
          setLoading(false);
      } catch (error) { console.error(error); setLoading(false); }
  };

  useEffect(() => {
      fetchUsers();
  }, []);

  // Logic lọc user 
  const filteredUsers = useMemo(() => {
      return users.filter(user => {
          // 1. Tìm kiếm (Search)
          const searchLower = searchTerm.toLowerCase();
          const matchSearch = 
              user.id.toString().includes(searchLower) ||
              user.username.toLowerCase().includes(searchLower) ||
              user.email.toLowerCase().includes(searchLower) ||
              (user.full_name && user.full_name.toLowerCase().includes(searchLower));

          // 2. Lọc Role
          const matchRole = filterRole === 'all' || user.role === filterRole;

          // 3. Lọc Status
          const matchStatus = filterStatus === 'all' || user.status === filterStatus;

          return matchSearch && matchRole && matchStatus;
      });
  }, [users, searchTerm, filterRole, filterStatus]);

  // --- ACTIONS ---
  const handleDelete = async (id) => {
      if(!window.confirm('Bạn chắc chắn muốn XÓA vĩnh viễn user này?')) return;
      try {
          const token = localStorage.getItem('user_token');
          await axios.delete(`http://localhost:5000/api/user/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setUsers(prev => prev.filter(u => u.id !== id));
          alert('Đã xóa!');
      } catch(e) { alert('Lỗi xóa'); }
  };

  const handleWarn = async (id) => {
      try {
          const token = localStorage.getItem('user_token');
          await axios.post(`http://localhost:5000/api/user/admin/users/${id}/warn`, {}, { headers: { Authorization: `Bearer ${token}` } });
          alert('Đã gửi cảnh báo!');
          fetchUsers(); 
      } catch(e) { alert('Lỗi cảnh báo'); }
  };

  const handleUnban = async (id) => {
      if(!window.confirm('Mở khóa cho user này?')) return;
      try {
        const token = localStorage.getItem('user_token');
        await axios.post(`http://localhost:5000/api/user/admin/users/${id}/unban`, {}, { headers: { Authorization: `Bearer ${token}` } });
        alert('Đã mở khóa!');
        fetchUsers();
      } catch(e) { alert('Lỗi mở khóa'); }
  }

  const openBanModal = (user) => {
      setSelectedUser(user);
      setShowBanModal(true);
  };

  const confirmBan = async () => {
      if (!selectedUser) return;
      try {
          const token = localStorage.getItem('user_token');
          await axios.post(`http://localhost:5000/api/user/admin/users/${selectedUser.id}/ban`, 
            { days: parseInt(banDays) }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert('Đã chặn thành công!');
          setShowBanModal(false);
          fetchUsers();
      } catch(e) { alert('Lỗi khi chặn'); }
  };

  // Nút reset bộ lọc
  const clearFilters = () => {
      setSearchTerm('');
      setFilterRole('all');
      setFilterStatus('all');
  };

  return (
    <div className="min-h-screen bg-[#0a0a16] text-gray-300 font-display flex">
        
        {/* Sidebar */}
        <div className="w-64 bg-[#151525] border-r border-white/5 p-6 flex flex-col gap-6 fixed h-full">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <RiShieldUserLine className="text-red-500" /> ADMIN
            </h1>
            <nav className="flex flex-col gap-2">
                <div className="px-4 py-3 bg-red-500/10 text-red-500 rounded-lg font-bold cursor-pointer flex items-center gap-2">
                    <RiDashboardLine /> Quản Lý Users
                </div>
            </nav>
            <Link to="/" className="mt-auto flex items-center gap-2 text-sm text-gray-500 hover:text-white">
                <RiArrowLeftLine /> Về Trang Web
            </Link>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 ml-64">
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-3xl font-bold text-white">
                    Danh Sách Người Dùng 
                    <span className="text-base font-normal text-gray-500 ml-3">
                        (Tổng: {users.length} - Hiển thị: {filteredUsers.length})
                    </span>
                </h2>
            </div>

            {/* Toolbar: Tìm kiếm & Bộ lọc */}
            <div className="bg-[#151525] p-4 rounded-xl border border-white/5 mb-6 flex flex-col md:flex-row gap-4 items-center">
                
                {/* Ô Tìm Kiếm */}
                <div className="flex-1 w-full relative">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Tìm ID, Username, Email..." 
                        className="w-full bg-[#1f1f3a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                            <RiCloseLine />
                        </button>
                    )}
                </div>

                {/* Filter Group */}
                <div className="flex gap-3 w-full md:w-auto">
                    {/* Lọc Role */}
                    <div className="relative">
                        <select 
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="bg-[#1f1f3a] border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
                        >
                            <option value="all">Tất cả Vai trò</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        <RiFilter3Line className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14}/>
                    </div>

                    {/* Lọc Status */}
                    <div className="relative">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-[#1f1f3a] border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
                        >
                            <option value="all">Tất cả Trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="banned">Bị chặn</option>
                        </select>
                        <RiFilter3Line className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14}/>
                    </div>
                    
                    {/* Nút Reset */}
                    {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
                        <button 
                            onClick={clearFilters}
                            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-red-400 text-sm font-bold rounded-lg border border-white/5 transition-colors"
                        >
                            Xóa Lọc
                        </button>
                    )}
                </div>
            </div>
            
            {/* TABLE */}
            <div className="bg-[#151525] rounded-xl border border-white/5 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1f1f3a] text-white text-xs uppercase tracking-wider font-bold">
                                <th className="p-4 border-b border-white/10 whitespace-nowrap">ID</th>
                                <th className="p-4 border-b border-white/10">User Info</th>
                                <th className="p-4 border-b border-white/10 text-center">Vai trò</th>
                                <th className="p-4 border-b border-white/10 text-center">Trạng Thái</th>
                                <th className="p-4 border-b border-white/10 text-center">Cảnh báo</th>
                                <th className="p-4 border-b border-white/10 text-right">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                                    <td className="p-4 text-gray-500">#{u.id}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-white">{u.full_name}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                        <div className="text-xs text-gray-600">@{u.username}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {u.status === 'banned' ? (
                                            <span className="text-red-500 font-bold flex flex-col items-center text-xs">
                                                <RiProhibitedLine size={16}/> BỊ CHẶN
                                                {u.ban_expires_at ? (
                                                    <span className="text-[9px] opacity-70">Đến: {new Date(u.ban_expires_at).toLocaleDateString()}</span>
                                                ) : <span className="text-[9px]">Vĩnh viễn</span>}
                                            </span>
                                        ) : (
                                            <span className="text-green-500 font-bold text-xs flex items-center justify-center gap-1">
                                                <RiCheckLine /> Hoạt động
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center font-bold text-yellow-500">
                                        {u.warnings > 0 ? `${u.warnings} ⚠` : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        {u.role !== 'admin' && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleWarn(u.id)} title="Cảnh báo" className="p-2 rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors">
                                                    <RiErrorWarningLine size={16} />
                                                </button>
                                                {u.status === 'banned' ? (
                                                    <button onClick={() => handleUnban(u.id)} title="Mở khóa" className="p-2 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors">
                                                        <RiCheckLine size={16} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => openBanModal(u)} title="Chặn người dùng" className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-white hover:text-black transition-colors">
                                                        <RiProhibitedLine size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(u.id)} title="Xóa user" className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                                                    <RiDeleteBinLine size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500 italic">
                                        Không tìm thấy người dùng nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Ban modal*/}
        {showBanModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-scale-up">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <RiProhibitedLine className="text-red-500" /> Chặn User: {selectedUser?.username}
                    </h3>
                    <label className="block text-sm text-gray-400 mb-2">Chọn thời gian chặn:</label>
                    <select 
                        value={banDays} 
                        onChange={(e) => setBanDays(e.target.value)}
                        className="w-full bg-[#252538] border border-white/10 text-white p-3 rounded-lg mb-6 focus:outline-none focus:border-red-500"
                    >
                        <option value="1">1 Ngày</option>
                        <option value="3">3 Ngày</option>
                        <option value="7">1 Tuần</option>
                        <option value="30">1 Tháng</option>
                        <option value="-1">Vĩnh Viễn (Không bao giờ mở)</option>
                    </select>
                    <div className="flex gap-3">
                        <button onClick={() => setShowBanModal(false)} className="flex-1 py-2.5 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600">Hủy</button>
                        <button onClick={confirmBan} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-900/30">Xác Nhận Chặn</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default DashboardPage;