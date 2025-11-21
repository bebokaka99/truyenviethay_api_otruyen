const db = require('../config/db');
// Import hàm tạo thông báo
const { createNotificationInternal } = require('./notificationController');

// 1. Lấy danh sách bình luận
exports.getComments = async (req, res) => {
    const { comic_slug } = req.params;
    const currentUserId = req.query.userId || 0;
    
    let chapterName = req.query.chapter_name;
    if (chapterName === 'null' || chapterName === 'undefined' || chapterName === '') {
        chapterName = null;
    }

    try {
        const [rows] = await db.execute(
            `SELECT c.*, 
                    u.full_name, u.avatar, u.role, u.rank_style, u.exp,
                    (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as like_count,
                    (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ?) as is_liked
             FROM comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.comic_slug = ? AND c.chapter_name <=> ?
             ORDER BY c.created_at DESC`, 
            [currentUserId, comic_slug, chapterName]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy bình luận' });
    }
};

// 2. Gửi bình luận mới (Kèm thông báo Reply)
exports.addComment = async (req, res) => {
    const userId = req.user.id;
    const { comic_slug, content, parent_id, chapter_name } = req.body;
    const savedChapter = chapter_name || null;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Nội dung trống' });
    }

    try {
        // A. Lưu Comment
        const [result] = await db.execute(
            'INSERT INTO comments (user_id, comic_slug, content, parent_id, chapter_name) VALUES (?, ?, ?, ?, ?)',
            [userId, comic_slug, content, parent_id || null, savedChapter]
        );
        
        // Lấy info user để trả về frontend
        const [users] = await db.execute('SELECT full_name, avatar, role, rank_style, exp FROM users WHERE id = ?', [userId]);
        const currentUser = users[0];

        // B. TẠO THÔNG BÁO TRẢ LỜI (Nếu có parent_id)
        if (parent_id) {
            // 1. Tìm chủ nhân của comment cha
            const [parents] = await db.execute('SELECT user_id, content FROM comments WHERE id = ?', [parent_id]);
            
            if (parents.length > 0) {
                const parentOwnerId = parents[0].user_id;
                
                // Chỉ thông báo nếu người trả lời KHÁC người viết comment gốc
                if (parentOwnerId !== userId) {
                    // Lấy tên truyện (để thông báo chi tiết hơn - Optional, ở đây dùng slug cho nhanh)
                    // Tạo nội dung thông báo
                    const notifTitle = `${currentUser.full_name} đã trả lời bạn`;
                    const notifMsg = `Tại truyện: ${comic_slug}${savedChapter ? ' - ' + savedChapter : ''}\n"${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`;
                    
                    await createNotificationInternal(
                        parentOwnerId, 
                        'reply', // Type mới
                        notifTitle, 
                        notifMsg, 
                        `/truyen-tranh/${comic_slug}` // Link bấm vào
                    );
                }
            }
        }

        // C. Trả về kết quả
        const newComment = {
            id: result.insertId,
            user_id: userId,
            comic_slug,
            chapter_name: savedChapter,
            content,
            parent_id: parent_id || null,
            created_at: new Date(),
            full_name: currentUser.full_name,
            avatar: currentUser.avatar,
            role: currentUser.role,
            rank_style: currentUser.rank_style,
            exp: currentUser.exp,
            like_count: 0,
            is_liked: 0
        };

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 3. Toggle Like (Kèm thông báo Like)
exports.toggleLike = async (req, res) => {
    const userId = req.user.id;
    const { comment_id } = req.body;

    try {
        const [exists] = await db.execute('SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?', [userId, comment_id]);

        if (exists.length > 0) {
            // Unlike
            await db.execute('DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?', [userId, comment_id]);
            res.json({ message: 'Unliked', status: false });
        } else {
            // Like
            await db.execute('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [userId, comment_id]);
            res.json({ message: 'Liked', status: true });

            // --- TẠO THÔNG BÁO LIKE ---
            // 1. Lấy thông tin người đi like
            const [likers] = await db.execute('SELECT full_name FROM users WHERE id = ?', [userId]);
            const likerName = likers[0].full_name;

            // 2. Lấy thông tin comment được like (để biết chủ nhân và slug truyện)
            const [comments] = await db.execute('SELECT user_id, comic_slug, content FROM comments WHERE id = ?', [comment_id]);
            
            if (comments.length > 0) {
                const commentOwnerId = comments[0].user_id;
                const comicSlug = comments[0].comic_slug;
                const commentContent = comments[0].content;

                // Không thông báo nếu tự like chính mình
                if (commentOwnerId !== userId) {
                    const notifTitle = `${likerName} đã thích bình luận của bạn`;
                    const notifMsg = `"${commentContent.substring(0, 40)}${commentContent.length > 40 ? '...' : ''}"`;

                    await createNotificationInternal(
                        commentOwnerId,
                        'like', // Type mới
                        notifTitle,
                        notifMsg,
                        `/truyen-tranh/${comicSlug}`
                    );
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};