import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RiUser3Line, RiLockPasswordLine, RiArrowLeftSLine, RiMailLine, RiLoader4Line, RiAliensLine } from 'react-icons/ri';
import SuccessModal from '../components/common/SuccessModal';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State để hiện Modal
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/auth/register', formData);
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a16] font-display flex items-center justify-center relative overflow-hidden px-4 py-10">
      
      {/* --- HIỂN THỊ MODAL THÀNH CÔNG --- */}
      <SuccessModal 
         isOpen={showSuccess}
         title="Đăng Ký Thành Công!"
         message="Tài khoản của bạn đã được khởi tạo. Hãy đăng nhập ngay để bắt đầu hành trình khám phá thế giới truyện tranh."
         btnText="Đăng Nhập Ngay"
         btnLink="/login"
      />

      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-green-500/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-md bg-[#151525]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* ... (Phần Form giữ nguyên như cũ) ... */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white text-sm mb-4 transition-colors">
            <RiArrowLeftSLine size={20} /> Về Trang Chủ
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Tạo Tài Khoản</h1>
          <p className="text-gray-500 text-sm">Tham gia cộng đồng truyện tranh lớn nhất</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><RiUser3Line className="text-gray-500" /></div>
            <input name="full_name" type="text" required placeholder="Tên hiển thị" className="w-full bg-[#0a0a16] border border-white/10 text-white text-sm rounded-lg block pl-10 p-3 focus:outline-none focus:border-primary transition-colors" onChange={handleChange} />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><RiAliensLine className="text-gray-500" /></div>
            <input name="username" type="text" required placeholder="Username (viết liền)" className="w-full bg-[#0a0a16] border border-white/10 text-white text-sm rounded-lg block pl-10 p-3 focus:outline-none focus:border-primary transition-colors" onChange={handleChange} />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><RiMailLine className="text-gray-500" /></div>
            <input name="email" type="email" required placeholder="Email" className="w-full bg-[#0a0a16] border border-white/10 text-white text-sm rounded-lg block pl-10 p-3 focus:outline-none focus:border-primary transition-colors" onChange={handleChange} />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><RiLockPasswordLine className="text-gray-500" /></div>
            <input name="password" type="password" required placeholder="Mật khẩu" className="w-full bg-[#0a0a16] border border-white/10 text-white text-sm rounded-lg block pl-10 p-3 focus:outline-none focus:border-primary transition-colors" onChange={handleChange} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-green-900/20 mt-2 flex items-center justify-center gap-2">
             {loading ? <RiLoader4Line className="animate-spin" size={20} /> : 'ĐĂNG KÝ NGAY'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Đã có tài khoản? <Link to="/login" className="text-white font-bold hover:text-primary transition-colors">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;