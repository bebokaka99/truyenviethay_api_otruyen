import React, { useState } from 'react';
import { RiStarFill, RiStarHalfFill, RiStarLine } from 'react-icons/ri';

const StarRating = ({ rating, onRate, readonly = false, size = "text-2xl" }) => {
  const [hoverRating, setHoverRating] = useState(0);

  // Xử lý khi di chuột trong ngôi sao để xác định trái/phải
  const handleMouseMove = (e, index) => {
    if (readonly) return;
    
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    
    // Nếu chuột ở nửa trái (< 50%) -> X.5, ngược lại -> X.0
    const value = percent < 0.5 ? index + 0.5 : index + 1;
    setHoverRating(value);
  };

  const handleClick = () => {
      if (!readonly && onRate) {
          onRate(hoverRating);
      }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => !readonly && setHoverRating(0)}>
      {[...Array(5)].map((_, i) => {
        const fullValue = i + 1;
        const halfValue = i + 0.5;

        return (
          <div
            key={i}
            className={`relative cursor-${readonly ? 'default' : 'pointer'} transition-transform hover:scale-110`}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={handleClick}
          >
             {/* Render Icon dựa trên giá trị */}
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
      
      {/* Hiển thị điểm số bên cạnh cho rõ */}
      {!readonly && (
          <span className={`ml-2 font-bold text-lg ${hoverRating > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
              {displayRating > 0 ? displayRating : '0'}
          </span>
      )}
    </div>
  );
};

export default StarRating;