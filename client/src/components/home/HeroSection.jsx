import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import Auth
import { RiRocket2Fill, RiArrowRightLine, RiFireFill } from 'react-icons/ri';

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Hàm xử lý khi bấm nút chính (CTA)
  const handleMainCta = () => {
    if (user) {
      // Đã đăng nhập -> Vào Tủ Truyện cá nhân
      navigate('/theo-doi');
    } else {
      // Chưa đăng nhập -> Vào trang Giới thiệu/Khám phá
      navigate('/about');
    }
  };

  return (
    // Giữ nguyên class của bạn để bảo toàn tỷ lệ
    <div className="relative w-full mb-8 md:mb-12 group font-display bg-gray-900">
      
      {/* Background Image Container */}
      <div 
        className="relative flex min-h-[50vh] md:min-h-[65vh] flex-col gap-4 md:gap-6 items-start justify-center px-4 sm:px-8 md:px-20 pb-10 overflow-hidden"
      >
        {/* 1. Ảnh nền - Trả về src gốc của bạn để đúng tỷ lệ */}
        <div className="absolute inset-0 z-0">
            <img 
                src="/images/banner.jpg" 
                alt="Banner" 
                className="w-full h-full object-cover object-center opacity-60"
                onError={(e) => {
                    // Fallback nếu ảnh local lỗi: dùng ảnh online nhưng chọn ảnh có tỷ lệ ngang (banner)
                    e.target.src = 'https://img.otruyenapi.com/uploads/comics/vo-luyen-dinh-phong-thumb.jpg'; 
                    // Lưu ý: Nếu dùng ảnh online thumbnail (dọc) vào đây vẫn sẽ bị cắt, 
                    // tốt nhất bạn nên đảm bảo file /images/banner.jpg tồn tại trong thư mục public.
                }}
            />
            {/* Gradient phủ lên ảnh */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f1e] via-[#0f0f1e]/80 to-transparent/30"></div>
        </div>

        {/* 2. Nội dung text */}
        <div className="relative z-10 flex flex-col gap-3 md:gap-5 text-left max-w-3xl mt-10 md:mt-0 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] md:text-xs font-bold tracking-wider uppercase w-fit backdrop-blur-md">
            <RiFireFill /> #1 Web Truyện Tranh
          </span>
          
          <h1 className="text-white text-3xl sm:text-5xl md:text-7xl font-heading font-black leading-tight drop-shadow-2xl">
            Thế Giới Truyện <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Đa Sắc Màu</span>
          </h1>
          
          <p className="text-gray-300 text-sm md:text-lg max-w-xl leading-relaxed font-medium opacity-90 line-clamp-3 md:line-clamp-none">
            Kho tàng Manhwa, Manga, Manhua cập nhật liên tục 24/7. Giao diện mượt mà, tối ưu trải nghiệm đọc trên mọi thiết bị.
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            
            {/* NÚT CHÍNH (Primary CTA) - Logic thay đổi theo User */}
            <button 
                onClick={handleMainCta}
                className="flex items-center justify-center gap-2 rounded-full h-10 md:h-12 px-6 md:px-8 bg-primary text-white text-sm md:text-base font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/40 hover:-translate-y-1"
            >
              <RiRocket2Fill size={20} />
              {user ? 'Vào Tủ Truyện' : 'Khám Phá Ngay'}
            </button>

            {/* NÚT PHỤ (Secondary) - Logic thay đổi theo User */}
            {user ? (
                // Nếu đã đăng nhập -> Nút phụ dẫn ra Danh sách truyện
                <Link to="/danh-sach" className="flex items-center justify-center gap-2 rounded-full h-10 md:h-12 px-6 md:px-8 bg-white/5 border border-white/10 text-white text-sm md:text-base font-bold hover:bg-white/10 transition-colors backdrop-blur-sm">
                    Tìm Truyện Mới <RiArrowRightLine />
                </Link>
            ) : (
                // Nếu chưa đăng nhập -> Nút phụ dẫn đi Đăng Ký
                <Link to="/register" className="flex items-center justify-center gap-2 rounded-full h-10 md:h-12 px-6 md:px-8 bg-white/5 border border-white/10 text-white text-sm md:text-base font-bold hover:bg-white/10 transition-colors backdrop-blur-sm">
                    Đăng Ký <RiArrowRightLine />
                </Link>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;