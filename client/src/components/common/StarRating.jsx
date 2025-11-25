import React, { useState, useRef, useCallback } from 'react';
import { RiStarFill, RiStarHalfFill, RiStarLine } from 'react-icons/ri';

const StarRating = ({ rating, onRate, readonly = false, size = "text-2xl" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  // Ref này sẽ gắn vào lớp phủ tàng hình
  const overlayRef = useRef(null);

  // --- HÀM TÍNH TOÁN TOÁN HỌC (GIỮ NGUYÊN) ---
  const calculateRating = useCallback((clientX) => {
    if (!overlayRef.current) return 0;
    const { left, width } = overlayRef.current.getBoundingClientRect();
    let relativeX = clientX - left;
    relativeX = Math.max(0, Math.min(relativeX, width));
    const percent = relativeX / width;
    let rawScore = percent * 5;
    let finalScore = Math.ceil(rawScore * 2) / 2;
    return Math.max(0.5, Math.min(5, finalScore));
  }, []);


  // --- HANDLERS (GIỮ NGUYÊN) ---
  const handleMove = (clientX) => {
    if (readonly) return;
    const value = calculateRating(clientX);
    setHoverRating(value);
  };

  const handleLeave = () => {
    if (!readonly) setHoverRating(0);
  };

  const handleClickEnd = (e, clientX) => {
      if (!readonly && onRate) {
          if (e.cancelable && e.type === 'touchend') e.preventDefault();
          const finalScore = calculateRating(clientX);
          if (finalScore >= 0.5) {
              onRate(finalScore);
          }
          setHoverRating(0);
      }
  };

  const displayRating = hoverRating || rating;

  return (
    // CẤU TRÚC MỚI: Sử dụng flex để căn chỉnh ngôi sao và số điểm thẳng hàng
    <div className="flex items-center">
      
      {/* Wrapper CHỈ chứa các ngôi sao và lớp phủ */}
      {/* relative: để làm mốc cho lớp phủ absolute bên trong */}
      {/* inline-flex: để nó chỉ chiếm chiều rộng vừa đủ của các ngôi sao */}
      <div className="relative inline-flex items-center py-2">
          
          {/* --- LỚP HIỂN THỊ SAO (VISUAL LAYER) --- */}
          <div className="flex items-center gap-1 pointer-events-none">
            {[...Array(5)].map((_, i) => {
              const fullValue = i + 1;
              const halfValue = i + 0.5;
              return (
                <div key={i} className="relative transition-transform p-0.5">
                    {displayRating >= fullValue ? (
                        <RiStarFill className={`${size} text-yellow-400 drop-shadow-md`} />
                    ) : displayRating >= halfValue ? (
                        <RiStarHalfFill className={`${size} text-yellow-400 drop-shadow-md`} />
                    ) : (
                        <RiStarLine className={`${size} text-gray-600`} />
                    )}
                </div>
              );
            })}
          </div>
          
          {/* --- LỚP PHỦ CẢM ỨNG TÀNG HÌNH (TOUCH OVERLAY) --- */}
          {/* Nó sẽ phủ kín cái wrapper relative bên ngoài nó */}
          {!readonly && (
            <div
                ref={overlayRef}
                className="absolute inset-0 z-10 cursor-pointer touch-none"
                onMouseMove={(e) => handleMove(e.clientX)}
                onMouseLeave={handleLeave}
                onClick={(e) => handleClickEnd(e, e.clientX)}
                onTouchStart={(e) => handleMove(e.touches[0].clientX)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                onTouchEnd={(e) => handleClickEnd(e, e.changedTouches[0].clientX)}
            ></div>
          )}
      </div>

      {/* --- HIỂN THỊ SỐ ĐIỂM --- */}
      {/* Bây giờ nó là một flex item bình thường, không còn absolute nữa */}
      {!readonly && (
          <span className={`ml-3 font-bold text-lg min-w-[35px] ${hoverRating > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
              {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
          </span>
      )}
    </div>
  );
};

export default StarRating;