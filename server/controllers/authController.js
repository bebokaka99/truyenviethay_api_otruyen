const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Thêm import cho Notification (Cần thiết cho logic nhiệm vụ)
const { createNotificationInternal } = require('./notificationController'); 

// Helper nội bộ để cập nhật tiến độ nhiệm vụ điểm danh
const updateDailyLoginQuest = async (userId) => {
    try {
        const [qRows] = await db.execute("SELECT id, target_count FROM quests WHERE quest_key = 'daily_login'");
        
        if (qRows.length === 0) return;
        const questId = qRows[0].id;

        // Logic: Sử dụng INSERT OR UPDATE. is_claimed chỉ reset khi ngày khác nhau.
        await db.execute(`
            INSERT INTO user_quests (user_id, quest_id, current_count, is_claimed, last_updated)
            VALUES (?, ?, 1, 0, CURRENT_DATE())
            ON DUPLICATE KEY UPDATE 
                current_count = IF(last_updated = CURRENT_DATE(), current_count, 1),
                is_claimed = IF(last_updated = CURRENT_DATE(), is_claimed, 0),
                last_updated = CURRENT_DATE()
        `, [userId, questId]);

        // KIỂM TRA: Chỉ tạo thông báo nếu user chưa claim
        const [progRows] = await db.execute("SELECT is_claimed FROM user_quests WHERE user_id = ? AND quest_id = ?", [userId, questId]);
        
        if (progRows.length > 0 && progRows[0].is_claimed === 0) {
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

// --- ĐĂNG NHẬP (FIX: Kích hoạt Quest và trả về XP/Rank) ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Tìm user theo email (Phải SELECT các cột XP, Rank Style)
        const [users] = await db.execute('SELECT id, username, email, full_name, avatar, role, exp, rank_style, password FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(400).json({ message: 'Email không tồn tại!' });
        }

        const user = users[0];

        // 2. Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng!' });
        }
        
        // 3. [MỚI] Kích hoạt nhiệm vụ đăng nhập hàng ngày
        if (user.role === 'user') {
            await updateDailyLoginQuest(user.id);
        }

        // 4. Tạo token (JWT)
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // 5. Trả về thông tin user
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                avatar: user.avatar,
                role: user.role,
                exp: user.exp, // Gửi XP
                rank_style: user.rank_style // Gửi Rank Style
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
};