import React from 'react';
import { RiErrorWarningLine, RiCloseLine, RiDeleteBinLine } from 'react-icons/ri';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-[#1a1a2e] border border-red-500/30 w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl shadow-red-900/20 animate-scale-up overflow-hidden">
        
        <button 
            onClick={onClose} 
            disabled={isLoading}
            className="absolute top-3 right-3 text-gray-500 hover:text-white disabled:opacity-50"
        >
            <RiCloseLine size={24} />
        </button>

        {/* Icon Warning */}
        <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/50 text-red-500">
                <RiDeleteBinLine size={32} />
            </div>
        </div>

        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">
            {title || 'Xác Nhận Xóa?'}
        </h3>
        
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {message || 'Hành động này không thể hoàn tác.'}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
            <button 
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm border border-white/5 transition-colors disabled:opacity-50"
            >
                Hủy Bỏ
            </button>
            
            <button 
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {isLoading ? 'Đang Xóa...' : 'Đồng Ý Xóa'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;