# 📚 TruyenVietHay - Web Đọc Truyện Tranh Online

![React](https://img.shields.io/badge/React-v18-blue)
![Node](https://img.shields.io/badge/Node.js-v18-green)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

**TruyenVietHay** là nền tảng đọc truyện tranh trực tuyến hiện đại, tối
ưu trải nghiệm người dùng với kho truyện khổng lồ được tích hợp từ
**OTruyen API**. Dự án được xây dựng với kiến trúc **MERN Stack** (MySQL
thay vì MongoDB), tập trung vào hiệu suất, giao diện người dùng (UI/UX)
và khả năng mở rộng.

------------------------------------------------------------------------

## 🚀 Tính Năng Nổi Bật

### 👤 Người Dùng (User Client)

-   **Đọc truyện thông minh:**
    -   Giao diện đọc truyện tối ưu, tải ảnh Lazy Load giúp tiết kiệm
        dung lượng.
    -   Điều hướng chương nhanh chóng, tự động lưu vị trí đọc.
-   **Kho truyện phong phú:**
    -   Tự động đồng bộ dữ liệu từ OTruyen API.
    -   Tìm kiếm, lọc theo thể loại, trạng thái (Hoàn thành/Đang tiến
        hành).
    -   Bảng xếp hạng truyện hot (dựa trên thuật toán Bayesian Average).
-   **Cá nhân hóa & Gamification:**
    -   **Tủ truyện:** Lưu truyện yêu thích.
    -   **Lịch sử:** Tự động lưu lịch sử đọc.
    -   **Hệ thống cấp độ (Level):** Tích lũy XP qua việc đọc truyện,
        bình luận, đăng nhập hàng ngày.
    -   **Nhiệm vụ (Quest):** Hoàn thành nhiệm vụ ngày/tuần để nhận
        thưởng.
-   **Tương tác cộng đồng:**
    -   Bình luận, trả lời bình luận (Reply).
    -   Thả tim (Like) bình luận.
    -   Báo cáo lỗi truyện hoặc vi phạm cộng đồng.

### 🛡️ Quản Trị Viên (Admin Dashboard)

-   **Dashboard:** Thống kê tổng quan hệ thống (User, Báo cáo, Bình
    luận...).
-   **Quản lý Người dùng:** Xem danh sách, đổi quyền (Role), Cảnh báo,
    Chặn (Ban), Xóa user.
-   **Quản lý Nội dung:** Ẩn/Hiện truyện, Đề cử truyện lên trang chủ
    (Hot).
-   **Hệ thống Báo cáo:** Xử lý các báo cáo vi phạm từ người dùng.
-   **Quản lý Nhiệm vụ:** CRUD các nhiệm vụ trong hệ thống.

------------------------------------------------------------------------

## 🛠️ Công Nghệ Sử Dụng

### Frontend (`/client`)

-   **Core:** React.js (Vite).
-   **UI/UX:** Tailwind CSS, React Icons.
-   **Routing:** React Router DOM v6.
-   **State Management:** React Context API.
-   **HTTP Client:** Axios.

### Backend (`/server`)

-   **Runtime:** Node.js.
-   **Framework:** Express.js.
-   **Database:** MySQL (kết nối qua thư viện `mysql2`).
-   **Authentication:** JWT (JSON Web Token), BcryptJS.
-   **Services:**
    -   **Cloudinary:** Lưu trữ ảnh avatar người dùng.
    -   **Brevo (Sendinblue):** Gửi email xác thực/quên mật khẩu.

------------------------------------------------------------------------

## ⚙️ Hướng Dẫn Cài Đặt (Local Development)

### 1. Yêu Cầu Tiên Quyết

-   Node.js (v16 trở lên).
-   MySQL Database (Local hoặc Cloud như TiDB, Aiven).
-   Git.

### 2. Cài Đặt & Chạy Backend

``` bash
cd server
npm install
# Tạo file .env và cấu hình
npm run dev
```

### 3. Cài Đặt & Chạy Frontend

``` bash
cd client
npm install
npm run dev
```

------------------------------------------------------------------------

## 🔑 Cấu Hình Môi Trường (.env)

Tạo file `.env` trong thư mục `server/`:

    PORT=5000
    DB_HOST=your_db_host
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    TIDB_CA_CERT=path_to_cert_or_content
    JWT_SECRET=your_super_secret_string_here
    EMAIL_USER=your_email@domain.com
    EMAIL_PASS=your_brevo_api_key
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

------------------------------------------------------------------------

## 🗂️ Cấu Trúc Thư Mục

    web-truyen-full/
    ├── client/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── contexts/
    │   │   ├── hooks/
    │   │   ├── pages/
    │   │   └── utils/
    ├── server/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── routes/
    │   └── server.js
    └── README.md

------------------------------------------------------------------------

## 🤝 Đóng Góp

1.  Fork dự án\
2.  Tạo branch mới\
3.  Commit thay đổi\
4.  Push\
5.  Mở Pull Request

------------------------------------------------------------------------

## 📝 License

Dự án được phát triển cho mục đích học tập và cộng đồng.\
© 2024 TruyenVietHay Project
