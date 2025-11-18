# API Guide - Backend NestJS với SQLite

## Cấu trúc thư mục (Chuẩn NestJS)

```
back/
├── src/
│   ├── config/              # Cấu hình (database, env, etc.)
│   │   └── database.config.ts
│   ├── controllers/         # Tất cả controllers
│   │   └── hello.controller.ts
│   ├── services/            # Tất cả services
│   │   └── hello.service.ts
│   ├── entities/            # TypeORM entities
│   ├── dto/                 # Data Transfer Objects
│   ├── modules/             # Feature modules (chỉ chứa module files)
│   │   └── hello/
│   │       └── hello.module.ts
│   ├── common/              # Shared resources
│   │   ├── dto/            # Common DTOs
│   │   ├── interfaces/     # TypeScript interfaces
│   │   ├── guards/         # Authentication guards
│   │   ├── interceptors/   # Request/Response interceptors
│   │   ├── decorators/     # Custom decorators
│   │   └── filters/        # Exception filters
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── database/               # SQLite database files
└── test/                   # Test files
```

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Các package chính đã được cài:
# - @nestjs/typeorm: TypeORM integration cho NestJS
# - typeorm: ORM cho TypeScript/JavaScript
# - better-sqlite3: SQLite driver
```

## Chạy ứng dụng

```bash
# Development mode với watch
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## API Endpoints

### Hello World APIs

#### 1. GET /hello
Trả về text đơn giản "Hello World!"

**Request:**
```bash
curl http://localhost:3000/hello
```

**Response:**
```
Hello World!
```

#### 2. GET /hello/world
Trả về JSON object với thông tin chi tiết

**Request:**
```bash
curl http://localhost:3000/hello/world
```

**Response:**
```json
{
  "message": "Hello World!",
  "timestamp": "2025-11-11T07:31:00.000Z",
  "status": "success"
}
```

## Database

- **Type:** SQLite (better-sqlite3)
- **Location:** `database/database.sqlite`
- **Auto-sync:** Enabled (chỉ dùng trong development)
- **Logging:** Enabled

## Thêm module mới

```bash
# Tạo module (trong folder modules)
nest g module modules/your-module

# Tạo controller (trong folder controllers)
nest g controller controllers/your-module --flat

# Tạo service (trong folder services)
nest g service services/your-module --flat

# Tạo entity (trong folder entities)
nest g class entities/your-entity.entity --no-spec

# Tạo DTO (trong folder dto)
nest g class dto/your-dto.dto --no-spec
```

**Lưu ý:** Sau khi tạo, cần cập nhật import paths trong module file để trỏ đúng đến controllers và services.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Ghi chú

- Database sẽ tự động tạo khi chạy lần đầu
- Synchronize mode đang bật (tự động sync schema) - chỉ dùng trong development
- Trong production nên sử dụng migrations thay vì synchronize
