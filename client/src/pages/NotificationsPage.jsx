import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
    RiNotification3Line, RiLoader4Line, RiAlertLine, RiTaskLine, RiChat1Line, RiTimeLine, RiLayoutGridFill, RiBookOpenLine, RiArrowRightSLine, RiCheckDoubleFill
} from 'react-icons/ri';

// --- IMPORT HEADER & FOOTER ---
// Hãy đảm bảo đường dẫn này đúng với dự án của bạn
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';

// ĐỔI URL NẾU CẦN
const BACKEND_URL = 'https://truyenviethay-backend.onrender.com';
const COMIC_IMAGE_DOMAIN = 'https://img.otruyenapi.com/uploads/comics/';

const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [recommendedComics, setRecommendedComics] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(true);

    const tabs = [
        { id: 'all', label: 'Tất Cả', icon: RiLayoutGridFill },
        { id: 'system', label: 'Hệ Thống', icon: RiAlertLine },
        { id: 'quest', label: 'Nhiệm Vụ', icon: RiTaskLine },
        { id: 'comment', label: 'Bình Luận', icon: RiChat1Line },
    ];

    // --- HELPER: STYLE CHO THÔNG BÁO ---
    const getNotificationStyle = (type) => {
        switch (type) {
            case 'system': 
                return { icon: RiAlertLine, colorClass: 'text-red-500', borderClass: 'border-l-red-500', bg: 'bg-red-500/5', bgHover: 'hover:bg-red-500/10', iconBg: 'bg-red-500/10' };
            case 'quest': 
                return { icon: RiTaskLine, colorClass: 'text-green-400', borderClass: 'border-l-green-500', bg: 'bg-green-500/5', bgHover: 'hover:bg-green-500/10', iconBg: 'bg-green-600 text-white shadow-lg shadow-green-900/20' };
            case 'comment': 
            default: 
                return { icon: RiChat1Line, colorClass: 'text-blue-500', borderClass: 'border-l-blue-500', bg: 'bg-blue-500/5', bgHover: 'hover:bg-blue-500/10', iconBg: 'bg-blue-500/10' };
        }
    };

    // Hàm xáo trộn mảng (Fisher-Yates shuffle) để random truyện
    const shuffleArray = (array) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    };

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('user_token');
            const res = await axios.get(`${BACKEND_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
            setNotifications(res.data.items);
        } catch (error) { console.error("Lỗi tải thông báo:", error); } finally { setLoading(false); }
    }, [user]);

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('user_token');
             await axios.put(`${BACKEND_URL}/api/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
             setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) { console.error("Lỗi đánh dấu đã đọc:", error); }
    }


    useEffect(() => {
        fetchData();
        
        // FETCH GỢI Ý TRUYỆN NGẪU NHIÊN
        const fetchRecommendations = async () => {
            setLoadingRecs(true);
            try {
                const res = await axios.get('https://otruyenapi.com/v1/api/danh-sach/hoan-thanh?page=1');
                if (res.data?.data?.items) {
                    const shuffled = shuffleArray([...res.data.data.items]);
                    setRecommendedComics(shuffled.slice(0, 5));
                }
            } catch (e) { console.error("Lỗi tải gợi ý:", e); } finally { setLoadingRecs(false); }
        }

        fetchRecommendations();
        window.scrollTo(0, 0);
    }, [fetchData]);


    const filteredNotifications = notifications.filter(notif => activeTab === 'all' ? true : notif.type === activeTab);
    const unreadInTab = filteredNotifications.filter(n => !n.is_read).length;

    // --- RENDER KHI CHƯA ĐĂNG NHẬP (Vẫn có Header/Footer) ---
    if (!user) {
        return (
            <div className="flex flex-col min-h-screen bg-[#0a0a16] font-display">
                <Header />
                <main className="flex-grow flex items-center justify-center text-gray-400 pt-20">
                    Vui lòng đăng nhập để xem thông báo.
                </main>
                <Footer />
            </div>
        );
    }

    // --- RENDER CHÍNH ---
    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a16] font-display">
            {/* --- HEADER --- */}
            <Header />

            {/* --- MAIN CONTENT --- */}
            <main className="flex-grow pt-20 pb-12 animate-fade-in">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* === CỘT CHÍNH (THÔNG BÁO) === */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <RiNotification3Line className="text-primary text-2xl" />
                                    <h1 className="text-xl font-bold text-white">Hộp Thư Thông Báo</h1>
                                </div>
                                {notifications.some(n => !n.is_read) && (
                                    <button onClick={markAllAsRead} className="text-xs flex items-center gap-1 text-primary hover:text-blue-400 transition-colors font-bold px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20">
                                        <RiCheckDoubleFill size={14}/> Đánh dấu tất cả đã đọc
                                    </button>
                                )}
                            </div>
                            
                            {/* --- TABS --- */}
                            <div className="flex overflow-x-auto custom-scrollbar bg-[#151525] p-2 border-b border-white/5">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    const count = tab.id === 'all' ? notifications.length : notifications.filter(n => n.type === tab.id).length;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all mr-2 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            <Icon size={16} /> {tab.label}
                                            {count > 0 && (
                                                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-500'}`}>{count}</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Content List */}
                            <div className="p-4 sm:p-6 min-h-[300px]">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-primary gap-3"><RiLoader4Line className="animate-spin text-3xl" /><p className="text-sm font-medium">Đang tải thông báo...</p></div>
                                ) : filteredNotifications.length > 0 ? (
                                    <div className="flex flex-col gap-3 animate-fade-in">
                                        {unreadInTab > 0 && <div className="text-xs text-gray-500 font-medium pl-2 mb-1">Bạn có {unreadInTab} thông báo mới trong mục này.</div>}
                                        {filteredNotifications.map(notif => {
                                            const style = getNotificationStyle(notif.type);
                                            const Icon = style.icon;
                                            return (
                                                <Link to={notif.link || '#'} key={notif.id} className={`flex gap-4 p-4 rounded-xl transition-all border-l-4 ${notif.is_read ? `bg-white/5 hover:bg-white/10 border-transparent opacity-75` : `${style.bg} ${style.bgHover} ${style.borderClass} shadow-md hover:-translate-y-0.5 relative`}`}>
                                                    {!notif.is_read && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                                                    <div className={`mt-1 p-2 rounded-xl flex-shrink-0 flex items-center justify-center h-fit transition-all ${notif.is_read ? 'bg-white/5 text-gray-400' : style.iconBg || `bg-white/10 ${style.colorClass}`}`}>
                                                        <Icon size={22} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-sm font-bold mb-1 ${notif.is_read ? 'text-gray-300' : style.colorClass}`}>{notif.title}</p>
                                                        <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed line-clamp-3">{notif.type === 'system' ? notif.message.replace('. Lý do:', '.\nLý do:') : notif.message}</p>
                                                        <span className="text-xs text-gray-500 mt-2 flex items-center gap-1 font-medium"><RiTimeLine size={14} /> {new Date(notif.created_at).toLocaleString('vi-VN')}</span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-3">
                                        <RiNotification3Line size={40} className="opacity-50"/>
                                        <p>{activeTab === 'all' ? 'Bạn chưa có thông báo nào.' : `Không có thông báo loại "${tabs.find(t=>t.id===activeTab)?.label}".`}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* === CỘT SIDEBAR (GỢI Ý TRUYỆN NGẪU NHIÊN) === */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 shadow-xl overflow-hidden sticky top-24 animate-fade-in-right">
                            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2"><RiBookOpenLine className="text-green-500"/> Có Thể Bạn Thích</h2>
                                <Link to="/danh-sach" className="text-xs text-gray-500 hover:text-primary flex items-center transition-colors">Xem thêm <RiArrowRightSLine/></Link>
                            </div>
                            <div className="p-4">
                                {loadingRecs ? (
                                    <div className="flex justify-center py-10"><RiLoader4Line className="animate-spin text-primary text-2xl" /></div>
                                ) : recommendedComics.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {recommendedComics.map(comic => (
                                            <Link key={comic._id} to={`/truyen-tranh/${comic.slug}`} className="flex gap-3 group rounded-xl hover:bg-white/5 p-2 transition-all">
                                                <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors relative">
                                                    <img src={`${COMIC_IMAGE_DOMAIN}${comic.thumb_url}`} alt={comic.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                    {comic.status === 'completed' && <span className="absolute bottom-0 right-0 bg-green-500 text-[8px] font-bold text-black px-1 rounded-tl-md">FULL</span>}
                                                </div>
                                                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-white truncate-2-lines group-hover:text-primary transition-colors leading-tight">{comic.name}</h3>
                                                        <p className="text-xs text-green-500 font-bold mt-1 truncate">{comic.chaptersLatest?.[0]?.chapter_name ? `Chương ${comic.chaptersLatest[0].chapter_name}` : 'Đang cập nhật'}</p>
                                                    </div>
                                                    <div className="flex gap-1 mt-2 flex-wrap">
                                                        {comic.category.slice(0, 2).map(cat => (
                                                            <span key={cat.id} className="text-[9px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded truncate">{cat.name}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 text-xs py-6">Không có gợi ý nào.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <Footer />
        </div>
    );
};

export default NotificationsPage;