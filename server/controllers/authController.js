const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createNotificationInternal } = require('./notificationController'); 

// Helper nội bộ để cập nhật tiến độ nhiệm vụ điểm danh (Giữ nguyên logic đã fix)
const updateDailyLoginQuest = async (userId) => {
    try {
        const [qRows] = await db.execute("SELECT id, target_count FROM quests WHERE quest_key = 'daily_login'");
        if (qRows.length === 0) return;
        const questId = qRows[0].id;

        // Kiểm tra bản ghi cũ
        const [existing] = await db.execute(
            "SELECT * FROM user_quests WHERE user_id = ? AND quest_id = ?", 
            [userId, questId]
        );

        const today = new Date().toISOString().slice(0, 10);
        let shouldNotify = false;

        if (existing.length === 0) {
            await db.execute(
                "INSERT INTO user_quests (user_id, quest_id, current_count, is_claimed, last_updated) VALUES (?, ?, 1, 0, ?)",
                [userId, questId, today]
            );
            shouldNotify = true;
        } else {
            const record = existing[0];
            // Check ngày bằng JS (sau khi đã lấy từ DB)
            // Lưu ý: Cần cẩn thận timezone, nhưng logic này tạm ổn với date string
            const lastUpdate = new Date(record.last_updated).toISOString().slice(0, 10);

            if (lastUpdate !== today) {
                await db.execute(
                    "UPDATE user_quests SET current_count = 1, is_claimed = 0, last_updated = ? WHERE id = ?",
                    [today, record.id]
                );
                shouldNotify = true;
            }
        }

        if (shouldNotify) {
             await createNotificationInternal(
                userId, 'quest', 'Nhiệm vụ hoàn thành!', 'Bạn đã điểm danh thành công. Nhận +50XP ngay!', '/profile?tab=tasks'
             );
        }
    } catch (error) {
        console.error("Lỗi cập nhật quest Daily Login:", error);
    }
};

// --- ĐĂNG KÝ ---
exports.register = async (req, res) => {
    const { username, email, password, full_name } = req.body;

    try {
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email hoặc Username đã tồn tại!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.execute(
            'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, full_name]
        );

        res.status(201).json({ message: 'Đăng ký thành công! Hãy đăng nhập ngay.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
    }
};

// --- ĐĂNG NHẬP (FIX: CHECK BAN) ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Tìm user theo email
        // QUAN TRỌNG: Phải lấy cột 'status' và 'ban_expires_at'
        const [users] = await db.execute(
            'SELECT id, username, email, full_name, avatar, role, exp, rank_style, password, status, ban_expires_at FROM users WHERE email = ?', 
            [email]
        );
        
        if (users.length === 0) {
            return res.status(400).json({ message: 'Email không tồn tại!' });
        }

        const user = users[0];

        // --- 2. KIỂM TRA TRẠNG THÁI BỊ CHẶN (MỚI THÊM) ---
        if (user.status === 'banned') {
            const now = new Date();
            
            // Trường hợp 1: Chặn có thời hạn
            if (user.ban_expires_at) {
                const banTime = new Date(user.ban_expires_at);
                if (banTime > now) {
                    // Vẫn còn hạn chặn
                    return res.status(403).json({ 
                        message: `Tài khoản bị khóa đến ${banTime.toLocaleString('vi-VN')}. Lý do: Vi phạm quy định.` 
                    });
                } else {
                    // Đã hết hạn chặn -> Tự động mở khóa (Cập nhật DB)
                    await db.execute("UPDATE users SET status = 'active', ban_expires_at = NULL WHERE id = ?", [user.id]);
                    // Cho phép đi tiếp xuống dưới để đăng nhập
                }
            } 
            // Trường hợp 2: Chặn vĩnh viễn (ban_expires_at là NULL nhưng status là banned)
            else {
                return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa vĩnh viễn do vi phạm nghiêm trọng.' });
            }
        }
        // --------------------------------------------------

        // 3. Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng!' });
        }
        
        // 4. Kích hoạt nhiệm vụ
        if (user.role === 'user') {
            await updateDailyLoginQuest(user.id);
        }

        // 5. Tạo token
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                avatar: user.avatar,
                role: user.role,
                exp: user.exp, 
                rank_style: user.rank_style 
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
};