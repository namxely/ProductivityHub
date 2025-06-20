# ProductivityHub - Ứng dụng Quản lý Năng suất Cá nhân

> Được phát triển bởi **Nguyễn Thành Nam** ([@namxely](https://github.com/namxely))

ProductivityHub là một ứng dụng web quản lý năng suất cá nhân được xây dựng với React + TypeScript (frontend) và Node.js + Express + MongoDB (backend). Ứng dụng cung cấp giao diện hiện đại với thiết kế glass morphism và animations mượt mà.

## ✨ Tính năng

### 🔐 Hệ thống Authentication
- **Đăng ký/Đăng nhập**: Bảo mật với JWT
- **Quản lý phiên**: Tự động refresh token
- **Bảo vệ routes**: Chỉ người dùng đã xác thực mới truy cập được

### 📋 Quản lý Công việc (Tasks)
- ✅ **CRUD đầy đủ**: Tạo, đọc, cập nhật, xóa công việc
- 🎯 **Phân loại ưu tiên**: Cao, trung bình, thấp với gradient màu
- 📊 **Theo dõi tiến độ**: Thống kê hoàn thành real-time
- 🔍 **Tìm kiếm & lọc**: Tìm theo tiêu đề, mô tả, ưu tiên
- 📅 **Ngày đến hạn**: Quản lý deadline
- 🏷️ **Phân loại**: Tổ chức theo category

### 📝 Quản lý Ghi chú (Notes)
- ✏️ **Editor**: Tạo và chỉnh sửa ghi chú trực tiếp
- 🎨 **Categorization**: Phân loại theo General, Work, Personal, Ideas, Study
- 🔍 **Tìm kiếm**: Tìm theo tiêu đề, nội dung, tags
- 📊 **Thống kê**: Đếm tổng ghi chú, danh mục
- 🎯 **Grid layout**: Hiển thị dạng thẻ responsive

### ⏱️ Theo dõi Thời gian (Time Tracking)
- ⏱️ **Timer real-time**: Đếm thời gian làm việc
- 📊 **Thống kê**: Thời gian hôm nay, tuần này
- 📝 **Ghi lại session**: Lưu title, description, project
- 📅 **Thêm thủ công**: Nhập thời gian cho công việc đã hoàn thành
- 🗑️ **Quản lý records**: Xem và xóa các bản ghi

### 📊 Dashboard
- 📈 **Tổng quan năng suất**: Số liệu thống kê trực quan
- ⚡ **Real-time updates**: Cập nhật tức thì
- 📅 **Tiến trình tuần**: Phần trăm hoàn thành công việc
- 📋 **Công việc gần đây**: Danh sách 5 task mới nhất

### 🎨 Giao diện & UX
- 🌙 **Dark theme**: Thiết kế tối hiện đại
- ✨ **Glass morphism**: Hiệu ứng kính mờ đẹp mắt
- 🎭 **Gradients**: Màu gradient rực rỡ
- 🔄 **Smooth animations**: Framer Motion
- 📱 **Responsive**: Tương thích mọi thiết bị
- 🎯 **Large typography**: Chữ to, dễ đọc
- 🖱️ **Hover effects**: Tương tác mượt mà

## 🛠️ Công nghệ sử dụng

### Frontend
- ⚛️ **React 19** + **TypeScript** - UI Library & Type Safety
- ⚡ **Vite** - Build tool siêu nhanh
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- ✨ **Framer Motion** - Animation library
- 🛣️ **React Router** - Client-side routing
- 🔥 **React Hot Toast** - Beautiful notifications
- 🎨 **Lucide React** - Beautiful icons

### Backend
- 🟢 **Node.js** + **Express** - Server runtime & framework
- 🍃 **MongoDB** + **Mongoose** - Database & ODM
- 🔑 **JWT** - JSON Web Tokens for auth
- 🔒 **bcryptjs** - Password hashing
- 🛡️ **Helmet** - Security headers
- 🌐 **CORS** - Cross-origin resource sharing
- ⏱️ **Express Rate Limit** - Rate limiting

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- 📦 **Node.js 18+**
- 🍃 **MongoDB** (local hoặc MongoDB Atlas)

### Bước 1: Clone repository
```bash
git clone https://github.com/namxely/productivity-hub
cd productivity-hub
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình môi trường
Tạo file `.env` trong thư mục root:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-123
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/productivity-hub
```

### Bước 4: Chạy ứng dụng
```bash
# Chạy cả server và client đồng thời
npm run dev
```

### Bước 5: Truy cập ứng dụng
- 🌐 **Frontend**: http://localhost:5173
- 🔌 **Backend API**: http://localhost:5000

## 📝 API Documentation

### 🔐 Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### 📋 Tasks
- `GET /api/tasks` - Lấy danh sách công việc
- `POST /api/tasks` - Tạo công việc mới
- `PUT /api/tasks/:id` - Cập nhật công việc
- `DELETE /api/tasks/:id` - Xóa công việc

### 📝 Notes
- `GET /api/notes` - Lấy danh sách ghi chú
- `POST /api/notes` - Tạo ghi chú mới
- `PUT /api/notes/:id` - Cập nhật ghi chú
- `DELETE /api/notes/:id` - Xóa ghi chú

### ⏱️ Time Entries
- `GET /api/time-entries` - Lấy danh sách time entries
- `POST /api/time-entries` - Tạo time entry mới
- `DELETE /api/time-entries/:id` - Xóa time entry

## 🔧 Scripts có sẵn

```bash
npm run dev        # 🚀 Chạy cả client và server
npm run client     # ⚛️ Chạy frontend dev server
npm run server     # 🟢 Chạy backend server
npm run build      # 📦 Build production
npm start          # 🚀 Chạy production server
```

## 📦 Cấu trúc dự án

```
productivity-hub/
├── 📁 src/                    # Frontend source code
│   ├── 📁 components/         # Reusable React components
│   │   ├── AuthForm.tsx       # Authentication forms
│   │   ├── Layout.tsx         # Main layout wrapper
│   │   └── Sidebar.tsx        # Navigation sidebar
│   ├── 📁 contexts/           # React Context providers
│   │   └── AuthContext.tsx    # Authentication context
│   ├── 📁 pages/              # Page components
│   │   ├── Dashboard.tsx      # 📊 Dashboard overview
│   │   ├── Tasks.tsx          # 📋 Task management
│   │   ├── Notes.tsx          # 📝 Notes management
│   │   └── TimeTracking.tsx   # ⏱️ Time tracking
│   ├── main.tsx               # App entry point
│   └── App.tsx                # Main app component
├── 📁 server/                 # Backend source code
│   ├── 📁 models/             # MongoDB schemas
│   │   ├── User.js            # User model
│   │   ├── Task.js            # Task model
│   │   ├── Note.js            # Note model
│   │   └── TimeEntry.js       # Time entry model
│   ├── 📁 routes/             # API route handlers
│   │   ├── auth.js            # Authentication routes
│   │   ├── tasks.js           # Task CRUD routes
│   │   ├── notes.js           # Note CRUD routes
│   │   └── timeEntries.js     # Time tracking routes
│   ├── 📁 middleware/         # Express middleware
│   │   └── auth.js            # JWT authentication
│   └── index.js               # Server entry point
├── package.json               # Dependencies & scripts
└── README.md                  # Project documentation
```

## 🎨 Screenshots & Features

### ✨ Thiết kế hiện đại
- **Glass morphism effects** với backdrop blur
- **Gradient backgrounds** rực rỡ
- **Large typography** dễ đọc
- **Smooth hover animations**
- **Responsive grid layouts**

### 🚀 Performance
- **Hot Module Replacement** với Vite
- **MongoDB in-memory** cho development
- **Optimized React rendering**
- **Efficient state management**

## 🔧 Development

### 🐛 Debug mode
```bash
# Debug server với nodemon
npm run server

# Hot reload client
npm run client
```

### 🧪 Testing
Dự án sử dụng development server với hot reload để test nhanh chóng.

## 👨‍💻 Về tác giả

**Nguyễn Thành Nam (namxely)**
- 💼 GitHub: [@namxely](https://github.com/namxely)
- 🔧 Tech Stack: TypeScript, React, Node.js, Go
- 🌟 Các dự án khác: KhamBenh, BanKhoaHoc, Build-your-own-viet-redis

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! 

1. 🍴 Fork project
2. 🌿 Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to branch (`git push origin feature/AmazingFeature`)
5. 🔃 Tạo Pull Request

## 📄 License

Dự án này được phân phối dưới **MIT License** - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

⭐ **Nếu project này hữu ích, hãy cho một star nhé!** ⭐
