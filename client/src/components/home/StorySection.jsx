import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

const StorySection = ({ title, stories, domainAnh }) => {
  const scrollRef = useRef(null);

  if (!stories || stories.length === 0) return null;

  // Hàm xử lý cuộn
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -600 : 600;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-4 py-8 border-b border-white/5">
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 sm:px-8 md:px-10">
        <div className="flex items-center gap-4">
          <h3 className="text-white text-2xl font-bold font-display">{title}</h3>
          {/* Điều hướng Trái/Phải */}
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary text-white flex items-center justify-center transition-colors">
              <RiArrowLeftSLine size={20} />
            </button>
            <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary text-white flex items-center justify-center transition-colors">
              <RiArrowRightSLine size={20} />
            </button>
          </div>
        </div>

        <Link to="/list" className="text-sm font-bold text-white/60 hover:text-primary flex items-center gap-1 transition-colors">
          Xem thêm
          <RiArrowRightSLine />
        </Link>
      </div>

      {/* Carousel List */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar px-4 sm:px-8 md:px-10 pb-8 pt-2"
      >
        <div className="flex items-stretch gap-5">
          {stories.map((truyen) => (
            <div key={truyen._id} className="flex flex-col gap-3 min-w-[170px] w-[170px] md:min-w-[190px] md:w-[190px] group cursor-pointer relative">
              {/* Ảnh bìa */}
              <div 
                className="w-full aspect-[2/3] bg-[#1f1f3a] rounded-xl overflow-hidden relative shadow-lg group-hover:-translate-y-2 transition-transform duration-300 ease-out"
              >
                <img 
                  src={`${domainAnh}/uploads/comics/${truyen.thumb_url}`}
                  alt={truyen.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Overlay gradient khi hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Badge Chapter */}
                <div className="absolute top-2 right-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md shadow-sm">
                   Chapter {truyen.latest_chapter || '?'}
                </div>
              </div>
              
              {/* Thông tin */}
              <div className="px-1">
                <h4 className="text-white text-[15px] font-bold leading-tight truncate group-hover:text-primary transition-colors">
                  {truyen.name}
                </h4>
                <p className="text-white/40 text-xs mt-1 truncate">
                  {truyen.author || 'Đang cập nhật'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorySection;