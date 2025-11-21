import React from 'react';
import { Link } from 'react-router-dom';
import { RiFacebookFill, RiInstagramLine, RiTwitterXFill, RiYoutubeFill, RiSendPlaneFill } from 'react-icons/ri';

const Footer = () => {
  return (
    <footer className="relative bg-[#0a0a16] text-gray-300 pt-16 pb-8 border-t border-white/5 overflow-hidden">
      
      {/* Hiệu ứng nền */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Cột 1: Logo & Giới thiệu */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Nền tảng đọc truyện tranh miễn phí hàng đầu Việt Nam. Cập nhật liên tục, đa dạng thể loại, cộng đồng sôi nổi.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-[#1f1f3a] flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                <RiFacebookFill />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#1f1f3a] flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all transform hover:-translate-y-1">
                <RiInstagramLine />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#1f1f3a] flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all transform hover:-translate-y-1">
                <RiTwitterXFill />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#1f1f3a] flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-1">
                <RiYoutubeFill />
              </a>
            </div>
          </div>

          {/* Cột 2: Khám Phá */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 border-l-4 border-primary pl-3">Khám Phá</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/danh-sach" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> Truyện Mới Cập Nhật</Link></li>
              <li><Link to="/xep-hang" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> Bảng Xếp Hạng</Link></li>
              <li><Link to="/the-loai/manga" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> Manga Nhật Bản</Link></li>
              <li><Link to="/the-loai/manhwa" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> Manhwa Hàn Quốc</Link></li>
              <li><Link to="/the-loai/manhua" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> Manhua Trung Quốc</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ Trợ */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 border-l-4 border-purple-500 pl-3">Hỗ Trợ</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/chinh-sach" className="hover:text-primary transition-colors">Chính Sách Bảo Mật</Link></li>
              <li><Link to="/dieu-khoan" className="hover:text-primary transition-colors">Điều Khoản Sử Dụng</Link></li>
              <li><Link to="/lien-he" className="hover:text-primary transition-colors">Liên Hệ Quảng Cáo</Link></li>
              <li><Link to="/dmca" className="hover:text-primary transition-colors">Vấn Đề Bản Quyền (DMCA)</Link></li>
            </ul>
          </div>

          {/* Cột 4: Đăng Ký Nhận Tin */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 border-l-4 border-green-500 pl-3">Nhận Thông Báo</h3>
            <p className="text-xs text-gray-500 mb-4">Đăng ký để nhận thông báo về các chương truyện mới nhất.</p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                    <input 
                        type="email" 
                        placeholder="Email của bạn..." 
                        className="w-full bg-[#1f1f3a] text-white text-sm px-4 py-3 rounded-lg border border-white/5 focus:border-primary focus:outline-none"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white p-1 transition-colors">
                        <RiSendPlaneFill size={18} />
                    </button>
                </div>
            </form>
          </div>

        </div>
        
        {/* Copyright */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600 text-center md:text-left">
            © 2026 TruyenVietHay. All rights reserved. <br className="md:hidden"/> Designed for Community.
          </p>
          <div className="flex items-center gap-6">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Made with ❤️ by You</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;