const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getComments, addComment, toggleLike } = require('../controllers/commentController');

// GET: Lấy bình luận (Thêm param userId để check like status)
router.get('/:comic_slug', getComments);

// POST: Gửi bình luận
router.post('/', authMiddleware, addComment);

// POST: Like/Unlike
router.post('/like', authMiddleware, toggleLike);

module.exports = router;