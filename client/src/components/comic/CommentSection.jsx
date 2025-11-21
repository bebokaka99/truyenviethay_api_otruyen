import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LevelBadge from '../common/LevelBadge';
import { 
    RiSendPlaneFill, RiChat1Line, RiTimeLine, 
    RiThumbUpLine, RiThumbUpFill, RiReplyFill, 
    RiLoader4Line // Đã thêm import bị thiếu
} from 'react-icons/ri';

// --- KHAI BÁO BIẾN NÀY ĐỂ SỬA LỖI ---
const BACKEND_URL = 'http://192.168.1.154:5000';

const CommentSection = ({ comicSlug, chapterName = null }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [replyContent, setReplyContent] = useState(''); 
    const [activeReplyId, setActiveReplyId] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const getAvatar = (path) => {
        if (!path) return `https://ui-avatars.com/api/?background=random`;
        if (path.startsWith('http')) return path;
        return `${BACKEND_URL}/${path}`; // Sử dụng biến API_URL
    };

    const timeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return 'Vừa xong';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const userIdParam = user ? `&userId=${user.id}` : '';
                const chapterParam = `?chapter_name=${chapterName || ''}`; 
                
                const res = await axios.get(`${BACKEND_URL}/api/comments/${comicSlug}${chapterParam}${userIdParam}`);
                setComments(res.data);
            } catch (error) { console.error("Lỗi tải bình luận:", error); }
            finally { setLoading(false); }
        };
        if (comicSlug) fetchComments();
    }, [comicSlug, chapterName, user]);

    const handleSubmit = async (e, parentId = null) => {
        e.preventDefault();
        const textToSend = parentId ? replyContent : content;
        if (!textToSend.trim()) return;
        
        setSubmitting(true);
        try {
            const token = localStorage.getItem('user_token');
            const res = await axios.post(`${BACKEND_URL}/api/comments`, {
                comic_slug: comicSlug,
                content: textToSend,
                parent_id: parentId,
                chapter_name: chapterName 
            }, { headers: { Authorization: `Bearer ${token}` } });

            setComments([res.data, ...comments]);
            
            if (parentId) {
                setReplyContent('');
                setActiveReplyId(null);
            } else {
                setContent('');
            }
        } catch (error) { alert("Lỗi gửi bình luận!"); }
        finally { setSubmitting(false); }
    };

    const handleLike = async (commentId) => {
        if (!user) return alert("Vui lòng đăng nhập để thích!");
        
        const updatedComments = comments.map(c => {
            if (c.id === commentId) {
                return {
                    ...c,
                    is_liked: !c.is_liked,
                    like_count: c.is_liked ? c.like_count - 1 : c.like_count + 1
                };
            }
            return c;
        });
        setComments(updatedComments);

        try {
            const token = localStorage.getItem('user_token');
            await axios.post(`${API_URL}/api/comments/like`, { comment_id: commentId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) { console.error("Lỗi like:", error); }
    };

    const rootComments = comments.filter(c => !c.parent_id);

    const CommentItem = ({ cmt, isReply = false }) => {
        const replies = comments.filter(c => c.parent_id === cmt.id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        return (
            <div className={`flex gap-3 group ${isReply ? 'mt-3 ml-10 md:ml-14' : 'mt-6'}`}>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0 mt-1">
                    <img src={getAvatar(cmt.avatar)} alt={cmt.full_name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                    <div className="bg-[#1f1f3a] p-3 rounded-2xl border border-white/5 inline-block min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-xs md:text-sm">{cmt.full_name}</span>
                            <div className="scale-75 origin-left">
                                <LevelBadge exp={cmt.exp} rankStyle={cmt.rank_style} role={cmt.role} />
                            </div>
                        </div>
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{cmt.content}</p>
                    </div>
                    
                    <div className="mt-1 flex items-center gap-4 text-[10px] md:text-xs text-gray-500 font-bold ml-2">
                        <span className="flex items-center gap-1 font-normal"><RiTimeLine /> {timeAgo(cmt.created_at)}</span>
                        <button 
                            onClick={() => handleLike(cmt.id)}
                            className={`flex items-center gap-1 hover:text-white transition-colors ${cmt.is_liked ? 'text-red-500' : ''}`}
                        >
                            {cmt.is_liked ? <RiThumbUpFill /> : <RiThumbUpLine />} 
                            {cmt.like_count > 0 && cmt.like_count} Thích
                        </button>
                        <button onClick={() => setActiveReplyId(activeReplyId === cmt.id ? null : cmt.id)} className="hover:text-white transition-colors">
                            Trả lời
                        </button>
                    </div>

                    {activeReplyId === cmt.id && user && (
                        <form onSubmit={(e) => handleSubmit(e, cmt.id)} className="mt-3 flex gap-3 animate-fade-in-down">
                             <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 flex-shrink-0 mt-1">
                                <img src={getAvatar(user.avatar)} alt="Me" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 relative">
                                <input 
                                    autoFocus
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={`Trả lời ${cmt.full_name}...`}
                                    className="w-full bg-[#252538] text-gray-200 text-xs p-2 pr-8 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                                />
                                <button type="submit" disabled={submitting || !replyContent.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white">
                                    <RiSendPlaneFill />
                                </button>
                            </div>
                        </form>
                    )}

                    {replies.map(reply => (
                        <CommentItem key={reply.id} cmt={reply} isReply={true} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#1a1a2e] rounded-xl p-4 md:p-6 border border-white/5 shadow-sm mt-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6 uppercase tracking-wider border-l-4 border-primary pl-3">
                <RiChat1Line /> 
                {chapterName ? `Bình Luận Chương ${chapterName}` : 'Bình Luận Bộ Truyện'} 
                <span className="text-gray-500 text-sm ml-1">({comments.length})</span>
            </h3>

            {user ? (
                <form onSubmit={(e) => handleSubmit(e, null)} className="flex gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                        <img src={getAvatar(user.avatar)} alt="Me" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 relative">
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={chapterName ? `Bình luận về chương ${chapterName}...` : "Đánh giá bộ truyện này..."}
                            className="w-full bg-[#1f1f3a] text-gray-200 text-sm p-3 pr-12 rounded-xl border border-white/10 focus:border-primary focus:outline-none resize-none h-20"
                        />
                        <button type="submit" disabled={submitting || !content.trim()} className="absolute bottom-3 right-3 text-primary hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <RiSendPlaneFill size={20} />
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-[#252538] p-4 rounded-xl text-center text-sm text-gray-400 mb-8 border border-white/5">
                    Vui lòng <Link to="/login" className="text-primary font-bold hover:underline">Đăng nhập</Link> để tham gia bình luận.
                </div>
            )}

            <div className="space-y-2 max-h-[800px] overflow-y-auto custom-scrollbar pr-1">
                {loading ? (
                    <div className="text-center py-10"><RiLoader4Line className="animate-spin text-3xl text-primary mx-auto"/></div>
                ) : rootComments.length > 0 ? (
                    rootComments.map((cmt) => (
                        <CommentItem key={cmt.id} cmt={cmt} />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500 text-sm italic bg-[#1f1f3a]/50 rounded-lg border border-white/5 border-dashed">
                        Chưa có bình luận nào. Hãy là người đầu tiên!
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentSection;