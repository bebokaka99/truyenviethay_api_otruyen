// src/components/common/Toast.jsx
import React, { useEffect } from 'react';
import { RiCheckboxCircleFill, RiErrorWarningFill, RiCloseLine } from 'react-icons/ri';

const Toast = ({ message, type = 'success', onClose }) => {
  
  // Tự động đóng sau 3 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Cấu hình giao diện dựa trên Type
  const config = {
    success: {
      icon: <RiCheckboxCircleFill className="text-green-400 text-xl" />,
      border: 'border-green-500/50',
      bg: 'bg-green-500/10',
      text: 'text-green-100'
    },
    error: {
      icon: <RiErrorWarningFill className="text-red-400 text-xl" />,
      border: 'border-red-500/50',
      bg: 'bg-red-500/10',
      text: 'text-red-100'
    }
  };

  const style = config[type] || config.success;

  return (
    <div className="fixed top-24 right-5 z-[9999] animate-slide-in-right">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style.border} ${style.bg} backdrop-blur-md shadow-2xl min-w-[300px]`}>
        <div className="flex-shrink-0">
          {style.icon}
        </div>
        <div className={`flex-1 text-sm font-bold ${style.text}`}>
          {message}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <RiCloseLine size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;