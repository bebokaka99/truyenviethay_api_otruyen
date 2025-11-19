import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { 
  RiBookOpenLine, RiBookmarkLine, RiUser3Line, RiTimeLine, 
  RiFileList2Line, RiGlobalLine, RiArrowRightSLine, RiListCheck,
  RiSortDesc, RiSortAsc, RiEyeFill
} from 'react-icons/ri';

const ComicDetailPage = () => {
  const { slug } = useParams();
  const [comic, setComic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [suggestedComics, setSuggestedComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainAnh, setDomainAnh] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    // 1. Hàm lấy chi tiết truyện
    const fetchComicDetail = async () => {
      try {
        const response = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`);
        const data = response.data.data;
        setComic(data.item);
        setDomainAnh(data.APP_DOMAIN_CDN_IMAGE);
        
        if (data.item.chapters && data.item.chapters.length > 0) {
            const svData = data.item.chapters[0].server_data;
            setChapters([...svData].reverse()); 
        } else {
            setChapters([]);
        }
        setLoading(false);
      } catch (error) { console.error(error); setLoading(false); }
    };

    // 2. Hàm lấy truyện ngẫu nhiên (Gợi ý)
    const fetchRandomSuggestions = async () => {
        try {
            // Random trang từ 1 đến 50 để lấy dữ liệu ngẫu nhiên
            const randomPage = Math.floor(Math.random() * 50) + 1;
            const res = await axios.get(`https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${randomPage}`);
            const items = res.data.data.items;
            
            // Xáo trộn mảng (Shuffle) và lấy 10 item
            const shuffled = items.sort(() => 0.5 - Math.random());
            setSuggestedComics(shuffled.slice(0, 7));
        } catch (error) {
            console.error("Lỗi lấy gợi ý:", error);
        }
    };

    fetchComicDetail();
    fetchRandomSuggestions();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-[#101022] flex items-center justify-center"><div className="w-10 h-10 border-2 border-t-primary rounded-full animate-spin"></div></div>;
  if (!comic) return <div className="min-h-screen bg-[#101022] text-white flex items-center justify-center">Truyện không tồn tại</div>;

  const coverImage = `${domainAnh}/uploads/comics/${comic.thumb_url}`;
  // Xử lý hiển thị tác giả chuẩn API
  const authors = Array.isArray(comic.author) ? comic.author.join(', ') : (comic.author === '' ? 'Đang cập nhật' : comic.author);
  
  // Helper format chương
  const formatChapter = (name) => {
      return name.toLowerCase().includes('chapter') || name.toLowerCase().includes('chương') ? name : `Chương ${name}`;
  };

  // Sort Chapters
  const sortedChapters = [...chapters].sort((a, b) => {
      const numA = parseFloat(a.chapter_name);
      const numB = parseFloat(b.chapter_name);
      if(isNaN(numA) || isNaN(numB)) return 0;
      return sortDesc ? numB - numA : numA - numB;
  });

  const firstStoryChap = chapters.length > 0 
    ? [...chapters].sort((a,b) => parseFloat(a.chapter_name) - parseFloat(b.chapter_name))[0] 
    : null;

  return (
    <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 pb-20">
      <Header />
      
      {/* BACKDROP BANNER */}
      <div className="relative w-full h-[200px] md:h-[320px] overflow-hidden">
         <div className="absolute inset-0 bg-cover bg-center blur-[20px] opacity-30" style={{ backgroundImage: `url("${coverImage}")` }}></div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#101022] via-[#101022]/60 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-40 relative z-10">
         
         {/* --- TOP INFO SECTION --- */}
         <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
            
            {/* ẢNH BÌA */}
            <div className="flex-shrink-0 w-[140px] md:w-[200px] rounded-lg shadow-2xl border border-white/10 overflow-hidden relative bg-[#1f1f3a]">
                <img src={coverImage} alt={comic.name} className="w-full aspect-[2/3] object-cover" />
                
                {/* Badge Trạng Thái Tinh Tế */}
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm 
                    ${comic.status === 'ongoing' ? 'bg-green-600' : 'bg-blue-600'}`}>
                    {comic.status === 'ongoing' ? 'Đang tiến hành' : 'Hoàn thành'}
                </div>
            </div>

            {/* THÔNG TIN CHÍNH */}
            <div className="flex-1 text-center md:text-left flex flex-col gap-3 w-full">
               <h1 className="text-2xl md:text-4xl font-black text-white leading-tight font-heading drop-shadow-md">
                  {comic.name}
               </h1>
               
               {/* Tags Thể Loại (Chuẩn API) */}
               <div className="flex flex-wrap justify-center md:justify-start gap-2 text-sm">
                  {comic.category && comic.category.map((cat) => (
                      <Link key={cat.id} to={`/the-loai/${cat.slug}`} className="px-2.5 py-0.5 rounded border border-white/10 bg-[#252538] text-gray-400 text-xs font-bold hover:text-primary hover:border-primary transition-colors uppercase">
                          {cat.name}
                      </Link>
                  ))}
               </div>

               {/* Stats Box */}
               <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-8 text-sm mt-2 bg-[#1a1a2e]/80 backdrop-blur-sm p-3 rounded-lg border border-white/5 w-fit mx-auto md:mx-0">
                  <div className="flex items-center gap-2">
                     <RiUser3Line className="text-primary" />
                     <span className="text-gray-300 font-bold text-xs md:text-sm">{authors}</span>
                  </div>
                  <div className="w-px h-3 bg-white/20 hidden md:block"></div>
                  <div className="flex items-center gap-2">
                     <RiTimeLine className="text-primary" />
                     <span className="text-gray-300 text-xs md:text-sm">
                        {comic.updatedAt ? new Date(comic.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                     </span>
                  </div>
               </div>
            </div>
         </div>

         {/* BUTTONS */}
         <div className="flex flex-col md:flex-row gap-3 mt-6 md:mt-8 border-b border-white/5 pb-8">
             {firstStoryChap ? (
                <Link to={`/doc-truyen/${slug}/${firstStoryChap.chapter_name}`} className="flex-1 md:flex-none bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-900/30">
                   <RiBookOpenLine size={20} /> Đọc Từ Đầu
                </Link>
             ) : (
                <button disabled className="flex-1 md:flex-none bg-gray-700 text-gray-400 font-bold py-3 px-8 rounded-full cursor-not-allowed flex items-center justify-center gap-2">
                   Chưa có chương
                </button>
             )}
             <button className="flex-1 md:flex-none bg-[#252538] hover:bg-red-500/80 text-white font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-colors border border-white/10">
                 <RiBookmarkLine size={20} /> Theo Dõi
             </button>
         </div>

         {/* --- BODY CONTENT --- */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
             
             {/* CỘT TRÁI (2/3): NỘI DUNG & CHƯƠNG */}
             <div className="lg:col-span-2 flex flex-col gap-8">
                
                {/* NỘI DUNG TRUYỆN */}
                <section>
                   <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3 uppercase tracking-wide border-l-4 border-primary pl-3">
                      <RiFileList2Line /> Nội Dung
                   </h3>
                   <div className={`relative text-sm text-gray-400 leading-7 bg-[#1a1a2e] p-5 rounded-xl border border-white/5 ${isExpanded ? '' : 'max-h-36 overflow-hidden'}`}>
                       <div dangerouslySetInnerHTML={{ __html: comic.content || "Đang cập nhật..." }} />
                       {!isExpanded && <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#1a1a2e] to-transparent"></div>}
                   </div>
                   <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-bold text-primary mt-3 hover:underline uppercase block mx-auto">
                       {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                   </button>
                </section>

                {/* DANH SÁCH CHƯƠNG (Dark Compact Style) */}
                <section>
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide border-l-4 border-primary pl-3">
                         <RiListCheck /> Danh Sách Chương
                      </h3>
                      <button onClick={() => setSortDesc(!sortDesc)} className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-[#1a1a2e] border border-white/10 px-3 py-1.5 rounded hover:text-white hover:border-white/20 transition-colors uppercase">
                         {sortDesc ? <RiSortDesc size={14} /> : <RiSortAsc size={14} />}
                         {sortDesc ? 'Mới nhất' : 'Cũ nhất'}
                      </button>
                   </div>

                   {/* LIST CONTAINER: Không nền trắng, border tối */}
                   <div className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden">
                      <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
                         {sortedChapters.length > 0 ? sortedChapters.map((chap, index) => (
                            <Link 
                                key={index}
                                to={`/doc-truyen/${slug}/${chap.chapter_name}`}
                                className="flex justify-between items-center p-3 mb-1 rounded hover:bg-white/5 transition-colors group"
                            >
                               <div className="flex flex-col">
                                  <span className="text-sm font-bold text-gray-300 group-hover:text-primary transition-colors">
                                     {formatChapter(chap.chapter_name)}
                                  </span>
                                  <span className="text-[10px] text-gray-600 mt-0.5">
                                     {comic.updatedAt ? new Date(comic.updatedAt).toLocaleDateString('vi-VN') : '--'}
                                  </span>
                               </div>
                               <span className="text-[10px] font-bold text-gray-500 border border-white/10 px-3 py-1 rounded group-hover:border-primary group-hover:text-primary transition-colors">
                                  ĐỌC
                               </span>
                            </Link>
                         )) : (
                            <div className="p-6 text-center text-gray-500 italic">Chưa có chương nào</div>
                         )}
                      </div>
                   </div>
                </section>
             </div>

             {/* SIDEBAR (Right) - GỢI Ý NGẪU NHIÊN */}
             <div className="hidden lg:block">
                 <div className="bg-[#1a1a2e] rounded-xl border border-white/5 sticky top-24 overflow-hidden">
                    <h4 className="font-bold text-white text-sm p-4 border-b border-white/5 flex items-center gap-2">
                        <RiEyeFill className="text-primary" /> GỢI Ý HÔM NAY
                    </h4>
                    
                    <div className="flex flex-col divide-y divide-white/5">
                       {suggestedComics.length > 0 ? suggestedComics.map((item) => (
                          <Link key={item._id} to={`/truyen-tranh/${item.slug}`} className="flex gap-3 p-3 hover:bg-white/5 transition-colors group">
                             <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden border border-white/10">
                                <img 
                                    src={`${domainAnh}/uploads/comics/${item.thumb_url}`} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                             </div>
                             <div className="flex flex-col justify-center overflow-hidden">
                                <h5 className="text-xs font-bold text-gray-300 truncate group-hover:text-primary transition-colors">
                                    {item.name}
                                </h5>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    {item.latest_chapter || (item.chaptersLatest && item.chaptersLatest[0]?.chapter_name) || 'Full'}
                                </p>
                             </div>
                          </Link>
                       )) : (
                           <div className="p-4 text-center text-xs text-gray-500">Đang tải gợi ý...</div>
                       )}
                    </div>
                 </div>
             </div>

         </div>
      </div>
    </div>
  );
};

export default ComicDetailPage;