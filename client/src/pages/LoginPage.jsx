import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { RiUser3Line, RiLockPasswordLine, RiArrowLeftSLine, RiLoader4Line } from 'react-icons/ri';

const LoginPage = () => {
  // Đổi tên state 'email' thành 'identifier' cho đúng ngữ nghĩa
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Gọi API Backend với field 'identifier'
      const response = await axios.post('/api/auth/login', {
        identifier, // Gửi email hoặc username vào đây
        password
      });

      // Nếu thành công
      const { token, user } = response.data;
      login(user, token); // Lưu thông tin vào Context
      navigate('/'); // Chuyển về trang chủ

    } catch (err) {
      // Xử lý lỗi từ server
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a16] font-display flex items-center justify-center relative overflow-hidden px-4">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#151525]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white text-sm mb-4 transition-colors">
            <RiArrowLeftSLine size={20} /> Về Trang Chủ
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Chào Mừng Trở Lại</h1>
          <p className="text-gray-500 text-sm">Đăng nhập để tiếp tục đọc truyện</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Identifier Input (Email or Username) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <RiUser3Line className="text-gray-500" />
            </div>
            <input
              type="text" // Đổi sang text để nhập username được
              required
              placeholder="Email hoặc Tên đăng nhập" // Placeholder rõ ràng
              className="w-full bg-[#0a0a16] border border-white/10 text-white text-sm rounded-lg block pl-10 p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <RiLockPasswordLine className="text-gray-500" />
            </div>
            <input
              type="password"
              required
              placeholder="Mật khẩu"
              className="w-full bg-[#0a0a16] border border-white/10 text-white text-sm rounded-lg block pl-10 p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <a href="/forgot-password" className="text-xs text-primary hover:text-blue-400 font-bold">Quên mật khẩu?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
          >
            {loading ? <RiLoader4Line className="animate-spin" size={20} /> : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-white font-bold hover:text-primary transition-colors">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;