const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const path = require('path'); // <--- BẮT BUỘC PHẢI CÓ DÒNG NÀY

dotenv.config(); 

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Cấu hình
app.use(cors());
app.use(express.json());

// --- CẤU HÌNH STATIC FILE (Để xem ảnh avatar upload lên) ---
// Dòng này giúp đường dẫn http://localhost:5000/uploads/avatars/ten-anh.jpg hoạt động
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Route test
app.get('/', (req, res) => {
    res.send('Backend Node.js đang chạy ổn định!');
});

// API Proxy Otruyen
const axios = require('axios');
app.get('/api/home', async (req, res) => {
    try {
        const response = await axios.get('https://otruyenapi.com/v1/api/home');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy data Otruyen" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});