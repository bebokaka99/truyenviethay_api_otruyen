import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RiMailLine, RiLockPasswordLine, RiKey2Line, RiArrowLeftSLine, RiCheckDoubleLine, RiLoader4Line } from 'react-icons/ri';
import Toast from '../components/common/Toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Nhập Email, 2: Nhập OTP & Pass mới
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  // BƯỚC 1: GỬI EMAIL YÊU CẦU
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await axios.post('/api/auth/forgot-password', { email });
        showToast('Mã xác nhận đã được gửi! Kiểm tra email nhé.', 'success');
        setStep(2); // Chuyển sang bước nhập OTP
    } catch (err) {
        showToast(err.response?.data?.message || 'Lỗi gửi email.', 'error');
    } finally { setLoading(false); }
  };

  // BƯỚC 2: ĐẶT LẠI MẬT KHẨU
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await axios.post('/api/auth/reset-password', { email, otp, newPassword });
        showToast('Đổi mật khẩu thành công!', 'success');
        setTimeout(() => navigate('/login'), 2000); // Chuyển về login sau 2s
    } catch (err) {
        showToast(err.response?.data?.message || 'Lỗi đổi mật khẩu.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a16] font-display flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background FX */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>

        <div className="relative z-10 w-full max-w-md bg-[#151525]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-white text-xs mb-6 transition-colors"><RiArrowLeftSLine size={18} /> Quay lại đăng nhập</Link>
            
            <h1 className="text-2xl font-black text-white mb-2">
                {step === 1 ? 'Quên Mật Khẩu?' : 'Đặt Lại Mật Khẩu'}
            </h1>
            <p className="text-gray-500 text-sm mb-8">
                {step === 1 ? 'Nhập email của bạn để nhận mã xác nhận.' : `Mã xác nhận đã gửi tới ${email}`}
            </p>

            {step === 1 ? (
                <form onSubmit={handleSendEmail} className="flex flex-col gap-5">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><RiMailLine className="text-gray-500" /></div>
                        <input type="email" required placeholder="Nhập email của bạn" className="w-full bg-[#0a0a16] border border-white/10 text-white text-sm rounded-lg pl-10 p-3 focus:border-primary outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all flex justify-center">
                        {loading ? <RiLoader4Line className="animate-spin" size={20} /> : 'Gửi Mã Xác Nhận'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><RiKey2Line className="text-gray-500" /></div>
                        <input type="text" required placeholder="Nhập mã OTP (6 số)" className="w-full bg-[#0a0a16] border border-white/10 text-white text-sm rounded-lg pl-10 p-3 focus:border-primary outline-none tracking-widest font-bold" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><RiLockPasswordLine className="text-gray-500" /></div>
                        <input type="password" required placeholder="Mật khẩu mới" className="w-full bg-[#0a0a16] border border-white/10 text-white text-sm rounded-lg pl-10 p-3 focus:border-primary outline-none" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-all flex justify-center">
                         {loading ? <RiLoader4Line className="animate-spin" size={20} /> : 'Xác Nhận Đổi Mật Khẩu'}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-white text-center mt-2">Gửi lại mã?</button>
                </form>
            )}
        </div>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ForgotPasswordPage;