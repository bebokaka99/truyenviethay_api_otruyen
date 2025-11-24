import { useEffect } from 'react';

const useReadingProgress = (slug, chapterName) => {
  // Key lưu trong LocalStorage: reading_pos_slug-truyen_chap-1
  const storageKey = `reading_pos_${slug}_${chapterName}`;

  useEffect(() => {
    // 1. khôi phục vị trí cuộn khi tải trang
    const savedPosition = localStorage.getItem(storageKey);
    if (savedPosition) {
      window.scrollTo({
        top: parseInt(savedPosition),
        behavior: 'smooth' // Cuộn mượt tới chỗ cũ
      });
    }

    // 2. lưu vị trí cuộn khi người dùng cuộn trang
    let timeoutId = null;
    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        localStorage.setItem(storageKey, window.scrollY);
      }, 500); // Lưu sau khi ngừng cuộn 0.5s
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [slug, chapterName]);
};

export default useReadingProgress;