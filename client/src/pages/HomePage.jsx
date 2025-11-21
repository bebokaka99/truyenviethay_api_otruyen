import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer'; 
import HeroSection from '../components/home/HeroSection'; 
import AutoSlideSection from '../components/home/AutoSlideSection';
import HugeGridSection from '../components/home/HugeGridSection';

const HomePage = () => {
  // --- STATE ---
  const [newUpdateStories, setNewUpdateStories] = useState([]); // Slider
  const [hotStories, setHotStories] = useState([]); // Grid Hot
  
  // Các thể loại phổ biến
  const [mangaStories, setMangaStories] = useState([]);
  const [manhwaStories, setManhwaStories] = useState([]);
  const [manhuaStories, setManhuaStories] = useState([]);
  const [ngonTinhStories, setNgonTinhStories] = useState([]);

  const [domainAnh, setDomainAnh] = useState('');
  const [loading, setLoading] = useState(true);

  // State lưu danh sách HOT/ẨN từ Admin
  const [settingsMap, setSettingsMap] = useState({}); 

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Gọi API cấu hình Admin (Chạy song song hoặc trước)
        try {
             // Dùng đường dẫn tương đối vì đã có Proxy
            const settingRes = await axios.get('/api/user/public/settings');
            setSettingsMap(settingRes.data);
        } catch (e) { console.error("Lỗi lấy settings:", e); }

        // 2. Lấy cấu hình chung & Slider (API Home Otruyen)
        const homeRes = await axios.get('https://otruyenapi.com/v1/api/home');
        const domain = homeRes.data.data.APP_DOMAIN_CDN_IMAGE;
        setDomainAnh(domain);
        setNewUpdateStories(homeRes.data.data.items);

        // --- HÀM HELPER GỌI NHIỀU TRANG ---
        const fetchMultiPage = async (urlInfo, pageLimit) => {
            const promises = [];
            for (let i = 1; i <= pageLimit; i++) {
                promises.push(axios.get(`${urlInfo}?page=${i}`));
            }
            const responses = await Promise.all(promises);
            let allItems = [];
            responses.forEach(res => {
                if(res.data.data && res.data.data.items) {
                    allItems = [...allItems, ...res.data.data.items];
                }
            });
            // Lọc trùng lặp ID
            return Array.from(new Map(allItems.map(item => [item._id, item])).values());
        };

        // 3. Gọi song song dữ liệu các phần
        const [hotData, mangaData, manhwaData, manhuaData, ngonTinhData] = await Promise.all([
            fetchMultiPage('https://otruyenapi.com/v1/api/danh-sach/truyen-moi', 3),
            fetchMultiPage('https://otruyenapi.com/v1/api/the-loai/manga', 2),
            fetchMultiPage('https://otruyenapi.com/v1/api/the-loai/manhwa', 2),
            fetchMultiPage('https://otruyenapi.com/v1/api/the-loai/manhua', 2),
            fetchMultiPage('https://otruyenapi.com/v1/api/the-loai/ngon-tinh', 2),
        ]);

        setHotStories(hotData);
        setMangaStories(mangaData);
        setManhwaStories(manhwaData);
        setManhuaStories(manhuaData);
        setNgonTinhStories(ngonTinhData);

        setLoading(false);

      } catch (err) {
        console.error("Lỗi tải dữ liệu trang chủ:", err);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-background-dark font-display text-white overflow-x-hidden">
      <Header />
      
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
           <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mb-4"></div>
           <p className="text-white/50 animate-pulse font-bold text-sm">Đang tải kho truyện...</p>
        </div>
      ) : (
        <main className="flex-1 pb-20">
          
          <HeroSection />

          {/* Slider */}
          <AutoSlideSection 
            title="Mới Cập Nhật" 
            stories={newUpdateStories} 
            domainAnh={domainAnh}
          />

          {/* Truyền prop hotMap={settingsMap} vào tất cả các HugeGridSection 
             để chúng biết truyện nào là HOT hoặc ẨN
          */}

          <HugeGridSection 
            title="Truyện Hot Mới" 
            stories={hotStories} 
            domainAnh={domainAnh}
            hotMap={settingsMap} 
          />

          <div className="bg-[#151525]">
            <HugeGridSection 
              title="Manhwa Cực Phẩm" 
              stories={manhwaStories} 
              domainAnh={domainAnh}
              hotMap={settingsMap}
            />
          </div>

          <HugeGridSection 
            title="Manhua Chọn Lọc" 
            stories={manhuaStories} 
            domainAnh={domainAnh}
            hotMap={settingsMap}
          />

          <div className="bg-[#151525]">
            <HugeGridSection 
              title="Manga Kinh Điển" 
              stories={mangaStories} 
              domainAnh={domainAnh}
              hotMap={settingsMap}
            />
          </div>

          <HugeGridSection 
            title="Ngôn Tình Lãng Mạn" 
            stories={ngonTinhStories} 
            domainAnh={domainAnh}
            hotMap={settingsMap}
          />

        </main>
      )}

      <Footer />
    </div>
  );
};

export default HomePage;