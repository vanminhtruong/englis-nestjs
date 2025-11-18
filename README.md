# VocabMaster - Ứng dụng Quản lý và Học từ vựng Tiếng Anh

Ứng dụng web fullstack giúp bạn quản lý và luyện tập từ vựng tiếng Anh một cách hiệu quả với tính năng real-time thông qua WebSocket.

## ✨ Tính năng

### 🔐 Xác thực (Authentication)
- Đăng ký tài khoản mới
- Đăng nhập/Đăng xuất
- Bảo vệ route với JWT authentication
- Quản lý session người dùng

### 📚 Quản lý Từ vựng (Vocabulary Management)
- Thêm, sửa, xóa từ vựng
- Tìm kiếm và lọc từ vựng theo độ khó
- Thống kê số lần đúng/sai cho mỗi từ
- Hỗ trợ tags để phân loại từ
- Giao diện đẹp mắt với dark mode

### 🎯 Luyện tập (Practice)
- Nhiều chế độ luyện tập: Flashcard, Typing
- Hệ thống điểm số và thống kê
- Theo dõi tiến độ học tập
- Thuật toán spaced repetition cơ bản

### 🔄 Real-time với WebSocket
- Cập nhật từ vựng real-time giữa các clients
- Thông báo khi có người dùng mới tham gia
- Đồng bộ dữ liệu tức thời

### 🎨 Giao diện
- Responsive design
- Dark/Light mode
- Animations mượt mà
- TailwindCSS styling
- Modern UI/UX

## 🏗️ Kiến trúc

### Backend (NestJS)
```
back/
├── src/
│   ├── entities/           # Database entities
│   ├── modules/
│   │   ├── auth/          # Authentication module
│   │   │   ├── repositories/
│   │   │   ├── services/  # Service classes (Hash, Token, Auth)
│   │   │   ├── strategies/
│   │   │   └── guards/
│   │   ├── vocabulary/    # Vocabulary management
│   │   │   ├── repositories/
│   │   │   ├── services/  # CRUD & Search services
│   │   │   └── dto/
│   │   ├── practice/      # Practice & statistics
│   │   └── websocket/     # WebSocket gateway
│   └── config/            # Database config
```

### Frontend (Vue 3 + TypeScript)
```
front/
├── src/
│   ├── views/             # Views với cấu trúc chuẩn
│   │   ├── Login/
│   │   │   ├── service/
│   │   │   ├── language/ (en, vi, ko)
│   │   │   ├── interface/
│   │   │   ├── composable/
│   │   │   │   ├── manager-state/
│   │   │   │   ├── manager-handle/
│   │   │   │   └── manager-mount/
│   │   │   └── LoginView.vue
│   │   ├── Register/      # Cấu trúc tương tự Login
│   │   ├── Vocabulary/    # Cấu trúc tương tự + component
│   │   └── Practice/      # Cấu trúc tương tự
│   ├── stores/            # Pinia stores
│   ├── services/          # API & WebSocket services
│   └── components/        # Reusable components
```

## 🚀 Cài đặt và Chạy

### Yêu cầu
- Node.js >= 20.19.0
- npm hoặc yarn

### Backend

1. Di chuyển vào thư mục backend:
```bash
cd back
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env (copy từ .env.example):
```bash
cp .env.example .env
```

4. Chạy development server:
```bash
npm run start:dev
```

Backend sẽ chạy tại: http://localhost:3000

### Frontend

1. Di chuyển vào thư mục frontend:
```bash
cd front
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env (copy từ .env.example):
```bash
cp .env.example .env
```

4. Chạy development server:
```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## 📝 Sử dụng

1. Truy cập http://localhost:5173
2. Đăng ký tài khoản mới
3. Đăng nhập vào hệ thống
4. Thêm từ vựng vào danh sách
5. Bắt đầu luyện tập!

## 🔧 Công nghệ sử dụng

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript
- **SQLite** - Lightweight database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Socket.io** - WebSocket implementation
- **class-validator** - Validation decorators

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Pinia** - State management
- **Vue Router** - Official router
- **Axios** - HTTP client
- **Socket.io-client** - WebSocket client
- **TailwindCSS** - Utility-first CSS framework
- **Vite** - Next generation frontend tooling

## 📦 Database Schema

### Users
- id (UUID)
- email (unique)
- password (hashed)
- fullName
- avatar
- totalScore
- totalWords
- timestamps

### Vocabularies
- id (UUID)
- word, pronunciation, meaning
- example, exampleTranslation
- difficulty (easy/medium/hard)
- masteryLevel (new/learning/familiar/mastered)
- correctCount, incorrectCount
- tags (array)
- userId (foreign key)
- lastReviewedAt, nextReviewAt
- timestamps

### Practice Histories
- id (UUID)
- userId, vocabularyId (foreign keys)
- practiceType (flashcard/multiple_choice/typing/listening)
- isCorrect
- userAnswer
- timeSpent, score
- timestamp

## 🌐 API Endpoints

### Auth
- POST /auth/register - Đăng ký
- POST /auth/login - Đăng nhập
- GET /auth/me - Lấy thông tin user (protected)

### Vocabulary
- GET /vocabulary - Lấy danh sách từ vựng
- GET /vocabulary/:id - Lấy chi tiết từ vựng
- POST /vocabulary - Tạo từ vựng mới
- PUT /vocabulary/:id - Cập nhật từ vựng
- DELETE /vocabulary/:id - Xóa từ vựng
- GET /vocabulary/practice?limit=10 - Lấy từ để luyện tập
- GET /vocabulary/tags?tags=... - Tìm theo tags

### Practice
- POST /practice/submit - Gửi kết quả luyện tập
- GET /practice/history - Lịch sử luyện tập
- GET /practice/statistics - Thống kê

## 🔌 WebSocket Events

### Client to Server
- vocabulary:created
- vocabulary:updated
- vocabulary:deleted
- practice:completed
- user:typing

### Server to Client
- user:connected
- user:disconnected
- vocabulary:created
- vocabulary:updated
- vocabulary:deleted
- practice:completed

## 🎯 Cấu trúc Code theo Quy tắc

### Backend
- Sử dụng **Repository Pattern**
- Chia nhỏ service thành các class con (CRUD, Search, etc.)
- Mỗi module có: controllers, services, repositories, dto, guards, strategies

### Frontend
- Mỗi view có cấu trúc chuẩn:
  - **service**: Business logic
  - **language**: i18n (en, vi, ko)
  - **interface**: TypeScript interfaces
  - **composable**: Logic tái sử dụng
    - manager-state: Quản lý state
    - manager-handle: Xử lý events
    - manager-mount: Lifecycle hooks
  - **component**: Components cục bộ

## 📄 License

MIT

## 👨‍💻 Tác giả

Được xây dựng với ❤️ bởi VocabMaster Team
