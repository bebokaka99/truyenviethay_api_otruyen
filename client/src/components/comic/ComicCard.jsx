import React from 'react';

const ComicCard = ({ title, subtitle, image }) => {
  return (
    <div className="flex flex-col gap-2 min-w-[160px] md:min-w-[190px] group cursor-pointer">
      <div 
        className="w-full aspect-[3/4] bg-cover bg-center rounded-lg transform group-hover:scale-105 transition-transform duration-300"
        style={{ backgroundImage: `url("${image}")` }}
      ></div>
      <div>
        <p className="text-white text-base font-medium truncate">{title}</p>
        <p className="text-white/60 text-sm truncate">{subtitle}</p>
      </div>
    </div>
  );
};
export default ComicCard;