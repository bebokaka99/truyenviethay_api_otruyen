import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import LoginModal from '../components/common/LoginModal';
import CommentSection from '../components/comic/CommentSection';
// --- IMPORT COMPONENT GỢI Ý MỚI ---
import RecommendedComicsSection from '../components/comic/RecommendedComicsSection';
// ----------------------------------
import StarRating from '../components/common/StarRating';
import Toast from '../components/common/Toast'
import SEO from '../components/common/SEO';
import {
    RiBookOpenLine, RiBookmarkLine, RiUser3Line, RiTimeLine,
    RiFileList2Line, RiListCheck, RiSortDesc, RiSortAsc,
    RiBookmarkFill, RiPlayCircleLine,
    RiFlag2Line, RiCloseLine, RiCheckLine
} from 'react-icons/ri';

// URL Backend
const BACKEND_URL = 'https://truyenviethay-backend.onrender.com';

const ComicDetailPage = () => {
    const { slug } = useParams();
    const { user } = useAuth();

    const [comic, setComic] = useState(null);
    const [chapters, setChapters] = useState([]);
    // ĐÃ XÓA STATE VÀ LOGIC GỢI Ý Ở ĐÂY
    const [loading, setLoading] = useState(true);
    const [domainAnh, setDomainAnh] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [sortDesc, setSortDesc] = useState(true);

    const [latestChapterApi, setLatestChapterApi] = useState('Mới');
    const [isFollowed, setIsFollowed] = useState(false);
    const [lastReadChapter, setLastReadChapter] = useState(null);
    const [followLoading, setFollowLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportSent, setReportSent] = useState(false);

    const [ratingInfo, setRatingInfo] = useState({ average: 0, total: 0, user_score: 0 });
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // 1. Fetch Data (Chỉ còn fetch chi tiết truyện)
    useEffect(() => {
        const fetchComicDetail = async () => {
            try {
                const userId = user ? user.id : '';
                const ratingPromise = axios.get(`${BACKEND_URL}/api/rating/comic/${slug}?userId=${userId}`);
                const comicPromise = axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`);
                const [ratingRes, comicRes] = await Promise.all([ratingPromise, comicPromise]);
                setRatingInfo(ratingRes.data);
                const data = comicRes.data.data;
                setComic(data.item);
                setDomainAnh(data.APP_DOMAIN_CDN_IMAGE);

                if (data.item.chapters && data.item.chapters.length > 0) {
                    const svData = data.item.chapters[0].server_data;
                    const sortedByNum = [...svData].sort((a, b) => parseFloat(b.chapter_name) - parseFloat(a.chapter_name));
                    setLatestChapterApi(sortedByNum[0].chapter_name);
                    setChapters(sortedByNum);
                } else {
                    setChapters([]);
                }

                if (user) {
                    const token = localStorage.getItem('user_token');
                    const headers = { Authorization: `Bearer ${token}` };
                    const [resFollow, resHistory] = await Promise.all([
                        axios.get(`${BACKEND_URL}/api/user/library/check/${slug}`, { headers }),
                        axios.get(`${BACKEND_URL}/api/user/history/check/${slug}`, { headers })
                    ]);
                    setIsFollowed(resFollow.data.isFollowed);
                    if (resHistory.data.chapter_name) setLastReadChapter(resHistory.data.chapter_name);
                }
                setLoading(false);
            } catch (error) { console.error(error); setLoading(false); }
        };
        setLoading(true);
        fetchComicDetail();
        window.scrollTo(0, 0);
    }, [slug, user]);

    // ĐÃ XÓA HÀM fetchRandomSuggestions VÀ useEffect CỦA NÓ Ở ĐÂY

    // --- HANDLERS ---
    const handleToggleFollow = async () => {
        if (!user) { setShowLoginModal(true); return; }
        setFollowLoading(true);
        const token = localStorage.getItem('user_token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            if (isFollowed) {
                await axios.delete(`${BACKEND_URL}/api/user/library/${slug}`, { headers });
                setIsFollowed(false); showToast("Đã bỏ theo dõi truyện!", "error");
            } else {
                await axios.post(`${BACKEND_URL}/api/user/library`, {
                    comic_slug: slug, comic_name: comic.name, comic_image: `${domainAnh}/uploads/comics/${comic.thumb_url}`, latest_chapter: latestChapterApi
                }, { headers });
                setIsFollowed(true); showToast("Đã thêm vào tủ truyện!", "success");
            }
        } catch (error) { showToast("Lỗi kết nối server!", "error"); } finally { setFollowLoading(false); }
    };

    const handleRate = async (score) => {
        if (!user) { setShowLoginModal(true); return; }
        if (score < 0.5 || isNaN(score)) return;
        try {
            const token = localStorage.getItem('user_token');
            const res = await axios.post(`${BACKEND_URL}/api/rating`, { comic_slug: slug, score: score }, { headers: { Authorization: `Bearer ${token}` } });
            setRatingInfo(prev => ({ ...prev, average: res.data.average, total: res.data.total, user_score: score }));
            showToast(`Đánh giá ${score} sao thành công!`, "success");
        } catch (e) { showToast(e.response?.data?.message || "Lỗi khi đánh giá", "error"); }
    };

    const handleSubmitReport = async () => {
        if (!reportReason) return;
        if (!user) { setShowLoginModal(true); return; }
        try {
            const token = localStorage.getItem('user_token');
            await axios.post(`${BACKEND_URL}/api/reports`, { comic_slug: slug, chapter_name: 'Trang Chi Tiết', reason: reportReason }, { headers: { Authorization: `Bearer ${token}` } });
            setReportSent(true); setTimeout(() => { setReportSent(false); setShowReportModal(false); setReportReason(''); showToast("Đã gửi báo lỗi thành công!", "success"); }, 2000);
        } catch (error) { showToast("Gửi thất bại. Vui lòng thử lại!", "error"); }
    };

    const coverImage = comic ? `${domainAnh}/uploads/comics/${comic.thumb_url}` : '';
    const authors = comic ? (Array.isArray(comic.author) ? comic.author.join(', ') : (comic.author || 'Đang cập nhật')) : '';
    const formatChapter = (name) => name.toLowerCase().includes('chapter') ? name : `Chương ${name}`;

    const sortedChapters = [...chapters].sort((a, b) => {
        const numA = parseFloat(a.chapter_name); const numB = parseFloat(b.chapter_name);
        if (isNaN(numA) || isNaN(numB)) return 0; return sortDesc ? numB - numA : numA - numB;
    });
    const firstStoryChap = chapters.length > 0 ? [...chapters].sort((a, b) => parseFloat(a.chapter_name) - parseFloat(b.chapter_name))[0] : null;

    const seoData = comic ? { title: comic.name, description: comic.content?.replace(/<[^>]+>/g, '').substring(0, 160) + '...', image: coverImage, url: `/truyen-tranh/${slug}` } : null;

    // ĐÃ XÓA CÁC HÀM HELPER RENDER GỢI Ý Ở ĐÂY

    // --- SKELETON LOADING UI ---
    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 pb-20">
                <Header />
                <div className="relative w-full h-[200px] md:h-[320px] bg-[#1f1f3a] animate-pulse"></div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-40 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
                        <div className="flex-shrink-0 w-[140px] md:w-[200px] h-[210px] md:h-[300px] rounded-lg bg-[#252538] border-2 border-white/10 animate-pulse"></div>
                        <div className="flex-1 w-full flex flex-col gap-4 items-center md:items-start">
                            <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse"></div>
                            <div className="flex gap-2"><div className="h-6 w-20 bg-white/10 rounded animate-pulse"></div><div className="h-6 w-20 bg-white/10 rounded animate-pulse"></div></div>
                            <div className="h-10 w-full max-w-md bg-white/10 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-8 pb-8 border-b border-white/5"><div className="h-12 w-40 bg-white/10 rounded-full animate-pulse"></div><div className="h-12 w-40 bg-white/10 rounded-full animate-pulse"></div></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                        <div className="lg:col-span-2 flex flex-col gap-8"><div className="h-32 w-full bg-white/5 rounded-xl animate-pulse"></div><div className="h-60 w-full bg-white/5 rounded-xl animate-pulse"></div></div>
                        <div className="hidden lg:block h-96 bg-white/5 rounded-xl animate-pulse"></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!comic) return <div className="min-h-screen bg-[#101022] text-white flex items-center justify-center">Truyện không tồn tại</div>;

    return (
        <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 pb-20">
            {seoData && <SEO title={seoData.title} description={seoData.description} image={seoData.image} url={seoData.url} />}
            <Header />
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            <div className="relative w-full h-[200px] md:h-[320px] overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center blur-[20px] opacity-30" style={{ backgroundImage: `url("${coverImage}")` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#101022] via-[#101022]/60 to-transparent"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-40 relative z-10">
                {/* INFO SECTION */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
                    <div className="flex-shrink-0 w-[140px] md:w-[200px] rounded-lg shadow-2xl border-2 border-white/10 overflow-hidden relative bg-[#1f1f3a]">
                        <img src={coverImage} alt={comic.name} className="w-full aspect-[2/3] object-cover" />
                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${comic.status === 'ongoing' ? 'bg-green-600' : 'bg-blue-600'}`}>{comic.status === 'ongoing' ? 'Đang tiến hành' : 'Hoàn thành'}</div>
                    </div>
                    <div className="flex-1 text-center md:text-left flex flex-col gap-3 w-full">
                        <h1 className="text-2xl md:text-4xl font-black text-white leading-tight font-heading drop-shadow-md">{comic.name}</h1>
                        <p className="text-sm text-gray-400 line-clamp-2"><span className="font-bold text-primary">Tên khác: </span>{comic.origin_name && comic.origin_name.length > 0 ? comic.origin_name.join(' | ') : comic.name}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 text-sm mt-1">
                            {comic.category && comic.category.map((cat) => (<Link key={cat.id} to={`/the-loai/${cat.slug}`} className="px-2.5 py-0.5 rounded border border-white/10 bg-[#252538] text-gray-400 text-xs font-bold hover:text-primary hover:border-primary transition-colors uppercase">{cat.name}</Link>))}
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-8 text-sm mt-2 bg-[#1a1a2e]/80 backdrop-blur-sm p-3 rounded-lg border border-white/5 w-fit mx-auto md:mx-0">
                            <div className="flex items-center gap-2"><RiUser3Line className="text-primary" /><span className="text-gray-300 font-bold text-xs md:text-sm">{authors}</span></div>
                            <div className="w-px h-3 bg-white/20 hidden md:block"></div>
                            <div className="flex items-center gap-2"><RiTimeLine className="text-primary" /><span className="text-gray-300 text-xs md:text-sm">{comic.updatedAt ? new Date(comic.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
                        </div>
                        <div className="mt-4 p-3 bg-[#1a1a2e] border border-white/10 rounded-xl max-w-md mx-auto md:mx-0">
                            <div className="flex items-center gap-3 mb-2 justify-center md:justify-start"><span className="text-3xl font-black text-yellow-500 leading-none">{ratingInfo.average || "0.0"}</span><div className="flex flex-col items-start"><StarRating rating={parseFloat(ratingInfo.average)} readonly={true} size="text-sm" /><span className="text-[10px] text-gray-400 mt-0.5">{ratingInfo.total > 0 ? `${ratingInfo.total} người đã đánh giá` : 'Chưa có đánh giá'}</span></div></div>
                            <div className="border-t border-white/5 pt-2 flex items-center justify-between gap-4"><span className="text-xs text-gray-300 font-bold">{user ? "Bạn chấm mấy điểm?" : "Đăng nhập để chấm điểm"}</span><StarRating rating={ratingInfo.user_score} onRate={handleRate} readonly={!user} size="text-lg" /></div>
                        </div>
                    </div>
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col md:flex-row gap-3 mt-6 md:mt-8 border-b border-white/5 pb-8">
                    {lastReadChapter && (<Link to={`/doc-truyen/${slug}/${lastReadChapter}`} className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 md:py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-orange-900/30 border border-orange-500"><RiPlayCircleLine size={20} /> <span className="uppercase text-sm">Đọc Tiếp Chương {lastReadChapter}</span></Link>)}
                    {firstStoryChap ? (<Link to={`/doc-truyen/${slug}/${firstStoryChap.chapter_name}`} className={`flex-1 md:flex-none font-bold py-3 md:py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95 ${lastReadChapter ? 'bg-[#252538] hover:bg-white/10 text-white border border-white/10' : 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-900/30'}`}><RiBookOpenLine size={20} /> <span className="uppercase text-sm">{lastReadChapter ? 'Đọc Lại Từ Đầu' : 'Đọc Từ Đầu'}</span></Link>) : <button disabled className="flex-1 md:flex-none bg-gray-700 text-gray-400 font-bold py-3 px-8 rounded-full cursor-not-allowed flex items-center justify-center gap-2">Chưa có chương</button>}
                    <button onClick={handleToggleFollow} disabled={followLoading} className={`flex-1 md:flex-none font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-colors border ${isFollowed ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : 'bg-[#252538] hover:bg-white/10 text-white border-white/10'}`}>{isFollowed ? <RiBookmarkFill size={20} /> : <RiBookmarkLine size={20} />}<span className="uppercase text-sm">{isFollowed ? 'Đã Theo Dõi' : 'Theo Dõi'}</span></button>
                    <button onClick={() => setShowReportModal(true)} className="w-12 h-12 rounded-full bg-[#252538] hover:text-yellow-500 hover:bg-yellow-500/10 border border-white/10 flex items-center justify-center transition-colors mx-auto md:mx-0" title="Báo lỗi"><RiFlag2Line size={20} /></button>
                </div>

                {/* BODY CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* CỘT CHÍNH (Nội dung + Chương + Comment) */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <section>
                            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3 uppercase tracking-wide border-l-4 border-primary pl-3"><RiFileList2Line /> Nội Dung</h3>
                            <div className={`relative text-sm text-gray-400 leading-7 bg-[#1a1a2e] p-5 rounded-xl border border-white/5 ${isExpanded ? '' : 'max-h-36 overflow-hidden'}`}><div dangerouslySetInnerHTML={{ __html: comic.content || "Đang cập nhật..." }} />{!isExpanded && <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#1a1a2e] to-transparent"></div>}</div>
                            <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-bold text-primary mt-3 hover:underline uppercase block mx-auto">{isExpanded ? 'Thu gọn' : 'Xem thêm'}</button>
                        </section>
                        <section>
                            <div className="flex items-center justify-between mb-4"><h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide border-l-4 border-primary pl-3"><RiListCheck /> Danh Sách Chương</h3><button onClick={() => setSortDesc(!sortDesc)} className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-[#1a1a2e] border border-white/10 px-3 py-1.5 rounded hover:text-white hover:border-white/20 transition-colors uppercase">{sortDesc ? <RiSortDesc size={14} /> : <RiSortAsc size={14} />} {sortDesc ? 'Mới nhất' : 'Cũ nhất'}</button></div>
                            <div className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden"><div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">{sortedChapters.length > 0 ? sortedChapters.map((chap, index) => (<Link key={index} to={`/doc-truyen/${slug}/${chap.chapter_name}`} className="flex justify-between items-center p-3 mb-1 rounded hover:bg-white/5 transition-colors group"><div className="flex flex-col"><span className="text-sm font-bold text-gray-300 group-hover:text-primary transition-colors">{formatChapter(chap.chapter_name)}</span><span className="text-[10px] text-gray-600 mt-0.5">{comic.updatedAt ? new Date(comic.updatedAt).toLocaleDateString('vi-VN') : '--'}</span></div><span className="text-[10px] font-bold text-gray-500 border border-white/10 px-3 py-1 rounded group-hover:border-primary group-hover:text-primary transition-colors">ĐỌC</span></Link>)) : <div className="p-4 text-center text-gray-500 italic">Chưa có chương nào</div>}</div></div>
                        </section>
                        <section><CommentSection comicSlug={slug} /></section>

                        {/* --- GỢI Ý TRUYỆN (MOBILE ONLY) --- */}
                        <section className="mt-4 block lg:hidden">
                             {/* SỬ DỤNG COMPONENT MỚI TẠI ĐÂY */}
                            <RecommendedComicsSection currentSlug={slug} limit={6} />
                        </section>
                    </div>

                    {/* CỘT SIDEBAR (PC ONLY) */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24">
                             {/* SỬ DỤNG COMPONENT MỚI TẠI ĐÂY */}
                            <RecommendedComicsSection currentSlug={slug} limit={6} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Báo Lỗi */}
            {showReportModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
                    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-sm relative z-10 shadow-2xl animate-fade-in-up">
                        <button onClick={() => setShowReportModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white"><RiCloseLine size={24} /></button>
                        {!reportSent ? (<><h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><RiFlag2Line className="text-yellow-500" /> Báo Lỗi</h3><div className="space-y-2 mb-6">{['Thông tin sai lệch', 'Ảnh bìa lỗi', 'Chapter lỗi', 'Trùng lặp', 'Khác'].map((reason) => (<label key={reason} className="flex items-center gap-3 p-3 rounded-lg bg-[#252538] hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-primary/50"><input type="radio" name="report" value={reason} onChange={(e) => setReportReason(e.target.value)} className="accent-primary" /><span className="text-sm text-gray-300">{reason}</span></label>))}</div><button onClick={handleSubmitReport} disabled={!reportReason} className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${reportReason ? 'bg-primary text-white shadow-lg hover:bg-blue-600' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>Gửi Báo Cáo</button></>) : (<div className="py-8 flex flex-col items-center text-center"><div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 text-green-500"><RiCheckLine size={32} /></div><h3 className="text-white font-bold text-lg">Đã Gửi!</h3><p className="text-gray-400 text-sm mt-2">Cảm ơn đóng góp của bạn.</p></div>)}
                    </div>
                </div>
            )}

            <Footer />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default ComicDetailPage;