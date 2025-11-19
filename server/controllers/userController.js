const bcrypt = require('bcryptjs');
const db = require('../config/db');

// 1. Thêm/Cập nhật tủ truyện
exports.addToLibrary = async (req, res) => {
    const userId = req.user.id;
    const { comic_slug, comic_name, comic_image, latest_chapter } = req.body;

    try {
        await db.execute(
            `INSERT INTO library (user_id, comic_slug, comic_name, comic_image, latest_chapter) 
             VALUES (?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE latest_chapter = VALUES(latest_chapter), comic_image = VALUES(comic_image)`,
            [userId, comic_slug, comic_name, comic_image, latest_chapter]
        );
        res.status(200).json({ message: 'Đã lưu vào tủ truyện!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 2. Bỏ theo dõi
exports.removeFromLibrary = async (req, res) => {
    const userId = req.user.id;
    const { comic_slug } = req.params;

    try {
        await db.execute('DELETE FROM library WHERE user_id = ? AND comic_slug = ?', [userId, comic_slug]);
        res.status(200).json({ message: 'Đã bỏ theo dõi!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 3. Lấy danh sách theo dõi
exports.getLibrary = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute('SELECT * FROM library WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 4. Check Follow
exports.checkFollowStatus = async (req, res) => {
    const userId = req.user.id;
    const { comic_slug } = req.params;
    try {
        const [rows] = await db.execute('SELECT id FROM library WHERE user_id = ? AND comic_slug = ?', [userId, comic_slug]);
        res.json({ isFollowed: rows.length > 0 });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 5. Lưu lịch sử
exports.saveHistory = async (req, res) => {
    const userId = req.user.id;
    const { comic_slug, comic_name, comic_image, chapter_name } = req.body;
    try {
        await db.execute(
            `INSERT INTO reading_history (user_id, comic_slug, comic_name, comic_image, chapter_name, read_at) 
             VALUES (?, ?, ?, ?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE 
                chapter_name = VALUES(chapter_name), 
                comic_name = VALUES(comic_name),
                comic_image = VALUES(comic_image),
                read_at = NOW()`,
            [userId, comic_slug, comic_name, comic_image, chapter_name]
        );
        res.status(200).json({ message: 'Đã lưu lịch sử' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 6. Lấy danh sách lịch sử
exports.getHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute('SELECT * FROM reading_history WHERE user_id = ? ORDER BY read_at DESC LIMIT 50', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 7. Check Lịch Sử Cụ Thể (MỚI) -> Để hiện nút Đọc Tiếp
exports.checkReadingHistory = async (req, res) => {
    const userId = req.user.id;
    const { comic_slug } = req.params;

    try {
        const [rows] = await db.execute(
            'SELECT chapter_name FROM reading_history WHERE user_id = ? AND comic_slug = ?',
            [userId, comic_slug]
        );
        if (rows.length > 0) {
            res.json({ chapter_name: rows[0].chapter_name });
        } else {
            res.json({ chapter_name: null });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
// 8. Cập nhật Profile (Hỗ trợ upload ảnh)
exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { full_name } = req.body;

    try {
        let avatarPath = null;

        // Nếu có file upload lên
        if (req.file) {
            // Lưu đường dẫn tương đối: uploads/avatars/ten-file.jpg
            avatarPath = req.file.path.replace(/\\/g, "/"); // Fix lỗi đường dẫn ngược trên Windows
        }

        // Câu lệnh SQL động (nếu không up ảnh thì chỉ update tên)
        let sql = 'UPDATE users SET full_name = ? WHERE id = ?';
        let params = [full_name, userId];

        if (avatarPath) {
            sql = 'UPDATE users SET full_name = ?, avatar = ? WHERE id = ?';
            params = [full_name, avatarPath, userId];
        }

        await db.execute(sql, params);

        // Trả về user mới
        const [users] = await db.execute('SELECT id, username, email, full_name, avatar, role FROM users WHERE id = ?', [userId]);
        res.json({ message: 'Cập nhật thành công!', user: users[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 9. Đổi mật khẩu
exports.changePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    try {
        // 1. Lấy mật khẩu cũ trong DB
        const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);
        const user = users[0];

        // 2. So sánh mật khẩu cũ
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng!' });
        }

        // 3. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Lưu vào DB
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};