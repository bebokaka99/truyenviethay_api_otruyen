import React from 'react';
import { RiLockPasswordLine, RiLoginCircleLine, RiUserAddLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Overlay - Bấm ra ngoài để đóng */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-[#1a1a2e] border border-white/10 w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl animate-scale-up overflow-hidden">
        
        {/* Background Effect */}
        <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-primary/20 blur-[80px] rounded-full"></div>

        {/* Icon Lock */}
        <div className="relative z-10 mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#252538] flex items-center justify-center border border-white/10 relative">
                <RiLockPasswordLine className="text-primary text-4xl" />
            </div>
        </div>

        <h2 className="relative z-10 text-xl font-black text-white mb-2 uppercase tracking-wide">
            Yêu Cầu Đăng Nhập
        </h2>
        
        <p className="relative z-10 text-gray-400 text-sm mb-8 leading-relaxed">
            Bạn cần đăng nhập tài khoản để sử dụng tính năng <b>Theo Dõi</b> và lưu truyện vào tủ.
        </p>

        <div className="relative z-10 flex flex-col gap-3">
            <Link 
                to="/login" 
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30"
            >
                <RiLoginCircleLine size={20} /> Đăng Nhập Ngay
            </Link>
            
            <Link 
                to="/register" 
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#252538] hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
            >
                <RiUserAddLine size={20} /> Tạo Tài Khoản Mới
            </Link>
        </div>
        
        <button onClick={onClose} className="relative z-10 mt-6 text-xs text-gray-500 hover:text-white underline cursor-pointer">
            Để sau, tôi chỉ xem thôi
        </button>

      </div>
    </div>
  );
};

export default LoginModal;