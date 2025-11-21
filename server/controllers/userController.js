const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { createNotificationInternal } = require('./notificationController');

// --- HELPER: CẬP NHẬT TIẾN ĐỘ NHIỆM VỤ ---
const updateQuestProgress = async (userId, questKey, type) => {
    try {
        const [qRows] = await db.execute("SELECT id, target_count FROM quests WHERE quest_key = ?", [questKey]);
        if (qRows.length === 0) return;
        
        const questId = qRows[0].id;
        const target = qRows[0].target_count;

        // Kiểm tra bản ghi hiện tại
        const [existing] = await db.execute(
            `SELECT id, current_count, is_claimed, last_updated,
                    DATEDIFF(CURRENT_DATE(), last_updated) as days_diff,
                    YEARWEEK(CURRENT_DATE(), 1) - YEARWEEK(last_updated, 1) as weeks_diff
             FROM user_quests WHERE user_id = ? AND quest_id = ?`, 
            [userId, questId]
        );

        const today = new Date().toISOString().slice(0, 10);
        let newCount = 0;
        let newClaimed = 0;
        let needUpdate = false;
        let isFirstComplete = false;

        if (existing.length === 0) {
            // Chưa có -> Tạo mới = 1
            await db.execute(
                "INSERT INTO user_quests (user_id, quest_id, current_count, is_claimed, last_updated) VALUES (?, ?, 1, 0, ?)",
                [userId, questId, today]
            );
            if (target === 1) isFirstComplete = true;
        } else {
            const record = existing[0];
            let shouldReset = false;

            // Logic Reset
            if (type === 'daily' && record.days_diff !== 0) shouldReset = true;
            else if (type === 'weekly' && record.weeks_diff !== 0) shouldReset = true;
            // achievement: Không bao giờ reset

            if (shouldReset) {
                newCount = 1;
                newClaimed = 0;
                needUpdate = true;
                if (target === 1) isFirstComplete = true;
            } else {
                // Cùng chu kỳ -> Tăng nếu chưa max (hoặc achievement thì cứ tăng đến max)
                newCount = record.current_count;
                newClaimed = record.is_claimed;
                
                if (newCount < target) {
                    newCount++;
                    needUpdate = true;
                    if (newCount === target && newClaimed === 0) {
                        isFirstTimeComplete = true;
                    }
                }
            }

            if (needUpdate) {
                await db.execute(
                    "UPDATE user_quests SET current_count = ?, is_claimed = ?, last_updated = ? WHERE id = ?",
                    [newCount, newClaimed, today, record.id]
                );
            }
        }

        // Notify
        if (isFirstTimeComplete) {
             await createNotificationInternal(userId, 'quest', 'Nhiệm vụ hoàn thành!', `Bạn đã hoàn thành: ${questKey}. Nhận thưởng ngay!`, '/profile?tab=tasks');
        }
    } catch (error) {
        console.error("Lỗi updateQuestProgress:", error);
    }
};

// --- LIBRARY (TỦ TRUYỆN) ---

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
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

