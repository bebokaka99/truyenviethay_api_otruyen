import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer'; 
import HeroSection from '../components/home/HeroSection'; 
import AutoSlideSection from '../components/home/AutoSlideSection';
import HugeGridSection from '../components/home/HugeGridSection';
import SkeletonCard from '../components/common/SkeletonCard'; 
import { RiTrophyFill } from 'react-icons/ri';

// Helper random số trang từ min đến max
const getRandomPage = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const HomePage = () => {
  const [newUpdateStories, setNewUpdateStories] = useState([]); 
  const [hotStories, setHotStories] = useState([]); 
  const [topRatedStories, setTopRatedStories] = useState([]); 

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

        // 2. Lấy cấu hình chung & Slider
        const homeRes = await axios.get('https://otruyenapi.com/v1/api/home');
        const domain = homeRes.data.data.APP_DOMAIN_CDN_IMAGE;
        setDomainAnh(domain);
        setNewUpdateStories(homeRes.data.data.items);

        // --- LOGIC FETCH TRUYỆN ---
        const fetchStories = async (url) => {
            const res = await axios.get(url);
            return res.data.data.items || [];
        };

        // --- LOGIC FETCH TOP RATING ---
        const fetchTopRated = async () => {
            try {
                const dbRes = await axios.get('/api/rating/top?type=weekly'); 
                const topList = dbRes.data;
                
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

        // 3. Random Page
        const pageManga = getRandomPage(1, 10);
        const pageManhwa = getRandomPage(1, 10);
        const pageManhua = getRandomPage(1, 10);
        const pageNgonTinh = getRandomPage(1, 10);

        // 4. Gọi song song
        const [hotData, topData, mangaData, manhwaData, manhuaData, ngonTinhData] = await Promise.all([
            fetchStories('https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=1'), 
            fetchTopRated(),
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

  // --- COMPONENT SKELETON RIÊNG CHO HOME ---
  if (loading) {
    return (
      <div className="relative min-h-screen w-full flex flex-col bg-background-dark font-display text-white overflow-x-hidden">
        <Header />
        <div className="flex-1 pb-20 w-full">
            
            {/* 1. Hero Skeleton */}
            <div className="w-full h-[50vh] md:h-[60vh] bg-[#1f1f3a] animate-pulse relative mb-12">
                <div className="absolute inset-0 bg-gradient-to-t from-[#101022] to-transparent"></div>
                <div className="absolute bottom-10 left-4 md:left-20 max-w-xl w-full p-4">
                    <div className="h-4 w-32 bg-white/10 rounded mb-4"></div>
                    <div className="h-10 w-3/4 bg-white/10 rounded mb-4"></div>
                    <div className="h-4 w-full bg-white/10 rounded mb-6"></div>
                    <div className="flex gap-4">
                        <div className="h-12 w-40 bg-white/10 rounded-full"></div>
                        <div className="h-12 w-40 bg-white/10 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* 2. List Skeletons (Mô phỏng các mục truyện) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
                {/* Giả lập 3 Section (Mới, Hot, Thể loại) */}
                {[1, 2, 3].map((i) => (
                    <div key={i}>
                        <div className="flex items-end gap-4 mb-6">
                            <div className="h-8 w-48 bg-white/10 rounded animate-pulse"></div>
                            <div className="h-px flex-1 bg-white/5"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {/* Mỗi section hiện 6 thẻ skeleton */}
                            {[...Array(6)].map((_, index) => (
                                <SkeletonCard key={index} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-background-dark font-display text-white overflow-x-hidden">
      <Header />
      
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
        
        {/* 3. Grid: BXH Cộng Đồng (Dữ liệu thật từ User đánh giá) */}
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

        {/* 4. Các thể loại */}
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

      <Footer />
    </div>
  );
};

export default HomePage;