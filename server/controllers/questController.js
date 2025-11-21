const db = require('../config/db');
const { createNotificationInternal } = require('./notificationController');

// Helper tính level
const getLevelFromExp = (exp) => Math.floor(Math.sqrt(exp / 100)) || 1;

// Lấy danh sách nhiệm vụ
exports.getQuests = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute(`
            SELECT q.*, 
                   -- Logic hiển thị: Nếu khác ngày thì trả về 0 để UI hiện chưa làm
                   CASE 
                       WHEN q.type = 'daily' AND (uq.last_updated IS NULL OR DATEDIFF(CURRENT_DATE(), uq.last_updated) != 0) THEN 0
                       ELSE COALESCE(uq.current_count, 0)
                   END as current_count,

                   CASE 
                       WHEN q.type = 'daily' AND (uq.last_updated IS NULL OR DATEDIFF(CURRENT_DATE(), uq.last_updated) != 0) THEN 0
                       ELSE COALESCE(uq.is_claimed, 0)
                   END as is_claimed

            FROM quests q
            LEFT JOIN user_quests uq ON q.id = uq.quest_id AND uq.user_id = ?
            ORDER BY FIELD(q.type, 'daily', 'weekly', 'achievement'), q.target_count ASC
        `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error("Lỗi getQuests:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Nhận thưởng (ĐÃ SỬA LỖI TRANSACTION)
exports.claimReward = async (req, res) => {
    const userId = req.user.id;
    const { quest_id } = req.body;

    let connection; // Khai báo biến kết nối

    try {
        // 1. Lấy kết nối từ Pool
        connection = await db.getConnection();

        // 2. Kiểm tra điều kiện (Đọc dữ liệu thì dùng db.execute cũng được, nhưng dùng connection cho đồng bộ)
        const [quests] = await connection.execute(
            `SELECT q.type, q.reward_exp, uq.current_count, q.target_count, uq.is_claimed, u.exp, 
                    DATEDIFF(CURRENT_DATE(), uq.last_updated) as days_diff
             FROM quests q
             JOIN user_quests uq ON q.id = uq.quest_id
             JOIN users u ON uq.user_id = u.id
             WHERE uq.user_id = ? AND uq.quest_id = ?`,
            [userId, quest_id]
        );

        if (quests.length === 0) {
            connection.release(); // Nhớ giải phóng nếu return sớm
            return res.status(400).json({ message: 'Nhiệm vụ chưa được thực hiện.' });
        }
        
        const quest = quests[0];

        // Check Logic Ngày
        if (quest.type === 'daily' && quest.days_diff !== 0) {
            connection.release();
            return res.status(400).json({ message: 'Nhiệm vụ thuộc ngày cũ. Hãy làm mới!' });
        }

        if (Number(quest.is_claimed) === 1) {
            connection.release();
            return res.status(400).json({ message: 'Đã nhận thưởng rồi.' });
        }
        if (quest.current_count < quest.target_count) {
            connection.release();
            return res.status(400).json({ message: 'Chưa đạt mục tiêu.' });
        }

        // 3. Bắt đầu Transaction (Quan trọng)
        await connection.beginTransaction();

        try {
            // A. Update is_claimed
            await connection.execute(
                'UPDATE user_quests SET is_claimed = 1 WHERE user_id = ? AND quest_id = ?', 
                [userId, quest_id]
            );
            
            // B. Update User XP
            const currentExp = quest.exp || 0;
            const newExp = currentExp + quest.reward_exp;
            const newLevel = getLevelFromExp(newExp);

            await connection.execute(
                'UPDATE users SET exp = ?, level = ? WHERE id = ?', 
                [newExp, newLevel, userId]
            );

            // Commit (Lưu lại)
            await connection.commit();

            // 4. Notify (Làm sau khi commit để tránh lỗi rollback)
            try {
                const oldLevel = getLevelFromExp(currentExp);
                if (newLevel > oldLevel) {
                    await createNotificationInternal(userId, 'level_up', 'Thăng cấp!', `Bạn đã đạt cấp độ ${newLevel}.`);
                }
            } catch (e) { console.error("Lỗi tạo notif:", e); }

            res.json({ message: `Nhận thành công +${quest.reward_exp} XP`, new_exp: newExp });

        } catch (transError) {
            // Nếu lỗi trong lúc update -> Rollback
            await connection.rollback();
            throw transError;
        }

    } catch (error) {
        console.error("🔥 LỖI SERVER CLAIM REWARD:", error);
        res.status(500).json({ message: 'Lỗi hệ thống: ' + error.message });
    } finally {
        // Luôn luôn giải phóng kết nối cuối cùng
        if (connection) connection.release();
    }
};