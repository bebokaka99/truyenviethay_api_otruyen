import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LevelBadge from '../common/LevelBadge';
import Toast from '../common/Toast';
import { RiSendPlaneFill, RiChat1Line, RiTimeLine, RiThumbUpLine, RiThumbUpFill, RiLoader4Line, RiFlag2Line, RiCloseLine } from 'react-icons/ri';

// --- ĐỔI URL BACKEND CỦA BẠN NẾU CẦN ---
const BACKEND_URL = 'https://truyenviethay-backend.onrender.com';

const CommentSection = ({ comicSlug, chapterName = null }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const location = useLocation();

    // --- CÁC STATES CHO TÍNH NĂNG BÁO CÁO ---
    const [showReportModal, setShowReportModal] = useState(false);
    const [commentToReport, setCommentToReport] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const reportModalRef = useRef(null);

    // (Các hàm helper giữ nguyên)
    const getAvatar = (path) => { if (!path) return `https://ui-avatars.com/api/?background=random`; if (path.startsWith('http')) return path; return `${BACKEND_URL}/${path}`; };
    const timeAgo = (dateString) => { const now = new Date(); const date = new Date(dateString); const seconds = Math.floor((now - date) / 1000); if (seconds < 60) return 'Vừa xong'; const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes} phút trước`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours} giờ trước`; return date.toLocaleDateString('vi-VN'); };

    // (useEffect fetchComments giữ nguyên)
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const userIdParam = user ? `&userId=${user.id}` : '';
                const chapterParam = `?chapter_name=${chapterName || 'null'}`;
                const res = await axios.get(`${BACKEND_URL}/api/comments/${comicSlug}${chapterParam}${userIdParam}`);
                setComments(res.data);
            } catch (error) { console.error("Lỗi tải bình luận:", error); }
            finally { setLoading(false); }
        };
        if (comicSlug) fetchComments();
    }, [comicSlug, chapterName, user]);

    // (useEffect Deep Linking giữ nguyên)
    useEffect(() => {
        if (!loading && comments.length > 0 && location.hash) {
            const targetId = location.hash.substring(1);
            const timer = setTimeout(() => {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetElement.classList.add('bg-white/10');
                    setTimeout(() => { targetElement.classList.remove('bg-white/10'); }, 2000);
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [comments, loading, location.hash]);

    // (Hàm handleSubmit và handleLike giữ nguyên)
    const handleSubmit = async (e, parentId = null) => { e.preventDefault(); const textToSend = parentId ? replyContent : content; if (!textToSend.trim()) return; setSubmitting(true); try { const token = localStorage.getItem('user_token'); const res = await axios.post(`${BACKEND_URL}/api/comments`, { comic_slug: comicSlug, content: textToSend, parent_id: parentId, chapter_name: chapterName }, { headers: { Authorization: `Bearer ${token}` } }); setComments([res.data, ...comments]); if (parentId) { setReplyContent(''); setActiveReplyId(null); } else { setContent(''); } } catch (error) { setToast({ message: "Lỗi gửi bình luận. Vui lòng thử lại!", type: "error" }); } finally { setSubmitting(false); } };
    const handleLike = async (commentId) => { if (!user) { setToast({ message: "Vui lòng đăng nhập để thích bình luận!", type: "info" }); return; } setComments(prevComments => { return prevComments.map(cmt => { if (cmt.id === commentId) { const newIsLiked = !cmt.is_liked; return { ...cmt, is_liked: newIsLiked, like_count: newIsLiked ? cmt.like_count + 1 : cmt.like_count - 1 }; } return cmt; }); }); try { const token = localStorage.getItem('user_token'); await axios.post(`${BACKEND_URL}/api/comments/like`, { comment_id: commentId }, { headers: { Authorization: `Bearer ${token}` } }); } catch (error) { console.error("Lỗi like:", error); setToast({ message: "Lỗi kết nối. Thao tác chưa được lưu.", type: "error" }); } };

    // --- CÁC HÀM XỬ LÝ BÁO CÁO (Giữ nguyên) ---
    const openReportModal = (comment) => {
        if (!user) { setToast({ message: "Vui lòng đăng nhập để báo cáo!", type: "info" }); return; }
        setCommentToReport(comment); setReportReason(''); setShowReportModal(true);
    };
    const handleSendReport = async () => {
        if (!reportReason || !commentToReport) return;
        try {
            const token = localStorage.getItem('user_token');
            await axios.post(`${BACKEND_URL}/api/reports/comments`, { comment_id: commentToReport.id, reason: reportReason }, { headers: { Authorization: `Bearer ${token}` } });
            setToast({ message: "Đã gửi báo cáo thành công. Cảm ơn bạn!", type: "success" }); setShowReportModal(false);
        } catch (error) { setToast({ message: error.response?.data?.message || "Gửi báo cáo thất bại.", type: "error" }); }
    };
    useEffect(() => {
        const handleClickOutside = (event) => { if (reportModalRef.current && !reportModalRef.current.contains(event.target)) { setShowReportModal(false); } };
        if (showReportModal) document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showReportModal]);


    // ==========================================
    // COMPONENT HIỂN THỊ BÌNH LUẬN ĐƠN LẺ
    // ==========================================
    const CommentItemSingle = ({ cmt, isReply = false }) => {
        const isMyComment = user && user.id === cmt.user_id;

        return (
            <div id={`comment-${cmt.id}`} className={`flex gap-3 group transition-all rounded-xl p-2 duration-500 ${isReply ? 'mt-2 ml-10 md:ml-14 border-l-2 border-white/10 pl-4' : 'mt-6'}`}>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0 mt-1">
                    <img src={getAvatar(cmt.avatar)} alt={cmt.full_name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 group/content">
                    {/* Đã xóa class 'pr-8' ở div này */}
                    <div className="bg-[#1f1f3a] p-3 rounded-2xl border border-white/5 inline-block min-w-[200px] relative">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-xs md:text-sm">{cmt.full_name}</span>
                            <div className="scale-75 origin-left"><LevelBadge exp={cmt.exp} rankStyle={cmt.rank_style} role={cmt.role} /></div>
                        </div>
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{cmt.content}</p>
                        
                        {/* --- NÚT BÁO CÁO CŨ (ĐÃ XÓA TẠI ĐÂY) --- */}
                    </div>
                    
                    {/* --- KHU VỰC ACTIONS (Ngang hàng) --- */}
                    <div className="mt-1 flex items-center gap-4 text-[10px] md:text-xs text-gray-500 font-bold ml-2">
                        {/* Thời gian */}
                        <span className="flex items-center gap-1 font-normal"><RiTimeLine /> {timeAgo(cmt.created_at)}</span>
                        
                        {/* Nút Like */}
                        <button onClick={() => handleLike(cmt.id)} className={`flex items-center gap-1 hover:text-white transition-colors ${cmt.is_liked ? 'text-red-500' : ''}`}>{cmt.is_liked ? <RiThumbUpFill /> : <RiThumbUpLine />} {cmt.like_count > 0 && cmt.like_count} Thích</button>
                        
                        {/* Nút Trả lời (Chỉ hiện ở comment gốc) */}
                        {!isReply && (<button onClick={() => setActiveReplyId(activeReplyId === cmt.id ? null : cmt.id)} className="hover:text-white transition-colors">Trả lời</button>)}

                        {/* --- NÚT BÁO CÁO MỚI (Được thêm vào đây) --- */}
                        {/* Chỉ hiện nếu đã đăng nhập VÀ không phải là comment của chính mình */}
                        {!isMyComment && user && (
                            <button
                                onClick={() => openReportModal(cmt)}
                                className="flex items-center gap-1 hover:text-red-500 transition-colors"
                                title="Báo cáo bình luận này"
                            >
                                <RiFlag2Line /> Báo cáo
                            </button>
                        )}
                    </div>

                    {/* Form trả lời */}
                    {activeReplyId === cmt.id && user && !isReply && (
                        <form onSubmit={(e) => handleSubmit(e, cmt.id)} className="mt-3 flex gap-3 animate-fade-in-down">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 flex-shrink-0 mt-1"><img src={getAvatar(user.avatar)} alt="Me" className="w-full h-full object-cover" /></div>
                            <div className="flex-1 relative">
                                <input autoFocus value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder={`Trả lời ${cmt.full_name}...`} className="w-full bg-[#252538] text-gray-200 text-xs p-2 pr-8 rounded-lg border border-white/10 focus:border-primary focus:outline-none" />
                                <button type="submit" disabled={submitting || !replyContent.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white"><RiSendPlaneFill /></button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    // (Hàm renderCommentsRecursive giữ nguyên)
    const renderCommentsRecursive = (parentId = null) => {
        const filteredComments = comments.filter(c => c.parent_id === parentId)
            .sort((a, b) => !parentId ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at));
        return filteredComments.map(cmt => (
            <React.Fragment key={cmt.id}>
                <CommentItemSingle cmt={cmt} isReply={!!parentId} />
                {renderCommentsRecursive(cmt.id)}
            </React.Fragment>
        ));
    };

    // (Phần render chính và Modal giữ nguyên)
    return (
        <div className="bg-[#1a1a2e] rounded-xl p-4 md:p-6 border border-white/5 shadow-sm mt-8 relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6 uppercase tracking-wider border-l-4 border-primary pl-3"><RiChat1Line /> {chapterName ? `Bình Luận Chương ${chapterName}` : 'Bình Luận Bộ Truyện'} <span className="text-gray-500 text-sm ml-1">({comments.length})</span></h3>
            {user ? (
                <form onSubmit={(e) => handleSubmit(e, null)} className="flex gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0"><img src={getAvatar(user.avatar)} alt="Me" className="w-full h-full object-cover" /></div>
                    <div className="flex-1 relative">
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={chapterName ? `Bình luận về chương ${chapterName}...` : "Đánh giá bộ truyện này..."} className="w-full bg-[#1f1f3a] text-gray-200 text-sm p-3 pr-12 rounded-xl border border-white/10 focus:border-primary focus:outline-none resize-none h-20" />
                        <button type="submit" disabled={submitting || !content.trim()} className="absolute bottom-3 right-3 text-primary hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><RiSendPlaneFill size={20} /></button>
                    </div>
                </form>
            ) : (<div className="bg-[#252538] p-4 rounded-xl text-center text-sm text-gray-400 mb-8 border border-white/5">Vui lòng <Link to="/login" className="text-primary font-bold hover:underline">Đăng nhập</Link> để tham gia bình luận.</div>)}
            
            <div className="space-y-2 max-h-[800px] overflow-y-auto custom-scrollbar pr-1 relative">
                {loading ? (<div className="text-center py-10"><RiLoader4Line className="animate-spin text-3xl text-primary mx-auto"/></div>) : comments.length > 0 ? (
                    renderCommentsRecursive(null)
                ) : (<div className="text-center py-10 text-gray-500 text-sm italic bg-[#1f1f3a]/50 rounded-lg border border-white/5 border-dashed">Chưa có bình luận nào. Hãy là người đầu tiên!</div>)}
            </div>
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

             {/* MODAL BÁO CÁO */}
             {showReportModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div ref={reportModalRef} className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-sm relative shadow-2xl animate-scale-up">
                        <button onClick={() => setShowReportModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white p-1"><RiCloseLine size={24} /></button>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><RiFlag2Line className="text-red-500" /> Báo cáo bình luận</h3>
                        <div className="mb-4"><p className="text-xs text-gray-500 mb-1">Bình luận của <span className="font-bold">{commentToReport?.full_name}</span>:</p><p className="text-gray-300 text-sm italic bg-[#252538] p-2 rounded border border-white/5 line-clamp-3">"{commentToReport?.content}"</p></div>
                        <div className="space-y-2 mb-6"><p className="text-sm font-bold text-white mb-2">Vui lòng chọn lý do:</p>{['Spam / Quảng cáo', 'Ngôn từ đả kích / Xúc phạm', 'Nội dung khiêu dâm / 18+', 'Spoil nội dung truyện', 'Thông tin sai lệch', 'Khác'].map((reason) => (<label key={reason} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${reportReason === reason ? 'bg-red-500/10 border-red-500/50' : 'bg-[#252538] border-transparent hover:border-white/10 hover:bg-white/5'}`}><input type="radio" name="reportReason" value={reason} checked={reportReason === reason} onChange={(e) => setReportReason(e.target.value)} className="accent-red-500 w-4 h-4" /><span className="text-sm text-gray-300">{reason}</span></label>))}</div>
                        <button onClick={handleSendReport} disabled={!reportReason} className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${reportReason ? 'bg-red-600 text-white shadow-lg hover:bg-red-700 shadow-red-900/20' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}><RiSendPlaneFill /> Gửi Báo Cáo</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentSection;