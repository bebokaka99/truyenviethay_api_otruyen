const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { createNotificationInternal } = require('./notificationController');

// --- LIBRARY (TỦ TRUYỆN) ---

// Thêm/Cập nhật tủ truyện (Follow)
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

//Bỏ theo dõi (Unfollow)
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

// Lấy danh sách truyện đang theo dõi
exports.getLibrary = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute('SELECT * FROM library WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Check Follow Status
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

// --- HISTORY (LỊCH SỬ ĐỌC) ---

// Lưu lịch sử (FIX BUG: Progress is not stopping/claiming)
exports.saveHistory = async (req, res) => {
    const userId = req.user.id;
    const { comic_slug, comic_name, comic_image, chapter_name } = req.body;
    try {
        // 1. Lưu lịch sử đọc (Code cũ)
        await db.execute(
            `INSERT INTO reading_history (user_id, comic_slug, comic_name, comic_image, chapter_name, read_at) 
             VALUES (?, ?, ?, ?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE chapter_name = VALUES(chapter_name), read_at = NOW()`,
            [userId, comic_slug, comic_name, comic_image, chapter_name]
        );

        // 2. LOGIC NHIỆM VỤ: "daily_read"
        const [qRows] = await db.execute("SELECT id, target_count FROM quests WHERE quest_key = 'daily_read'");
        
        if (qRows.length > 0) {
            const questId = qRows[0].id;
            const target = qRows[0].target_count;

            // FIX: Sử dụng logic chặt chẽ để tăng count và không reset is_claimed khi ngày chưa đổi
            await db.execute(`
                INSERT INTO user_quests (user_id, quest_id, current_count, is_claimed, last_updated)
                VALUES (?, ?, 1, 0, CURRENT_DATE())
                ON DUPLICATE KEY UPDATE 
                    -- Chỉ tăng count nếu CHƯA ĐẠT target VÀ cùng ngày
                    current_count = IF(last_updated = CURRENT_DATE() AND current_count < ?, current_count + 1, 1),
                    is_claimed = IF(last_updated = CURRENT_DATE(), is_claimed, 0),
                    last_updated = CURRENT_DATE()
            `, [userId, questId, target]);

            // KIỂM TRA LẠI TRẠNG THÁI (Check nếu vừa đạt target VÀ is_claimed = 0)
            const [progRows] = await db.execute("SELECT current_count, is_claimed FROM user_quests WHERE user_id = ? AND quest_id = ? AND last_updated = CURRENT_DATE()", [userId, questId]);
            
            if (progRows.length > 0 && progRows[0].current_count === target && progRows[0].is_claimed === 0) {
                 await createNotificationInternal(
                    userId, 'quest', 'Nhiệm vụ hoàn thành!', 'Bạn đã hoàn thành nhiệm vụ đọc truyện hàng ngày. Nhận XP ngay!', '/profile?tab=tasks' 
                );
            }
        }
        
        res.status(200).json({ message: 'Đã lưu lịch sử & cập nhật nhiệm vụ' });
    } catch (error) {
        console.error("Lỗi lưu lịch sử:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy danh sách lịch sử
exports.getHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute('SELECT * FROM reading_history WHERE user_id = ? ORDER BY read_at DESC LIMIT 50', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Check Lịch Sử Cụ Thể (Để hiện nút Đọc Tiếp)
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

// --- PROFILE (THÔNG TIN CÁ NHÂN) ---

// Cập nhật Profile 
exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    // Lấy full_name, rank_style từ req.body
    const { full_name, rank_style } = req.body;

    try {
        let avatarPath = null;
        if (req.file) {
            avatarPath = req.file.path.replace(/\\/g, "/");
        }

        let sql = 'UPDATE users SET full_name = ?, rank_style = ?';
        let params = [full_name, rank_style, userId];

        if (avatarPath) {
            sql += ', avatar = ?';
            params.splice(1, 0, avatarPath); 
        }

        sql += ' WHERE id = ?';

        // Logic tối ưu hóa câu lệnh SQL:
        let updateFields = [];
        let updateValues = [];

        updateFields.push('full_name = ?');
        updateValues.push(full_name);

        updateFields.push('rank_style = ?');
        updateValues.push(rank_style);

        if (avatarPath) {
            updateFields.push('avatar = ?');
            updateValues.push(avatarPath);
        }

        updateValues.push(userId);

        await db.execute(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);


        // Trả về user mới (Phải SELECT cả exp và rank_style)
        const [users] = await db.execute('SELECT id, username, email, full_name, avatar, role, exp, rank_style FROM users WHERE id = ?', [userId]);
        res.json({ message: 'Cập nhật thành công!', user: users[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    try {
        const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);
        const user = users[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// --- ADMIN ---

// [ADMIN] Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, username, email, full_name, role, status, warnings, ban_expires_at, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// [ADMIN] Xóa người dùng
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Đã xóa người dùng thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi xóa' });
    }
};

// [ADMIN] Cảnh báo người dùng
exports.warnUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('UPDATE users SET warnings = warnings + 1 WHERE id = ?', [id]);
        res.json({ message: 'Đã gửi cảnh báo!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// [ADMIN] Chặn người dùng (Ban)
exports.banUser = async (req, res) => {
    const { id } = req.params;
    const { days } = req.body;

    try {
        let banDate = null;
        let status = 'banned';

        if (days === -1 || days === '-1') {
            banDate = null;
        } else {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(days));
            banDate = date.toISOString().slice(0, 19).replace('T', ' ');
        }

        await db.execute(
            'UPDATE users SET status = ?, ban_expires_at = ? WHERE id = ?',
            [status, banDate, id]
        );

        res.json({ message: `Đã chặn người dùng ${days === -1 || days === '-1' ? 'vĩnh viễn' : days + ' ngày'}!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi chặn' });
    }
};

// [ADMIN] Mở chặn (Unban)
exports.unbanUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute("UPDATE users SET status = 'active', ban_expires_at = NULL WHERE id = ?", [id]);
        res.json({ message: 'Đã mở khóa tài khoản!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};