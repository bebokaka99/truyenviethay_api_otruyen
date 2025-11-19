const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer'); // Import Multer
const path = require('path');

// --- 1. CẤU HÌNH STORAGE (Phải đặt lên trên cùng) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars/'); // Đảm bảo thư mục này đã tồn tại
    },
    filename: function (req, file, cb) {
        // Đặt tên file: thời-gian-tên-gốc
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// --- 2. CẤU HÌNH FILTER (Chỉ lấy ảnh) ---
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Không phải file ảnh!'), false);
    }
};

// --- 3. KHỞI TẠO MULTER (Sau khi đã có storage và fileFilter) ---
const upload = multer({ storage: storage, fileFilter: fileFilter });

// --- 4. IMPORT CONTROLLERS ---
const { 
    addToLibrary, removeFromLibrary, getLibrary, checkFollowStatus, 
    saveHistory, getHistory, checkReadingHistory,
    updateProfile, changePassword 
} = require('../controllers/userController');

// --- 5. ĐỊNH NGHĨA ROUTES ---

// --- LIBRARY ---
router.post('/library', authMiddleware, addToLibrary);
router.delete('/library/:comic_slug', authMiddleware, removeFromLibrary);
router.get('/library', authMiddleware, getLibrary);
router.get('/library/check/:comic_slug', authMiddleware, checkFollowStatus);

// --- HISTORY ---
router.post('/history', authMiddleware, saveHistory);
router.get('/history', authMiddleware, getHistory);
router.get('/history/check/:comic_slug', authMiddleware, checkReadingHistory);

// --- PROFILE (Có upload ảnh) ---
// Lưu ý: upload.single('avatar') là middleware xử lý file
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);
router.put('/password', authMiddleware, changePassword);

module.exports = router;