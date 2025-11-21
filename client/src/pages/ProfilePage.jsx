import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import LevelBadge from '../components/common/LevelBadge';
import { getLevelFromExp, getNextLevelExp } from '../utils/levelSystem';
import { 
    RiUser3Line, RiLockPasswordLine, RiSave3Line, 
    RiCameraLine, RiCheckDoubleLine, RiTaskLine, 
    RiMedalLine, RiLoader4Line, RiCalendarEventLine
} from 'react-icons/ri';

const BACKEND_URL = 'http://192.168.1.154:5000';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Info State
  const [fullName, setFullName] = useState('');
  const [rankStyle, setRankStyle] = useState('default'); 
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);

  // Password State
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // --- LEVEL CALCULATION ---
  const currentExp = user?.exp || 0;
  const currentLevel = getLevelFromExp(currentExp);
  const nextLevelExp = getNextLevelExp(currentLevel);
  const prevLevelExp = getNextLevelExp(currentLevel - 1) || 0;
  const expNeeded = nextLevelExp - prevLevelExp;
  const currentProgressExp = currentExp - prevLevelExp;
  const progressPercent = Math.min((currentProgressExp / expNeeded) * 100, 100);

  // --- API FETCHING ---
  const fetchTasks = async () => {
      if (!user) return;
      // Chỉ hiện loading nếu list rỗng để tránh giật khi claim
      if (tasks.length === 0) setTaskLoading(true);
      
      try {
          const token = localStorage.getItem('user_token');
          const res = await axios.get(`${BACKEND_URL}/api/quests`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setTasks(res.data); 
      } catch (error) { 
          console.error("Lỗi load nhiệm vụ:", error); 
      } finally { 
          setTaskLoading(false); 
      }
  };

  // --- EFFECTS ---
  useEffect(() => {
      if (user) {
          setFullName(user.full_name || '');
          setRankStyle(user.rank_style || 'default'); 
          const avatarSrc = user.avatar 
            ? (user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}/${user.avatar}`)
            : `https://ui-avatars.com/api/?name=${user.username}&background=random`;
          setPreviewAvatar(avatarSrc);
      }
  }, [user]);

  useEffect(() => {
      if (activeTab === 'tasks' && user) {
          fetchTasks();
      }
  }, [activeTab, user]);

  // --- HANDLERS ---
  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setSelectedFile(file);
          setPreviewAvatar(URL.createObjectURL(file)); 
      }
  };

  const handleUpdateInfo = async (e) => {
      e.preventDefault();
      setLoading(true); 
      setMessage({ type: '', content: '' });

      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('rank_style', rankStyle); 
      if (selectedFile) formData.append('avatar', selectedFile);

      try {
          const token = localStorage.getItem('user_token');
          const res = await axios.put(`${BACKEND_URL}/api/user/profile`, formData, {
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
          });
          
          updateUser(res.data.user);
          setMessage({ type: 'success', content: 'Cập nhật hồ sơ thành công!' });
          setSelectedFile(null); 
      } catch (error) {
          setMessage({ type: 'error', content: 'Lỗi cập nhật. Vui lòng thử lại.' });
      } finally { 
          setLoading(false); 
      }
  };

  const handleClaim = async (task) => {
    try {
        const token = localStorage.getItem('user_token');
        const res = await axios.post(`${BACKEND_URL}/api/quests/claim`, { quest_id: task.id }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const newExp = res.data.new_exp;
        updateUser({ ...user, exp: newExp }); // Update Context
        setMessage({ type: 'success', content: res.data.message });
        
        // Optimistic Update UI
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_claimed: 1 } : t));
        fetchTasks(); // Sync lại cho chắc
    } catch (error) {
        setMessage({ type: 'error', content: error.response?.data?.message || 'Lỗi nhận thưởng' });
    }
  };

  const handleChangePassword = async (e) => {
      e.preventDefault();
      if (passData.newPassword !== passData.confirmPassword) {
          setMessage({ type: 'error', content: 'Mật khẩu xác nhận không khớp!' }); return;
      }
      setLoading(true); setMessage({ type: '', content: '' });
      try {
          const token = localStorage.getItem('user_token');
          await axios.put(`${BACKEND_URL}/api/user/password`, {
              currentPassword: passData.currentPassword, newPassword: passData.newPassword
          }, { headers: { Authorization: `Bearer ${token}` } });
          setMessage({ type: 'success', content: 'Đổi mật khẩu thành công!' });
          setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (error) {
          setMessage({ type: 'error', content: error.response?.data?.message || 'Lỗi đổi mật khẩu.' });
      } finally { setLoading(false); }
  };

  const passDataChangeHandler = (e) => setPassData({...passData, [e.target.name]: e.target.value});

  // --- RENDER HELPER ---
  const renderTaskItem = (task) => {
      const isComplete = task.current_count >= task.target_count;
      const isClaimable = isComplete && Number(task.is_claimed) === 0;

      return (
        <div key={task.id} className="bg-[#1f1f3a] p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
            <div className="flex-1 mr-4">
                <div className="flex justify-between mb-1">
                    <h4 className="font-bold text-gray-200 text-sm">{task.name}</h4>
                    <span className="text-primary font-bold text-xs">+{task.reward_exp} XP</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-2">{task.description}</p>
                
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-[#0a0a16] rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`} 
                        style={{ width: `${Math.min((task.current_count / task.target_count) * 100, 100)}%` }}
                    ></div>
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">{task.current_count}/{task.target_count} hoàn thành</span>
            </div>
            
            <div className="flex-shrink-0">
                {Number(task.is_claimed) === 1 ? (
                    <button className="px-4 py-1.5 bg-green-900/30 text-green-500 border border-green-500/30 text-xs font-bold rounded-lg cursor-default opacity-60">
                        Đã Nhận
                    </button>
                ) : (
                    <button 
                        onClick={() => handleClaim(task)}
                        disabled={!isClaimable}
                        className={`px-4 py-1.5 text-white text-xs font-bold rounded-lg transition-all 
                            ${isClaimable 
                                ? 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/30' 
                                : 'bg-[#2a2a40] text-gray-500 cursor-not-allowed'}`}
                    >
                        Nhận Thưởng
                    </button>
                )}
            </div>
        </div>
      );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-black text-white mb-8 border-l-4 border-primary pl-4">Hồ Sơ Của Bạn</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* --- SIDEBAR --- */}
            <div className="col-span-1 flex flex-col gap-2">
                <button onClick={() => setActiveTab('info')} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'info' ? 'bg-primary text-white shadow-lg' : 'bg-[#1a1a2e] hover:bg-white/5'}`}>
                    <RiUser3Line size={18} /> Thông Tin Chung
                </button>
                <button onClick={() => setActiveTab('tasks')} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'tasks' ? 'bg-primary text-white shadow-lg' : 'bg-[#1a1a2e] hover:bg-white/5'}`}>
                    <RiTaskLine size={18} /> Nhiệm Vụ & Cấp Độ
                </button>
                <button onClick={() => setActiveTab('password')} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'password' ? 'bg-primary text-white shadow-lg' : 'bg-[#1a1a2e] hover:bg-white/5'}`}>
                    <RiLockPasswordLine size={18} /> Đổi Mật Khẩu
                </button>
            </div>

            {/* --- CONTENT --- */}
            <div className="col-span-1 md:col-span-3">
                <div className="bg-[#1a1a2e] rounded-2xl p-6 md:p-10 border border-white/5 shadow-xl relative overflow-hidden">
                    
                    {/* Message Toast */}
                    {message.content && (
                        <div className={`mb-6 p-4 rounded-lg text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            <RiCheckDoubleLine /> {message.content}
                        </div>
                    )}

                    {/* PROFILE HEADER */}
                    <div className="flex flex-col md:flex-row gap-6 items-center mb-10 pb-8 border-b border-white/5">
                        <div className="w-24 h-24 rounded-full border-4 border-[#252538] overflow-hidden shadow-lg bg-black">
                            <img src={previewAvatar} className="w-full h-full object-cover" alt="avt" />
                        </div>
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h2 className="text-2xl font-black text-white">{user.full_name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <LevelBadge exp={currentExp} rankStyle={rankStyle} role={user.role} />
                                        <span className="text-xs text-gray-500">@{user.username}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-black text-primary">{currentExp}</span>
                                    <span className="text-gray-500 text-[10px] uppercase font-bold"> / {nextLevelExp} XP</span>
                                </div>
                            </div>
                            {user.role === 'user' ? (
                                <>
                                    <div className="w-full h-3 bg-[#1f1f3a] rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2 text-right italic">XP cần để lên cấp: {nextLevelExp - currentExp}!</p>
                                </>
                            ) : <p className="text-sm font-bold text-red-500 mt-2">QUẢN TRỊ VIÊN - Miễn nhiễm cấp độ.</p>}
                        </div>
                    </div>

                    {/* TAB 1: INFO */}
                    {activeTab === 'info' && (
                        <form onSubmit={handleUpdateInfo} className="flex flex-col gap-6 animate-fade-in-up">
                            <div className="grid grid-cols-1 gap-4">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên Hiển Thị</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#252538] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" /></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hệ Thống Danh Hiệu</label>
                                    <select value={rankStyle} onChange={(e) => setRankStyle(e.target.value)} className="w-full bg-[#252538] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none cursor-pointer">
                                        <option value="default">Mặc Định (Cấp 1, 2...)</option>
                                        <option value="cultivation">Tu Tiên (Luyện Khí...)</option>
                                        <option value="hunter">Thợ Săn (Rank E...)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ảnh Đại Diện</label>
                                    <div className="flex items-center gap-3">
                                        <label htmlFor="avatar-upload" className="px-4 py-2 bg-[#252538] hover:bg-white/10 text-white text-xs font-bold rounded-lg border border-white/10 cursor-pointer transition-colors flex items-center gap-2"><RiCameraLine /> Chọn Ảnh</label>
                                        <span className="text-xs text-gray-500">{selectedFile ? selectedFile.name : 'Chưa chọn ảnh'}</span>
                                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-fit px-8 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"><RiSave3Line size={20} /> {loading ? 'Đang Tải Lên...' : 'Lưu Thay Đổi'}</button>
                        </form>
                    )}

                    {/* TAB 2: TASKS */}
                    {activeTab === 'tasks' && user.role === 'user' && (
                        <div className="space-y-10 animate-fade-in-up">
                            {/* Daily */}
                            <div>
                                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-white/5 pb-2"><RiTaskLine className="text-green-500" /> Nhiệm Vụ Hàng Ngày</h3>
                                {taskLoading && tasks.length === 0 ? <div className="text-center"><RiLoader4Line className="animate-spin text-2xl mx-auto"/></div> : (
                                    <div className="grid gap-3">
                                        {tasks.filter(t => t.type === 'daily').length > 0 ? tasks.filter(t => t.type === 'daily').map(renderTaskItem) : <p className="text-gray-500 text-xs italic">Không có nhiệm vụ ngày.</p>}
                                    </div>
                                )}
                            </div>
                            {/* Weekly */}
                            <div>
                                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-white/5 pb-2"><RiCalendarEventLine className="text-blue-500" /> Nhiệm Vụ Tuần</h3>
                                <div className="grid gap-3">
                                    {tasks.filter(t => t.type === 'weekly').length > 0 ? tasks.filter(t => t.type === 'weekly').map(renderTaskItem) : <p className="text-gray-500 text-xs italic">Không có nhiệm vụ tuần.</p>}
                                </div>
                            </div>
                            {/* Achievement */}
                            <div>
                                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-white/5 pb-2"><RiMedalLine className="text-yellow-500" /> Thành Tựu</h3>
                                <div className="grid gap-3">
                                    {tasks.filter(t => t.type === 'achievement').length > 0 ? tasks.filter(t => t.type === 'achievement').map(renderTaskItem) : <p className="text-gray-500 text-xs italic">Chưa mở khóa thành tựu.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: PASSWORD */}
                    {activeTab === 'password' && (
                         <form onSubmit={handleChangePassword} className="flex flex-col gap-5 max-w-md animate-fade-in-up">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu hiện tại</label><input type="password" name="currentPassword" value={passData.currentPassword} onChange={passDataChangeHandler} required className="w-full bg-[#252538] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu mới</label><input type="password" name="newPassword" value={passData.newPassword} onChange={passDataChangeHandler} required className="w-full bg-[#252538] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Xác nhận mật khẩu mới</label><input type="password" name="confirmPassword" value={passData.confirmPassword} onChange={passDataChangeHandler} required className="w-full bg-[#252538] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" /></div>
                            <button type="submit" disabled={loading} className="mt-4 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 disabled:opacity-50">{loading ? 'Đang Xử Lý...' : 'Xác Nhận Đổi Mật Khẩu'}</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;