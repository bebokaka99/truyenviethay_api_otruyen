import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/layouts/Header';
import HeroSection from '../components/home/HeroSection';
import AutoSlideSection from '../components/home/AutoSlideSection';
import HugeGridSection from '../components/home/HugeGridSection';

const HomePage = () => {
  const [newUpdateStories, setNewUpdateStories] = useState([]); // Slider
  const [hotStories, setHotStories] = useState([]); // Grid Hot (120 truyện)
  
  // State cho 3 danh sách mới
  const [mangaStories, setMangaStories] = useState([]);
  const [manhwaStories, setManhwaStories] = useState([]);
  const [manhuaStories, setManhuaStories] = useState([]);

  const [domainAnh, setDomainAnh] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Lấy thông tin cơ bản từ Home (Domain ảnh + Slider truyện mới)
        const homeRes = await axios.get('https://otruyenapi.com/v1/api/home');
        const domain = homeRes.data.data.APP_DOMAIN_CDN_IMAGE;
        setDomainAnh(domain);
        setNewUpdateStories(homeRes.data.data.items);

        // --- HÀM HELPER ĐỂ GỌI NHIỀU TRANG ---
        // Giúp lấy số lượng lớn truyện (page 1 -> pageLimit)
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
            return allItems;
        };

        // 2. Gọi dữ liệu song song cho các section
        const [hotData, mangaData, manhwaData, manhuaData] = await Promise.all([
            // Truyện Hot: Lấy 5 trang (khoảng 120 truyện)
            fetchMultiPage('https://otruyenapi.com/v1/api/danh-sach/truyen-moi', 5),
            
            // Manga: Lấy 2 trang (khoảng 48 truyện)
            fetchMultiPage('https://otruyenapi.com/v1/api/the-loai/manga', 2),
            
            // Manhwa: Lấy 2 trang
            fetchMultiPage('https://otruyenapi.com/v1/api/the-loai/manhwa', 2),
            
            // Manhua: Lấy 2 trang
            fetchMultiPage('https://otruyenapi.com/v1/api/the-loai/manhua', 2),
        ]);

        setHotStories(hotData);
        setMangaStories(mangaData);
        setManhwaStories(manhwaData);
        setManhuaStories(manhuaData);

        setLoading(false);

      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
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
           <p className="text-white/50 animate-pulse font-bold">Đang tải kho truyện Quicksand...</p>
        </div>
      ) : (
        <main className="flex-1 pb-20">
          <HeroSection />

          {/* 1. Slider: Truyện mới cập nhật */}
          <AutoSlideSection 
            title="Truyện Mới Cập Nhật" 
            stories={newUpdateStories} 
            domainAnh={domainAnh}
          />

          {/* 2. Grid: Truyện Hot Mới */}
          <HugeGridSection 
            title="Truyện Hot Mới" 
            stories={hotStories} 
            domainAnh={domainAnh}
          />

          {/* 3. Grid: Manga (Truyện Nhật) */}
          {/* Dùng background khác màu xíu để phân cách visually */}
          <div className="bg-[#0f0f25]"> 
            <HugeGridSection 
              title="Manga Nổi Bật" 
              stories={mangaStories} 
              domainAnh={domainAnh}
            />
          </div>

          {/* 4. Grid: Manhwa (Truyện Hàn) */}
          <HugeGridSection 
            title="Manhwa Cực Phẩm" 
            stories={manhwaStories} 
            domainAnh={domainAnh}
          />

          {/* 5. Grid: Manhua (Truyện Trung) */}
          <div className="bg-[#0f0f25]">
            <HugeGridSection 
              title="Manhua Chọn Lọc" 
              stories={manhuaStories} 
              domainAnh={domainAnh}
            />
          </div>
        </main>
      )}
    </div>
  );
};

export default HomePage;