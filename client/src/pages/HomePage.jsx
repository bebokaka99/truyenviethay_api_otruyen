import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer'; 
import HeroSection from '../components/home/HeroSection'; 
import AutoSlideSection from '../components/home/AutoSlideSection';
import HugeGridSection from '../components/home/HugeGridSection';
import { RiTrophyFill } from 'react-icons/ri';

// Helper random số trang từ min đến max
const getRandomPage = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const HomePage = () => {
  // --- STATE ---
  const [newUpdateStories, setNewUpdateStories] = useState([]); 
  const [hotStories, setHotStories] = useState([]); 
  
  // State cho Top Rating (Mới)
  const [topRatedStories, setTopRatedStories] = useState([]); 

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
        // 1. Gọi API cấu hình Admin
        try {
            const settingRes = await axios.get('/api/user/public/settings');
            setSettingsMap(settingRes.data);
        } catch (e) { console.error("Lỗi lấy settings:", e); }

        // 2. Lấy cấu hình chung & Slider (Mới cập nhật)
        const homeRes = await axios.get('https://otruyenapi.com/v1/api/home');
        const domain = homeRes.data.data.APP_DOMAIN_CDN_IMAGE;
        setDomainAnh(domain);
        setNewUpdateStories(homeRes.data.data.items);

        // --- LOGIC FETCH TRUYỆN ---
        const fetchStories = async (url) => {
            const res = await axios.get(url);
            return res.data.data.items || [];
        };

        // --- LOGIC FETCH TOP RATING (MỚI) ---
        // Lấy danh sách Slug từ DB mình -> Gọi Otruyen lấy chi tiết
        const fetchTopRated = async () => {
            try {
                // Lấy Top Weekly cho nó sinh động
                const dbRes = await axios.get('/api/rating/top?type=weekly'); 
                const topList = dbRes.data; // List slug
                
                if (topList.length === 0) return [];

                const promises = topList.map(async (item) => {
                    try {
                        const detailRes = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${item.comic_slug}`);
                        return detailRes.data.data.item;
                    } catch (e) { return null; }
                });
                
                const results = await Promise.all(promises);
                return results.filter(s => s !== null);
            } catch (e) { return []; }
        };

        // 3. Random Page cho các thể loại (Để F5 là ra truyện khác)
        const pageManga = getRandomPage(1, 10);
        const pageManhwa = getRandomPage(1, 10);
        const pageManhua = getRandomPage(1, 10);
        const pageNgonTinh = getRandomPage(1, 10);

        // 4. Gọi song song tất cả
        const [hotData, topData, mangaData, manhwaData, manhuaData, ngonTinhData] = await Promise.all([
            fetchStories('https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=1'), // Hot thì lấy trang 1 cho chuẩn
            fetchTopRated(), // Top Rating từ DB mình
            fetchStories(`https://otruyenapi.com/v1/api/the-loai/manga?page=${pageManga}`),
            fetchStories(`https://otruyenapi.com/v1/api/the-loai/manhwa?page=${pageManhwa}`),
            fetchStories(`https://otruyenapi.com/v1/api/the-loai/manhua?page=${pageManhua}`),
            fetchStories(`https://otruyenapi.com/v1/api/the-loai/ngon-tinh?page=${pageNgonTinh}`),
        ]);

        setHotStories(hotData);
        setTopRatedStories(topData);
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

          {/* 1. Slider: Mới cập nhật */}
          <AutoSlideSection 
            title="Mới Cập Nhật" 
            stories={newUpdateStories} 
            domainAnh={domainAnh}
          />

          {/* 2. Grid: Truyện Hot (API Otruyen) */}
          <HugeGridSection 
            title="Truyện Hot Mới" 
            stories={hotStories} 
            domainAnh={domainAnh}
            hotMap={settingsMap} 
          />
          
          {/* 3. Grid: BXH Cộng Đồng (Dữ liệu thật từ User đánh giá) - MỚI */}
          {topRatedStories.length > 0 && (
              <div className="bg-gradient-to-b from-[#1f1f3a] to-[#101022]">
                  <div className="py-4 px-3 sm:px-8 md:px-20 flex items-center gap-2 text-yellow-500 mb-[-20px] pt-10">
                      <RiTrophyFill className="text-2xl animate-bounce" />
                      <span className="font-bold text-sm tracking-widest uppercase">Được yêu thích nhất tuần qua</span>
                  </div>
                  <HugeGridSection 
                    title="BXH Cộng Đồng" 
                    stories={topRatedStories} 
                    domainAnh={domainAnh}
                    hotMap={settingsMap}
                  />
              </div>
          )}

          {/* 4. Các thể loại (Đã Random Page) */}
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