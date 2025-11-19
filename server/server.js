const express = require('express');
const cors = require('cors');
const axios = require('axios'); 
const app = express();
const PORT = 5000;

// Cấu hình cơ bản
app.use(cors()); 
app.use(express.json());

// 1. API Lấy danh sách truyện trang chủ
app.get('/api/home', async (req, res) => {
    try {
        const response = await axios.get('https://otruyenapi.com/v1/api/home');
        
        res.json(response.data); 
    } catch (error) {
        console.error("Lỗi khi gọi API Otruyen:", error.message);
        res.status(500).json({ message: "Lỗi server khi lấy danh sách truyện" });
    }
});

// Route kiểm tra server
app.get('/', (req, res) => {
    res.send('Backend Node.js đang chạy ổn định!');
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});