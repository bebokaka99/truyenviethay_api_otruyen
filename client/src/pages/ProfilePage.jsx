import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { 
    RiUser3Line, RiLockPasswordLine, RiSave3Line, 
    RiCameraLine, RiCheckDoubleLine 
} from 'react-icons/ri';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // INFO STATE
  const [fullName, setFullName] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // PASSWORD STATE
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
      if (user) {
          setFullName(user.full_name || '');
          // Logic hiển thị avatar
          const avatarSrc = user.avatar 
            ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000/${user.avatar}`)
            : `https://ui-avatars.com/api/?name=${user.username}&background=random`;
          setPreviewAvatar(avatarSrc);
      }
  }, [user]);

  // Xử lý chọn file
  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setSelectedFile(file);
          setPreviewAvatar(URL.createObjectURL(file)); // Xem trước
      }
  };

  // Xử lý Submit Update Profile (Gửi FormData)
  const handleUpdateInfo = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage({ type: '', content: '' });

      // Tạo FormData để chứa file và text
      const formData = new FormData();
      formData.append('full_name', fullName);
      if (selectedFile) {
          formData.append('avatar', selectedFile);
      }

      try {
          const token = localStorage.getItem('user_token');
          const res = await axios.put('http://localhost:5000/api/user/profile', formData, {
              headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data' // Quan trọng để server nhận file
              }
          });

          // Cập nhật Context -> Header tự đổi ảnh
          updateUser(res.data.user);
          setMessage({ type: 'success', content: 'Cập nhật hồ sơ thành công!' });
          setSelectedFile(null); // Reset file chọn
      } catch (error) {
          console.error(error);
          setMessage({ type: 'error', content: 'Lỗi cập nhật. Vui lòng thử lại.' });
      } finally {
          setLoading(false);
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
          await axios.put('http://localhost:5000/api/user/password', {
              currentPassword: passData.currentPassword, newPassword: passData.newPassword
          }, { headers: { Authorization: `Bearer ${token}` } });
          setMessage({ type: 'success', content: 'Đổi mật khẩu thành công!' });
          setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (error) {
          setMessage({ type: 'error', content: error.response?.data?.message || 'Lỗi đổi mật khẩu.' });
      } finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-black text-white mb-8 border-l-4 border-primary pl-4">Cài Đặt Tài Khoản</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Menu */}
            <div className="col-span-1 flex flex-col gap-2">
                <button onClick={() => { setActiveTab('info'); setMessage({type:'', content:''}); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'info' ? 'bg-primary text-white shadow-lg' : 'bg-[#1a1a2e] hover:bg-white/5'}`}>
                    <RiUser3Line size={18} /> Thông Tin Chung
                </button>
                <button onClick={() => { setActiveTab('password'); setMessage({type:'', content:''}); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'password' ? 'bg-primary text-white shadow-lg' : 'bg-[#1a1a2e] hover:bg-white/5'}`}>
                    <RiLockPasswordLine size={18} /> Đổi Mật Khẩu
                </button>
            </div>

            {/* Content */}
            <div className="col-span-1 md:col-span-3">
                <div className="bg-[#1a1a2e] rounded-2xl p-6 md:p-10 border border-white/5 shadow-xl relative overflow-hidden">
                    
                    {message.content && (
                        <div className={`mb-6 p-4 rounded-lg text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            <RiCheckDoubleLine /> {message.content}
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <form onSubmit={handleUpdateInfo} className="flex flex-col gap-8">
                            
                            {/* Avatar Upload UI */}
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative group cursor-pointer">
                                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#252538] shadow-lg bg-[#1f1f3a]">
                                        <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    {/* Label trỏ tới input file ẩn */}
                                    <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <RiCameraLine className="text-white text-3xl" />
                                    </label>
                                    <input 
                                        id="avatar-upload" 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleFileChange} 
                                    />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-white font-bold text-xl mb-1">{user.username}</h3>
                                    <p className="text-gray-500 text-xs mb-3">Thành viên chính thức</p>
                                    <label htmlFor="avatar-upload" className="px-4 py-2 bg-[#252538] hover:bg-white/10 text-white text-xs font-bold rounded-lg border border-white/10 cursor-pointer transition-colors">
                                        Chọn Ảnh Mới
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên Hiển Thị</label>
                                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#252538] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Không thể đổi)</label>
                                    <input type="text" value={user.email} disabled className="w-full bg-[#1f1f3a] border border-transparent rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-fit px-8 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50">
                                <RiSave3Line size={20} /> {loading ? 'Đang Tải Lên...' : 'Lưu Thay Đổi'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handleChangePassword} className="flex flex-col gap-5 max-w-md">
                            {/* Form mật khẩu giữ nguyên */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu hiện tại</label>
                                <input type="password" value={passData.currentPassword} onChange={(e) => setPassData({...passData, currentPassword: e.target.value})} required className="w-full bg-[#252538] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu mới</label>
                                <input type="password" value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} required className="w-full bg-[#252538] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Xác nhận mật khẩu mới</label>
                                <input type="password" value={passData.confirmPassword} onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})} required className="w-full bg-[#252538] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <button type="submit" disabled={loading} className="mt-4 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 disabled:opacity-50">
                                {loading ? 'Đang Xử Lý...' : 'Xác Nhận Đổi Mật Khẩu'}
                            </button>
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