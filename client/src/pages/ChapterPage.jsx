import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import LoginModal from '../components/common/LoginModal';
import CommentSection from '../components/comic/CommentSection'; 
import Toast from '../components/common/Toast';
import {
    RiArrowLeftSLine, RiArrowRightSLine, RiListCheck,
    RiErrorWarningLine, RiHome4Line, RiHeart3Line, RiHeart3Fill,
    RiFlag2Line, RiCloseLine, RiCheckLine, RiArrowUpLine, RiChat3Line
} from 'react-icons/ri';

// Component hiển thị ảnh Lazy Load đơn giản
const ChapterImage = ({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className="relative min-h-[200px] bg-[#0a0a16] flex items-center justify-center">
            {!loaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin"></div>
                </div>
            )}
            {!error ? (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className={`w-full h-auto block mx-auto max-w-4xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                />
            ) : (
                <div className="py-10 text-center text-gray-600 text-xs">
                    Lỗi tải ảnh. <button onClick={() => setError(false)} className="text-primary underline">Thử lại</button>
                </div>
            )}
        </div>
    );
};

const ChapterPage = () => {
    const { slug, chapterName } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const commentSectionRef = useRef(null);

    const [images, setImages] = useState([]);
    const [chapterList, setChapterList] = useState([]);
    const [comicName, setComicName] = useState('');
    const [comicThumb, setComicThumb] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State Follow & Toast
    const [isFollowed, setIsFollowed] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [toast, setToast] = useState(null);

    // State Báo Lỗi
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportSent, setReportSent] = useState(false);

    const [prevChapter, setPrevChapter] = useState(null);
    const [nextChapter, setNextChapter] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            setImages([]);

            try {
                // 1. Lấy chi tiết truyện
                const detailRes = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`);
                const comicItem = detailRes.data.data.item;
                setComicName(comicItem.name);
                setComicThumb(detailRes.data.data.APP_DOMAIN_CDN_IMAGE + '/uploads/comics/' + comicItem.thumb_url);

                // 2. Sắp xếp chương (Cao -> Thấp) để tìm next/prev
                let list = comicItem.chapters[0]?.server_data || [];
                // Sắp xếp giảm dần để index 0 là chương mới nhất
                list.sort((a, b) => parseFloat(b.chapter_name) - parseFloat(a.chapter_name));

                setChapterList(list);
                const currentIndex = list.findIndex(c => c.chapter_name === chapterName);

                if (currentIndex === -1) throw new Error("Không tìm thấy chương.");

                // Logic Next/Prev (Vì list giảm dần: Next là index-1, Prev là index+1)
                const nextIndex = currentIndex - 1; 
                const prevIndex = currentIndex + 1;

                setNextChapter(nextIndex >= 0 ? list[nextIndex].chapter_name : null);
                setPrevChapter(prevIndex < list.length ? list[prevIndex].chapter_name : null);

                // 3. Lấy ảnh chương
                const chapterApiUrl = list[currentIndex].chapter_api_data;
                const imageRes = await axios.get(chapterApiUrl);
                const imgData = imageRes.data.data;

                const domain = imgData.domain_cdn;
                const path = imgData.item.chapter_path;
                const fullImages = imgData.item.chapter_image.map(img => ({
                    id: img.image_page,
                    src: `${domain}/${path}/${img.image_file}`
                }));

                setImages(fullImages);
                setLoading(false);

                // 4. Tự động lưu lịch sử & Check follow (nếu đã login)
                const token = localStorage.getItem('user_token');
                if (token) {
                    axios.post('/api/user/history', {
                        comic_slug: slug,
                        comic_name: comicItem.name,
                        comic_image: detailRes.data.data.APP_DOMAIN_CDN_IMAGE + '/uploads/comics/' + comicItem.thumb_url,
                        chapter_name: chapterName
                    }, { headers: { Authorization: `Bearer ${token}` } }).catch(console.error);

                    axios.get(`/api/user/library/check/${slug}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(res => setIsFollowed(res.data.isFollowed)).catch(console.error);
                }

            } catch (err) {
                console.error("Lỗi tải chương:", err);
                setError("Lỗi tải ảnh hoặc chương không tồn tại.");
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [slug, chapterName]);

    const handleSelectChapter = (e) => {
        const selectedChap = e.target.value;
        if (selectedChap) {
            navigate(`/doc-truyen/${slug}/${selectedChap}`);
        }
    };

    const handleToggleFollow = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        const token = localStorage.getItem('user_token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            if (isFollowed) {
                await axios.delete(`/api/user/library/${slug}`, { headers });
                setIsFollowed(false);
                showToast("Đã bỏ theo dõi", "error");
            } else {
                await axios.post('/api/user/library', {
                    comic_slug: slug,
                    comic_name: comicName,
                    comic_image: comicThumb,
                    latest_chapter: chapterName
                }, { headers });
                setIsFollowed(true);
                showToast("Đã thêm vào tủ truyện", "success");
            }
        } catch (error) { console.error("Lỗi follow:", error); }
    };

    const handleSubmitReport = () => {
        if (!reportReason) return;
        setReportSent(true);
        setTimeout(() => {
            setReportSent(false);
            setShowReportModal(false);
            setReportReason('');
            showToast("Đã gửi báo lỗi. Cảm ơn bạn!", "success");
        }, 2000);
    };

    const scrollToComments = () => {
        commentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300">

            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

            <div className="opacity-0 hover:opacity-100 transition-opacity fixed top-0 left-0 right-0 z-50">
                <Header />
            </div>

            <main className="w-full min-h-screen pb-32 relative">

                {/* BREADCRUMB */}
                <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-1 bg-gradient-to-b from-[#0a0a16] to-transparent sticky top-0 z-40">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 uppercase font-bold bg-[#0a0a16]/80 backdrop-blur-sm py-2 px-3 rounded-full w-fit shadow-lg border border-white/5">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <RiArrowRightSLine />
                        <Link to={`/truyen-tranh/${slug}`} className="hover:text-primary truncate max-w-[120px] sm:max-w-[200px]">{comicName}</Link>
                        <RiArrowRightSLine />
                        <span className="text-white">Chương {chapterName}</span>
                    </div>
                </div>

                {/* ERROR / LOADING */}
                {loading && (
                    <div className="py-60 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-2 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-xs text-gray-500 animate-pulse">Đang tải chương {chapterName}...</p>
                    </div>
                )}

                {error && (
                    <div className="py-40 text-center px-4">
                        <RiErrorWarningLine className="text-red-500 text-5xl mx-auto mb-4" />
                        <p className="text-gray-300">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-white/10 rounded hover:bg-white/20 text-sm font-bold">Tải lại</button>
                    </div>
                )}

                {/* READER CONTENT */}
                {!loading && !error && (
                    <>
                        <div className="flex flex-col bg-[#0a0a16] w-full select-none shadow-2xl min-h-screen" onContextMenu={(e) => e.preventDefault()}>
                            {images.map((img, index) => (
                                <ChapterImage key={index} src={img.src} alt={`Trang ${index + 1}`} />
                            ))}
                        </div>

                        {/* --- KHU VỰC BÌNH LUẬN --- */}
                        <div ref={commentSectionRef} className="max-w-4xl mx-auto px-4 mt-16 pb-24 border-t border-white/5 pt-8">
                            <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
                                <RiChat3Line className="text-primary" /> 
                                Bình Luận Về Chương Này
                            </div>
                            <CommentSection comicSlug={slug} chapterName={chapterName} />
                        </div>
                    </>
                )}

                {/* --- SIDE BUTTONS (Scroll Top) --- */}
                <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-30">
                    <button onClick={scrollToTop} className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors shadow-lg backdrop-blur-sm">
                        <RiArrowUpLine />
                    </button>
                    <button onClick={scrollToComments} className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors shadow-lg backdrop-blur-sm">
                        <RiChat3Line />
                    </button>
                </div>

                {/* --- FLOATING CONTROL BAR --- */}
                <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
                    <div className="bg-[#151525]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl p-1.5 flex items-center gap-2 sm:gap-3 max-w-lg w-full justify-between transition-transform hover:scale-[1.01]">
                        <Link to="/" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Trang chủ">
                            <RiHome4Line size={20} />
                        </Link>
                        
                        {/* Nút Chương Trước */}
                        <Link
                            to={prevChapter ? `/doc-truyen/${slug}/${prevChapter}` : '#'}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${prevChapter ? 'text-white hover:bg-white/10 active:bg-white/20' : 'text-gray-600 cursor-not-allowed'}`}
                            title="Chương trước"
                        >
                            <RiArrowLeftSLine size={24} />
                        </Link>

                        {/* Dropdown Chọn Chương */}
                        <div className="relative flex-1 max-w-[160px]">
                            <select
                                value={chapterName}
                                onChange={handleSelectChapter}
                                className="w-full h-10 pl-3 pr-8 rounded-full bg-primary text-white text-xs font-bold focus:outline-none appearance-none cursor-pointer text-center shadow-lg shadow-primary/30 truncate border-none outline-none ring-0"
                            >
                                {chapterList.map(chap => (
                                    <option key={chap.chapter_name} value={chap.chapter_name} className="bg-[#1a1a2e] text-gray-300 py-2">
                                        Chương {chap.chapter_name}
                                    </option>
                                ))}
                            </select>
                            <RiListCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={16} />
                        </div>

                        {/* Nút Chương Sau */}
                        <Link
                            to={nextChapter ? `/doc-truyen/${slug}/${nextChapter}` : '#'}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${nextChapter ? 'text-white hover:bg-white/10 active:bg-white/20' : 'text-gray-600 cursor-not-allowed'}`}
                            title="Chương sau"
                        >
                            <RiArrowRightSLine size={24} />
                        </Link>

                        {/* Nút Theo Dõi */}
                        <button
                            onClick={handleToggleFollow}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFollowed ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-white/10'}`}
                            title="Theo dõi"
                        >
                            {isFollowed ? <RiHeart3Fill size={20} /> : <RiHeart3Line size={20} />}
                        </button>

                        {/* Nút Báo Lỗi */}
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                            title="Báo lỗi"
                        >
                            <RiFlag2Line size={20} />
                        </button>
                    </div>
                </div>

                {/* --- MODAL BÁO LỖI --- */}
                {showReportModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
                        <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-sm relative z-10 shadow-2xl animate-fade-in-up">
                            <button onClick={() => setShowReportModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white">
                                <RiCloseLine size={24} />
                            </button>
                            {!reportSent ? (
                                <>
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><RiFlag2Line className="text-yellow-500" /> Báo Lỗi Chương Này</h3>
                                    <div className="space-y-2 mb-6">
                                        {['Ảnh bị lỗi / Không load được', 'Sai thứ tự chương', 'Chương bị trùng', 'Lỗi dịch thuật / Font chữ', 'Khác'].map((reason) => (
                                            <label key={reason} className="flex items-center gap-3 p-3 rounded-lg bg-[#252538] hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-primary/50">
                                                <input type="radio" name="report" value={reason} onChange={(e) => setReportReason(e.target.value)} className="accent-primary" />
                                                <span className="text-sm text-gray-300">{reason}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <button onClick={handleSubmitReport} disabled={!reportReason} className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${reportReason ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-600' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>Gửi Báo Cáo</button>
                                </>
                            ) : (
                                <div className="py-8 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 text-green-500"><RiCheckLine size={32} /></div>
                                    <h3 className="text-white font-bold text-lg">Đã Gửi Thành Công!</h3>
                                    <p className="text-gray-400 text-sm mt-2">Cảm ơn bạn đã giúp chúng tôi cải thiện chất lượng.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            </main>

            <div className="relative z-10 bg-[#0a0a16] border-t border-white/5">
                <Footer />
            </div>
        </div>
    );
};

export default ChapterPage;