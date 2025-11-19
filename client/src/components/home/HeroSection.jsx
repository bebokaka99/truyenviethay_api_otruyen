import React from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightSLine } from 'react-icons/ri';

const HugeGridSection = ({ title, stories, domainAnh }) => {
  if (!stories || stories.length === 0) return null;
  
  const formatChapter = (truyen) => {
    const chapRaw = truyen.latest_chapter || (truyen.chaptersLatest && truyen.chaptersLatest[0]?.chapter_name) || 'Full';
    const chapNum = chapRaw.replace(/chapter/gi, '').replace(/chương/gi, '').trim();
    return isNaN(chapNum) && chapNum !== 'Full' ? `Chương ${chapNum}` : (chapNum === 'Full' ? 'Full' : `Chương ${chapNum}`);
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

      {/* ĐÃ SỬA: grid-cols-2 cho mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
        {stories.map((truyen) => (
          <Link key={truyen._id} to={`/truyen-tranh/${truyen.slug}`} className="flex flex-col gap-2 group cursor-pointer">
            <div className="w-full aspect-[2/3] bg-[#1f1f3a] rounded-lg overflow-hidden relative border border-white/5 group-hover:border-green-500/50 transition-all shadow-sm">
              <img 
                src={`${domainAnh}/uploads/comics/${truyen.thumb_url}`}
                alt={truyen.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Badge Chapter nhỏ gọn */}
              <div className="absolute top-1.5 right-1.5 bg-green-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                 {formatChapter(truyen)}
              </div>
              
              {/* Overlay đọc ngay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hidden md:flex">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Đọc ngay</span>
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