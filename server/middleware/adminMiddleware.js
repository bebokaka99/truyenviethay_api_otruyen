module.exports = function (req, res, next) {
    // authMiddleware đã chạy trước đó và gán req.user
    // Chúng ta chỉ cần kiểm tra role
    if (req.user && req.user.role === 'admin') {
        next(); // Là Admin, cho qua
    } else {
        res.status(403).json({ message: 'Truy cập bị từ chối! Bạn không phải Admin.' });
    }
};