exports.removeFromLibrary = async (req, res) => {
    const userId = req.user.id;
    const { comic_slug } = req.params;
    try {
        await db.execute('DELETE FROM library WHERE user_id = ? AND comic_slug = ?', [userId, comic_slug]);
        res.status(200).json({ message: 'Đã bỏ theo dõi!' });
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

exports.getLibrary = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute('SELECT * FROM library WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

exports.checkFollowStatus = async (req, res) => {
    const userId = req.user.id;
    const { comic_slug } = req.params;
    try {
        const [rows] = await db.execute('SELECT id FROM library WHERE user_id = ? AND comic_slug = ?', [userId, comic_slug]);
        res.json({ isFollowed: rows.length > 0 });
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

// --- HISTORY (LỊCH SỬ ĐỌC) ---

exports.saveHistory = async (req, res) => {
    const userId = req.user.id;
    const { comic_slug, comic_name, comic_image, chapter_name } = req.body;
    try {
        // 1. Lưu lịch sử đọc
        await db.execute(
            `INSERT INTO reading_history (user_id, comic_slug, comic_name, comic_image, chapter_name, read_at) 
             VALUES (?, ?, ?, ?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE chapter_name = VALUES(chapter_name), read_at = NOW()`,
            [userId, comic_slug, comic_name, comic_image, chapter_name]
        );

        // 2. Cập nhật các nhiệm vụ liên quan
        // Không dùng await Promise.all để tránh block request chính, chạy ngầm
        Promise.all([
            updateQuestProgress(userId, 'daily_read', 'daily'),
            updateQuestProgress(userId, 'weekly_read', 'weekly'),
            updateQuestProgress(userId, 'achieve_read_100', 'achievement'),
            updateQuestProgress(userId, 'achieve_read_1000', 'achievement')
        ]).catch(e => console.error("Lỗi update quest:", e));
        
        res.status(200).json({ message: 'Đã lưu lịch sử' });
    } catch (error) {
        console.error("Lỗi saveHistory:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute('SELECT * FROM reading_history WHERE user_id = ? ORDER BY read_at DESC LIMIT 50', [userId]);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

exports.checkReadingHistory = async (req, res) => {
    const userId = req.user.id;
    const { comic_slug } = req.params;
    try {
        const [rows] = await db.execute('SELECT chapter_name FROM reading_history WHERE user_id = ? AND comic_slug = ?', [userId, comic_slug]);
        if (rows.length > 0) res.json({ chapter_name: rows[0].chapter_name });
        else res.json({ chapter_name: null });
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

// --- PROFILE (THÔNG TIN CÁ NHÂN) ---

exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { full_name, rank_style } = req.body;
    try {
        let avatarPath = req.file ? req.file.path.replace(/\\/g, "/") : null;
        let sql = 'UPDATE users SET full_name = ?, rank_style = ?';
        let params = [full_name, rank_style];
        if (avatarPath) { sql += ', avatar = ?'; params.push(avatarPath); }
        sql += ' WHERE id = ?'; params.push(userId);
        await db.execute(sql, params);
        const [users] = await db.execute('SELECT id, username, email, full_name, avatar, role, exp, rank_style FROM users WHERE id = ?', [userId]);
        res.json({ message: 'Cập nhật thành công!', user: users[0] });
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

exports.changePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    try {
        const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);
        if(!await bcrypt.compare(currentPassword, users[0].password)) return res.status(400).json({ message: 'Sai mật khẩu' });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

// --- ADMIN ACTIONS ---

exports.getAllUsers = async (req, res) => {
    try { const [rows] = await db.execute('SELECT id, username, email, full_name, role, status, warnings, ban_expires_at, created_at FROM users ORDER BY created_at DESC'); res.json(rows); } catch (e) { res.status(500).json({message: 'Lỗi'}); }
};
exports.deleteUser = async (req, res) => { try { await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]); res.json({message:'Đã xóa'}); } catch(e) { res.status(500).json({message:'Lỗi'}); } };
exports.warnUser = async (req, res) => { try { await db.execute('UPDATE users SET warnings = warnings + 1 WHERE id = ?', [req.params.id]); res.json({message:'Đã cảnh báo'}); } catch(e) { res.status(500).json({message:'Lỗi'}); } };
exports.banUser = async (req, res) => { 
    const {id} = req.params; const {days} = req.body; 
    let d = null, s = 'banned'; if(days != -1 && days != '-1') { d = new Date(); d.setDate(d.getDate() + parseInt(days)); d = d.toISOString().slice(0,19).replace('T',' '); }
    try { await db.execute('UPDATE users SET status = ?, ban_expires_at = ? WHERE id = ?', [s, d, id]); res.json({message:'Đã chặn'}); } catch(e) { res.status(500).json({message:'Lỗi'}); } 
};
exports.unbanUser = async (req, res) => { try { await db.execute("UPDATE users SET status = 'active', ban_expires_at = NULL WHERE id = ?", [req.params.id]); res.json({message:'Đã mở khóa'}); } catch(e) { res.status(500).json({message:'Lỗi'}); } };