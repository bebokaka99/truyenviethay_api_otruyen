const db = require('../config/db');
const { createNotificationInternal } = require('./notificationController');

// Helper tính level
const getLevelFromExp = (exp) => Math.floor(Math.sqrt(exp / 100)) || 1;

// Lấy danh sách nhiệm vụ & trạng thái của User
exports.getQuests = async (req, res) => {
    const userId = req.user.id;
    try {
        // JOIN bảng quests và user_quests
        // Logic: Nếu ngày last_updated khác hôm nay -> coi như chưa làm (hoặc reset về 0)
        const [rows] = await db.execute(`
            SELECT q.*, 
                   COALESCE(uq.current_count, 0) as current_count, 
                   COALESCE(uq.is_claimed, 0) as is_claimed,
                   uq.last_updated
            FROM quests q
            LEFT JOIN user_quests uq ON q.id = uq.quest_id AND uq.user_id = ?
        `, [userId]);

        // Xử lý reset ngày ở phía client hiển thị hoặc update DB nếu cần thiết
        // Ở đây ta trả về raw, client sẽ check ngày để hiển thị 0/1
        const today = new Date().toISOString().slice(0, 10);
        
        const processedQuests = rows.map(q => {
            const isToday = q.last_updated && q.last_updated.toISOString().slice(0, 10) === today;
            return {
                ...q,
                current_count: isToday ? q.current_count : 0,
                is_claimed: isToday ? q.is_claimed : 0
            };
        });

        res.json(processedQuests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Nhận thưởng
exports.claimReward = async (req, res) => {
    const userId = req.user.id;
    const { quest_id } = req.body;

    try {
        // 1. Check điều kiện
        const [quests] = await db.execute(
            `SELECT q.reward_exp, uq.current_count, q.target_count, uq.is_claimed, u.exp, u.full_name 
             FROM quests q
             JOIN user_quests uq ON q.id = uq.quest_id
             JOIN users u ON uq.user_id = u.id
             WHERE uq.user_id = ? AND uq.quest_id = ? AND uq.last_updated = CURRENT_DATE()`,
            [userId, quest_id]
        );

        if (quests.length === 0) return res.status(400).json({ message: 'Nhiệm vụ chưa hoàn thành hoặc đã qua ngày.' });
        const quest = quests[0];

        if (quest.is_claimed === 1) return res.status(400).json({ message: 'Đã nhận thưởng rồi.' }); // Check is_claimed là 1
        if (quest.current_count < quest.target_count) return res.status(400).json({ message: 'Chưa đạt mục tiêu.' });

        // 2. Bắt đầu Transaction
        await db.beginTransaction();

        // Cập nhật is_claimed = TRUE (1)
        await db.execute('UPDATE user_quests SET is_claimed = 1 WHERE user_id = ? AND quest_id = ?', [userId, quest_id]);
        
        const newExp = quest.exp + quest.reward_exp;
        const newLevel = getLevelFromExp(newExp);

        // Cộng XP và cập nhật Level trong DB
        await db.execute('UPDATE users SET exp = ?, level = ? WHERE id = ?', [newExp, newLevel, userId]);

        // Check Level Up và tạo thông báo
        const oldLevel = getLevelFromExp(quest.exp);
        if (newLevel > oldLevel) {
            await createNotificationInternal(
                userId, 'level_up', 'Chúc mừng thăng cấp!', `Bạn đã đạt cấp độ ${newLevel}.`
            );
        }

        await db.commit();
        
        // Trả về XP mới để Frontend cập nhật thanh XP
        res.json({ message: `Nhận thành công +${quest.reward_exp} XP`, new_exp: newExp });

    } catch (error) {
        await db.rollback();
        console.error("Lỗi Claim Reward:", error);
        res.status(500).json({ message: 'Lỗi server khi nhận thưởng.' });
    }
};