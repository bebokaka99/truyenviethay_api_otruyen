const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer'); 
const path = require('path');

// --- CẤU HÌNH MULTER ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars/'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Không phải file ảnh!'), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

// --- IMPORT CONTROLLERS ---
const { 
    addToLibrary, removeFromLibrary, getLibrary, checkFollowStatus, 
    saveHistory, getHistory, checkReadingHistory,
    updateProfile, changePassword, getAllUsers, 
    deleteUser, warnUser, banUser, unbanUser // Các hàm Admin
} = require('../controllers/userController');

// --- LIBRARY (TỦ TRUYỆN) ---
router.post('/library', authMiddleware, addToLibrary);
router.delete('/library/:comic_slug', authMiddleware, removeFromLibrary);
router.get('/library', authMiddleware, getLibrary);
router.get('/library/check/:comic_slug', authMiddleware, checkFollowStatus);

// --- HISTORY (LỊCH SỬ) ---
router.post('/history', authMiddleware, saveHistory);
router.get('/history', authMiddleware, getHistory);
router.get('/history/check/:comic_slug', authMiddleware, checkReadingHistory);

// --- PROFILE (CÁ NHÂN) ---
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);
router.put('/password', authMiddleware, changePassword);

// --- ADMIN (QUẢN TRỊ) ---
router.get('/admin/users', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, deleteUser);
router.post('/admin/users/:id/warn', authMiddleware, adminMiddleware, warnUser);
router.post('/admin/users/:id/ban', authMiddleware, adminMiddleware, banUser);
router.post('/admin/users/:id/unban', authMiddleware, adminMiddleware, unbanUser);

module.exports = router;