import React from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightSLine, RiFireFill } from 'react-icons/ri';

const HugeGridSection = ({ title, stories, domainAnh, hotMap = {} }) => {
  if (!stories || stories.length === 0) return null;
  
  // Helper: Format Chương
  const formatChapter = (truyen) => {
    const chapRaw = truyen.latest_chapter || (truyen.chaptersLatest && truyen.chaptersLatest[0]?.chapter_name) || 'Full';
    const chapNum = chapRaw.replace(/chapter/gi, '').replace(/chương/gi, '').trim();
    return isNaN(chapNum) && chapNum !== 'Full' ? `Chương ${chapNum}` : (chapNum === 'Full' ? 'Full' : `Chương ${chapNum}`);
  };

  // Helper: Tính thời gian
  const timeAgo = (dateString) => {
      if (!dateString) return '';
      const now = new Date();
      const date = new Date(dateString);
      const seconds = Math.floor((now - date) / 1000);

      if (seconds < 60) return 'Vừa xong';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} phút`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} giờ`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} ngày`;
      return date.toLocaleDateString('vi-VN');
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
        {stories.map((truyen) => {
            // Lấy cấu hình từ hotMap (Admin đã set)
            const setting = hotMap[truyen.slug];
            const isHidden = setting?.is_hidden;
            const isHot = setting?.is_hot;

            // Nếu Admin ẩn truyện này -> Không render
            if (isHidden) return null;

            return (
              <Link key={truyen._id} to={`/truyen-tranh/${truyen.slug}`} className="flex flex-col gap-2 group cursor-pointer relative">
                <div className="w-full aspect-[2/3] bg-[#1f1f3a] rounded-lg overflow-hidden relative border border-white/5 group-hover:border-green-500/50 transition-all shadow-sm">
                  <img 
                    src={`${domainAnh}/uploads/comics/${truyen.thumb_url}`}
                    alt={truyen.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* --- BADGE GROUP --- */}
                  <div className="absolute top-1.5 right-1.5 flex flex-wrap justify-end items-center gap-1 max-w-[90%]">
                      
                      {/* 1. BADGE HOT (Vàng) */}
                      {isHot && (
                          <span className="bg-yellow-500 text-black text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md flex items-center gap-0.5 animate-pulse">
                             <RiFireFill size={10} /> HOT
                          </span>
                      )}

                      {/* 2. BADGE THỜI GIAN (Đỏ) */}
                      <span className="bg-red-600 text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md whitespace-nowrap">
                         {timeAgo(truyen.updatedAt)}
                      </span>

                      {/* 3. BADGE CHƯƠNG (Xanh) */}
                      <span className="bg-green-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md whitespace-nowrap">
                         {formatChapter(truyen)}
                      </span>
                  </div>
                </div>
                <h4 className="text-gray-200 text-xs md:text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5em]">
                  {truyen.name}
                </h4>
              </Link>
            );
        })}
      </div>
    </div>
  );
};

export default HugeGridSection;