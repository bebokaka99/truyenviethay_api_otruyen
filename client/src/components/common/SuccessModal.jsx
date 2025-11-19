import React from 'react';
import { RiCheckLine, RiArrowRightLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const SuccessModal = ({ isOpen, title, message, btnText, btnLink }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Overlay tối màu */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in"></div>
      
      {/* Modal Content */}
      <div className="relative bg-[#1a1a2e] border border-green-500/30 w-full max-w-sm rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(34,197,94,0.2)] animate-scale-up overflow-hidden">
        
        {/* Hiệu ứng ánh sáng nền */}
        <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-green-500/20 blur-[80px] rounded-full"></div>

        {/* Icon Checkmark Động */}
        <div className="relative z-10 mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500 relative">
                <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-20"></div>
                <RiCheckLine className="text-green-500 text-4xl animate-bounce-small" />
            </div>
        </div>

        <h2 className="relative z-10 text-2xl font-black text-white mb-2 uppercase tracking-wide">
            {title}
        </h2>
        
        <p className="relative z-10 text-gray-400 text-sm mb-8 leading-relaxed">
            {message}
        </p>

        <Link 
            to={btnLink} 
            className="relative z-10 flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/40 group"
        >
            {btnText} <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
        </Link>

      </div>
    </div>
  );
};

export default SuccessModal;