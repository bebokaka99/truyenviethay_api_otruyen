// src/components/comic/RecommendedComicsSection.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { RiEyeFill, RiArrowRightSLine } from 'react-icons/ri';

// URL Cố định
const COMIC_IMAGE_DOMAIN = 'https://img.otruyenapi.com/uploads/comics/';

const RecommendedComicsSection = ({ currentSlug = null, limit = 5 }) => { // Giảm limit mặc định xuống 5 cho gọn sidebar
    const [suggestedComics, setSuggestedComics] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- HÀM FETCH GỢI Ý ---
    const fetchRandomSuggestions = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Lấy danh sách truyện mới
            const randomPage = Math.floor(Math.random() * 10) + 1;
            const res = await axios.get(`https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${randomPage}`);
            let items = res.data?.data?.items || [];

            // 2. Lọc bỏ truyện hiện tại
            if (currentSlug) {
                items = items.filter(item => item.slug !== currentSlug);
            }

            // 3. Xáo trộn và lấy số lượng
            const shuffled = items.sort(() => 0.5 - Math.random()).slice(0, limit + 2);

            // 4. Gọi API chi tiết và xử lý dữ liệu
            const detailedSuggestions = await Promise.all(shuffled.map(async (item) => {
                try {
                    const detailRes = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${item.slug}`);
                    const comicData = detailRes.data.data.item;
                    
                    // --- SỬA ĐỔI: LẤY CHƯƠNG MỚI NHẤT ---
                    let latestChap = 'Full';
                    // Lấy dữ liệu server đầu tiên
                    const serverData = comicData.chapters?.[0]?.server_data;
                    if (serverData && serverData.length > 0) {
                        // Lấy phần tử CUỐI CÙNG trong mảng để được chương mới nhất
                        latestChap = serverData[serverData.length - 1].chapter_name;
                    }
                    // ------------------------------------

                    return {
                        _id: comicData._id,
                        slug: comicData.slug,
                        name: comicData.name,
                        thumb_url: comicData.thumb_url,
                        latest_chapter: latestChap, // Sử dụng chương mới nhất vừa lấy
                        category: comicData.category || [],
                        status: comicData.status
                    };
                } catch (err) {
                    return null;
                }
            }));

            // 5. Lọc và cắt đúng số lượng
            setSuggestedComics(detailedSuggestions.filter(item => item !== null).slice(0, limit));

        } catch (error) {
            console.error("Lỗi component gợi ý:", error);
            setSuggestedComics([]);
        } finally {
            setLoading(false);
        }
    }, [currentSlug, limit]);

    useEffect(() => {
        fetchRandomSuggestions();
    }, [fetchRandomSuggestions]);


    // --- HELPER RENDER ITEM ---
    const renderSuggestionItem = (item) => (
        <Link key={item._id} to={`/truyen-tranh/${item.slug}`} className="flex gap-3 group rounded-xl hover:bg-white/5 p-2 transition-all border border-transparent hover:border-white/10 bg-[#1f1f3a]">
            <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors relative shadow-sm">
                <img src={`${COMIC_IMAGE_DOMAIN}${item.thumb_url}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                {item.status === 'completed' && <span className="absolute bottom-0 right-0 bg-green-500 text-[8px] font-bold text-black px-1 rounded-tl-md">FULL</span>}
            </div>
            <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white truncate-2-lines group-hover:text-primary transition-colors leading-tight">{item.name}</h3>
                    {/* Hiển thị chương mới nhất với tiền tố "Chương" */}
                    <p className="text-xs text-green-500 font-bold mt-1 truncate">
                        {item.latest_chapter ? (item.latest_chapter.toLowerCase().includes('chapter') ? item.latest_chapter : `Chương ${item.latest_chapter}`) : 'Đang cập nhật'}
                    </p>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                    {item.category.slice(0, 2).map(cat => (
                        <span key={cat.id} className="text-[9px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded truncate border border-white/5">{cat.name}</span>
                    ))}
                </div>
            </div>
        </Link>
    );

    // --- HELPER RENDER SKELETON (Sửa lại bố cục dọc) ---
    const renderSuggestionSkeleton = () => (
        // SỬA ĐỔI: Sử dụng flex-col thay vì grid để luôn hiển thị 1 cột
        <div className="flex flex-col gap-4">
            {Array(limit).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3 p-2 bg-white/5 rounded-xl animate-pulse">
                    <div className="w-20 h-28 bg-white/10 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 flex flex-col gap-2 py-1">
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-3 bg-white/10 rounded w-1/2"></div>
                        <div className="flex gap-1 mt-auto">
                            <div className="h-3 bg-white/10 rounded w-10"></div>
                            <div className="h-3 bg-white/10 rounded w-10"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // --- RENDER CHÍNH ---
    return (
        <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                    <RiEyeFill className="text-primary" /> CÓ THỂ BẠN THÍCH
                </h2>
                <Link to="/danh-sach" className="text-xs text-gray-500 hover:text-primary flex items-center transition-colors">
                    Xem thêm <RiArrowRightSLine />
                </Link>
            </div>

            {/* Content Body */}
            <div className="p-4">
                {loading ? renderSuggestionSkeleton() : (
                    suggestedComics.length > 0 ? (
                        // SỬA ĐỔI: Sử dụng flex-col để luôn hiển thị 1 cột trên mọi thiết bị
                        <div className="flex flex-col gap-4">
                            {suggestedComics.map(item => renderSuggestionItem(item))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 text-xs py-6">Không có gợi ý nào.</p>
                    )
                )}
            </div>
        </div>
    );
};

export default RecommendedComicsSection;