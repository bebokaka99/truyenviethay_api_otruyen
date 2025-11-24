import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {/* Ảnh bìa (Ratio 2/3) */}
      <div className="w-full aspect-[2/3] bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
          {/* Hiệu ứng shimmer (ánh sáng quét qua) */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          
          {/* Badge giả */}
          <div className="absolute top-2 right-2 w-12 h-4 bg-white/10 rounded"></div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-white/10"></div>
      </div>
      
      {/* Tên truyện (2 dòng) */}
      <div className="flex flex-col gap-2">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-3 bg-white/5 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;