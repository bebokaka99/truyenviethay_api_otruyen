import React from 'react';
import { Link } from 'react-router-dom';
import logo from '/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white pt-16 pb-8 transition-colors">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="TruyenVietHay" className="h-8 w-auto" />
            </Link>
            <p className="text-gray-300 dark:text-gray-400 mb-6 max-w-md">
              Nền tảng đọc sách trực tuyến miễn phí hàng đầu Việt Nam. 
              Khám phá hàng ngàn tiểu thuyết và truyện tranh chất lượng cao.
            </p>
            <div className="flex space-x-4">
              <button className="w-10 h-10 flex items-center justify-center bg-blue-600 dark:bg-blue-500 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors cursor-pointer">
                <i className="ri-facebook-fill"></i>
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-pink-600 dark:bg-pink-500 rounded-full hover:bg-pink-700 dark:hover:bg-pink-600 transition-colors cursor-pointer">
                <i className="ri-instagram-line"></i>
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-blue-400 dark:bg-blue-300 rounded-full hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors cursor-pointer">
                <i className="ri-twitter-fill"></i>
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-red-600 dark:bg-red-500 rounded-full hover:bg-red-700 dark:hover:bg-red-600 transition-colors cursor-pointer">
                <i className="ri-youtube-fill"></i>
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Thể loại</h3>
            <ul className="space-y-2">
              <li><Link to="/genres/action" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">Hành động</Link></li>
              <li><Link to="/genres/romance" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">Ngôn tình</Link></li>
              <li><Link to="/genres/fantasy" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">Fantasy</Link></li>
              <li><Link to="/genres/martial-arts" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">Kiếm hiệp</Link></li>
              <li><Link to="/genres/school" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">Học đường</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">Trợ giúp</Link></li>
              <li><Link to="/contact" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">Liên hệ</Link></li>
              <li><Link to="/feedback" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">Góp ý</Link></li>
              <li><Link to="/report" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">Báo lỗi</Link></li>
              <li><Link to="/privacy" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">Chính sách</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 dark:border-gray-600 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              © 2026 Truyenviethay. Tất cả quyền được bảo lưu. Cảm ơn các độc giả và tác giả đã đồng hành cùng chúng tôi.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 text-sm transition-colors cursor-pointer">
                Điều khoản sử dụng
              </Link>
              <Link to="/privacy" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 text-sm transition-colors cursor-pointer">
                Chính sách bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;