import React from 'react';
import { Link } from 'react-router-dom';
import { RiGhostLine, RiArrowLeftLine, RiHome4Line } from 'react-icons/ri';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0a16] font-display flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 text-center">
        {/* Icon Ghost Animation */}
        <div className="flex justify-center mb-6">
            <div className="relative">
                <RiGhostLine className="text-9xl text-gray-700 animate-bounce" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/50 blur-md rounded-[100%]"></div>
            </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-[150px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-20 select-none">
            404
        </h1>

        {/* Message */}
        <h2 className="text-2xl md:text-4xl font-bold text-white mt-[-40px] mb-4 relative z-20">
            Lạc Vào Hư Không?
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm md:text-base">
            Trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc đạo hữu chưa đủ tu vi để truy cập khu vực này.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
                to="/" 
                className="px-8 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-primary/30 flex items-center gap-2 transition-transform hover:-translate-y-1"
            >
                <RiHome4Line size={20} /> Về Tông Môn
            </Link>
            
            <button 
                onClick={() => window.history.back()} 
                className="px-8 py-3 bg-[#1f1f3a] hover:bg-white/10 text-gray-300 font-bold rounded-full border border-white/10 flex items-center gap-2 transition-transform hover:-translate-y-1"
            >
                <RiArrowLeftLine size={20} /> Quay Lại
            </button>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-8 text-gray-600 text-xs">
        ERROR CODE: 404_NOT_FOUND
      </div>

    </div>
  );
};

export default NotFoundPage;