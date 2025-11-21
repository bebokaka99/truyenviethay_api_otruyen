import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { 
  RiRocketLine, RiUserHeartLine, RiBookOpenLine, 
  RiGlobalLine, RiShieldCheckLine, RiFlashlightLine 
} from 'react-icons/ri';

const AboutPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0a16] font-display text-gray-300 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        
        {/* --- HERO SECTION --- */}
        <div className="relative py-20 px-6 text-center overflow-hidden">
            {/* Background Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                    Khám Phá Thế Giới <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Truyện Tranh Vô Tận</span>
                </h1>
                <p className="text-lg text-gray-400 leading-relaxed mb-8">
                    TruyenVietHay là nền tảng đọc truyện tranh miễn phí hàng đầu, nơi kết nối đam mê của hàng triệu độc giả với những bộ truyện hấp dẫn nhất hành tinh.
                </p>
                <Link to="/danh-sach" className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-105">
                    <RiRocketLine size={20} /> Bắt Đầu Đọc Ngay
                </Link>
            </div>
        </div>

        {/* --- STATS SECTION --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { num: '10,000+', label: 'Đầu Truyện', icon: <RiBookOpenLine /> },
                    { num: '500K+', label: 'Thành Viên', icon: <RiUserHeartLine /> },
                    { num: '1M+', label: 'Lượt Đọc/Ngày', icon: <RiGlobalLine /> },
                    { num: '24/7', label: 'Cập Nhật', icon: <RiFlashlightLine /> },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-[#1a1a2e] border border-white/5 p-6 rounded-2xl text-center hover:border-white/10 transition-colors group">
                        <div className="w-12 h-12 mx-auto bg-[#252538] rounded-full flex items-center justify-center text-primary mb-3 text-2xl group-hover:scale-110 transition-transform">
                            {stat.icon}
                        </div>
                        <h3 className="text-2xl font-black text-white">{stat.num}</h3>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* --- MISSION & VISION --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-lg opacity-30 transform rotate-3"></div>
                    <div className="relative bg-[#151525] p-8 rounded-3xl border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-4">Sứ Mệnh Của Chúng Tôi</h3>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Chúng tôi tin rằng truyện tranh không chỉ là giải trí, mà là một cánh cửa dẫn đến những thế giới diệu kỳ. Sứ mệnh của TruyenVietHay là xóa bỏ rào cản ngôn ngữ và chi phí, mang những tác phẩm Manga, Manhwa, Manhua xuất sắc nhất đến với độc giả Việt Nam.
                        </p>
                        <p className="text-gray-400 leading-relaxed">
                            Chúng tôi cam kết xây dựng một cộng đồng văn minh, nơi mọi người có thể chia sẻ cảm xúc, đánh giá và kết bạn thông qua những trang truyện.
                        </p>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 flex-shrink-0 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                            <RiShieldCheckLine size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">Chất Lượng Hàng Đầu</h4>
                            <p className="text-gray-500 text-sm">
                                Hình ảnh sắc nét, bản dịch mượt mà và tốc độ tải trang siêu tốc là ưu tiên số 1 của chúng tôi.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 flex-shrink-0 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                            <RiUserHeartLine size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">Cộng Đồng Sôi Nổi</h4>
                            <p className="text-gray-500 text-sm">
                                Hệ thống cấp độ, nhiệm vụ và bình luận giúp bạn không chỉ đọc truyện mà còn "sống" cùng đam mê.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 flex-shrink-0 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                            <RiGlobalLine size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">Đa Dạng Thể Loại</h4>
                            <p className="text-gray-500 text-sm">
                                Từ Hành động, Phiêu lưu đến Ngôn tình, Đam mỹ... tất cả đều có tại kho tàng của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- CALL TO ACTION --- */}
        <div className="max-w-5xl mx-auto px-4 mb-20">
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#252538] rounded-3xl p-10 text-center border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                <h2 className="text-3xl font-black text-white mb-4 relative z-10">Sẵn Sàng Bước Vào Thế Giới Mới?</h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto relative z-10">
                    Đăng ký tài khoản ngay hôm nay để lưu tủ truyện, nhận thông báo chương mới và tham gia cộng đồng.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                    <Link to="/register" className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                        Đăng Ký Miễn Phí
                    </Link>
                    <Link to="/login" className="px-8 py-3 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors">
                        Đăng Nhập
                    </Link>
                </div>
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;