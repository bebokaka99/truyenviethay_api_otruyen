import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

const AutoSlideSection = ({ title, stories, domainAnh }) => {
  const scrollRef = useRef(null);

  // Logic Auto Slide
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const slideInterval = setInterval(() => {
      if (container) {
        container.scrollLeft += 1;
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
           container.scrollLeft = 0;
        }
      }
    }, 30);
    return () => clearInterval(slideInterval);
  }, [stories]);

  const scrollManual = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const formatChapter = (truyen) => {
    const chapRaw = truyen.latest_chapter || (truyen.chaptersLatest && truyen.chaptersLatest[0]?.chapter_name) || '?';
    const chapNum = chapRaw.replace(/chapter/gi, '').replace(/chương/gi, '').trim();
    return `Chương ${chapNum}`;
  };

  if (!stories || stories.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 py-8 border-b border-white/5 relative group/section font-display">
      <h3 className="text-white text-2xl md:text-3xl font-bold px-4 sm:px-8 md:px-20">
        {title}
      </h3>

      <div className="relative px-4 sm:px-8 md:px-20">
        {/* Nút Trái */}
        <button 
          onClick={() => scrollManual('left')} 
          className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-primary text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover/section:opacity-100 transition-opacity duration-300"
        >
          <RiArrowLeftSLine size={24} />
        </button>

        {/* Slider List */}
        <div 
          ref={scrollRef}
          className="overflow-x-auto no-scrollbar flex items-stretch gap-5 pb-4"
        >
          {stories.map((truyen) => (
            // --- SỬA THÀNH LINK ---
            <Link 
                key={truyen._id} 
                to={`/truyen-tranh/${truyen.slug}`}
                className="flex flex-col gap-3 min-w-[180px] w-[180px] group cursor-pointer flex-shrink-0"
            >
              <div className="w-full aspect-[2/3] bg-[#1f1f3a] rounded-xl overflow-hidden relative shadow-lg border border-white/5 group-hover:border-green-500/50 transition-all duration-300">
                <img 
                  src={`${domainAnh}/uploads/comics/${truyen.thumb_url}`}
                  alt={truyen.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Badge Chương */}
                <div className="absolute top-2 right-2">
                   <span className="bg-green-600 text-white text-[11px] font-bold px-2 py-1 rounded shadow-md">
                      {formatChapter(truyen)}
                   </span>
                </div>
                
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>

              <h4 className="text-white text-sm font-bold leading-snug truncate group-hover:text-green-400 transition-colors">
                {truyen.name}
              </h4>
            </Link>
          ))}
        </div>

        {/* Nút Phải */}
        <button 
          onClick={() => scrollManual('right')} 
          className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-primary text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover/section:opacity-100 transition-opacity duration-300"
        >
          <RiArrowRightSLine size={24} />
        </button>
      </div>
    </div>
  );
};

export default AutoSlideSection;