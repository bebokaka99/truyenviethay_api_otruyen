const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');

dotenv.config(); // Load biến môi trường từ file .env

const authRoutes = require('./routes/auth'); // Import route Auth

// Cấu hình
app.use(cors());
app.use(express.json()); // Để server hiểu JSON từ React gửi lên

// Routes
app.use('/api/auth', authRoutes); // Gắn route Auth vào đường dẫn gốc /api/auth

// Route test
app.get('/', (req, res) => {
    res.send('Backend Node.js đang chạy ổn định!');
});

// API Proxy Otruyen (Giữ lại code cũ của bạn ở đây)
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