// src/utils/levelSystem.js

export const RANK_STYLES = {
    default: {
        name: 'Mặc định',
        ranks: (level) => `Cấp ${level}`,
        color: (level) => 'bg-blue-600'
    },
    cultivation: {
        name: 'Tu Tiên',
        ranks: (level) => {
            if (level <= 10) return 'Luyện Khí';
            if (level <= 20) return 'Trúc Cơ';
            if (level <= 30) return 'Kim Đan';
            if (level <= 40) return 'Nguyên Anh';
            if (level <= 50) return 'Hóa Thần';
            if (level <= 60) return 'Luyện Hư';
            if (level <= 70) return 'Hợp Thể';
            if (level <= 80) return 'Đại Thừa';
            return 'Độ Kiếp';
        },
        color: (level) => {
            if (level <= 10) return 'bg-gray-500'; 
            if (level <= 30) return 'bg-green-600'; 
            if (level <= 60) return 'bg-purple-600'; 
            return 'bg-yellow-500 text-black'; 
        }
    },
    hunter: {
        name: 'Thợ Săn',
        ranks: (level) => {
            if (level <= 10) return 'Rank E';
            if (level <= 25) return 'Rank D';
            if (level <= 45) return 'Rank C';
            if (level <= 65) return 'Rank B';
            if (level <= 85) return 'Rank A';
            return 'Rank S';
        },
        color: (level) => {
            if (level <= 10) return 'bg-gray-600';
            if (level <= 65) return 'bg-blue-500';
            if (level <= 85) return 'bg-red-600';
            return 'bg-yellow-400 text-black'; 
        }
    }
};

// Công thức: Level hiện tại = Căn bậc 2 của (XP / 100)
// Ví dụ: 100 XP = Lv 1, 400 XP = Lv 2, 900 XP = Lv 3
export const getLevelFromExp = (exp) => {
    const level = Math.floor(Math.sqrt(exp / 100));
    return level < 1 ? 1 : level;
};

// Công thức tính XP cần để lên cấp tiếp theo
export const getNextLevelExp = (currentLevel) => {
    return (currentLevel + 1) * (currentLevel + 1) * 100;
};