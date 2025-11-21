import React from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightSLine } from 'react-icons/ri';

const HugeGridSection = ({ title, stories, domainAnh }) => {
  if (!stories || stories.length === 0) return null;
  
  // 1. Hàm Format tên chương
  const formatChapter = (truyen) => {
    const chapRaw = truyen.latest_chapter || (truyen.chaptersLatest && truyen.chaptersLatest[0]?.chapter_name) || 'Full';
    const chapNum = chapRaw.replace(/chapter/gi, '').replace(/chương/gi, '').trim();
    return isNaN(chapNum) && chapNum !== 'Full' ? `Chương ${chapNum}` : (chapNum === 'Full' ? 'Full' : `Chương ${chapNum}`);
  };

  // 2. Hàm tính thời gian
  const timeAgo = (dateString) => {
      if (!dateString) return '';
      const now = new Date();
      const date = new Date(dateString);
      const seconds = Math.floor((now - date) / 1000);

      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return interval + " năm trước";
      
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return interval + " tháng trước";
      
      interval = Math.floor(seconds / 604800);
      if (interval >= 1) return interval + " tuần trước";
      
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return interval + " ngày trước";
      
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return interval + " giờ trước";
      
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return interval + " phút trước";
      
      return "Vừa xong";
  };

  return (
    <div className="py-6 md:py-10 px-3 sm:px-8 md:px-20">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <h3 className="text-white text-xl md:text-3xl font-bold relative pl-3 md:pl-4 border-l-4 border-primary truncate">
          {title}
        </h3>
        <Link to="/danh-sach" className="text-xs md:text-sm font-bold text-white/60 hover:text-primary flex items-center gap-1 transition-colors whitespace-nowrap">
          Xem tất cả <RiArrowRightSLine />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
        {stories.map((truyen) => (
          <Link key={truyen._id} to={`/truyen-tranh/${truyen.slug}`} className="flex flex-col gap-2 group cursor-pointer">
            <div className="w-full aspect-[2/3] bg-[#1f1f3a] rounded-lg overflow-hidden relative border border-white/5 group-hover:border-green-500/50 transition-all shadow-sm">
              <img 
                src={`${domainAnh}/uploads/comics/${truyen.thumb_url}`}
                alt={truyen.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* flex-row: Ngang hàng | items-center: Căn giữa dọc | gap-1: Khoảng cách nhỏ */}
              <div className="absolute top-1.5 right-1.5 flex flex-row items-center gap-1">
                  
                  {/* 1. THỜI GIAN (MÀU ĐỎ - BÊN TRÁI) */}
                  <span className="bg-red-600 text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md whitespace-nowrap">
                     {timeAgo(truyen.updatedAt)}
                  </span>

                  {/* 2. CHƯƠNG (MÀU XANH - BÊN PHẢI) */}
                  <span className="bg-green-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md whitespace-nowrap">
                     {formatChapter(truyen)}
                  </span>
              </div>

            </div>
            <h4 className="text-gray-200 text-xs md:text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5em]">
              {truyen.name}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HugeGridSection;