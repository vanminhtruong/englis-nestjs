# Kế hoạch: Responsive toàn bộ front cho màn hình nhỏ (320–767px)

## Bối cảnh
- Vue 3 + Vite + Tailwind 3 (+ nhiều file dùng `<style scoped>` tự viết), 125 file .vue, 18 route.
- Mục tiêu: không còn tràn ngang, chữ/nút đủ lớn để bấm, modal vừa màn hình, lưới co theo cột, giữ nguyên giao diện desktop.
- Không có ảnh chụp để xem trực tiếp => kiểm thử bằng script đo tự động (puppeteer-core + Chrome sẵn có) ở 320/360/390/768px:
  tràn ngang (scrollWidth > innerWidth), phần tử vượt mép phải, nút/link < 32px, chữ < 12px.
- Dữ liệu thử: backend tạm (bản sao `dist`, DB trống riêng, cổng 3055) + Vite riêng cổng 5199. KHÔNG đụng DB/uploads thật, KHÔNG dùng token của người dùng thật.

## Các bước
- [ ] 1. Dựng môi trường kiểm thử (ngoài dự án, thư mục TEMP)
  - [ ] 1a. Backend tạm: thư mục có `dist`, junction `node_modules`, `database`/`uploads` trống, PORT=3055, CORS_ORIGINS=http://localhost:5199
  - [ ] 1b. Vite tạm cổng 5199 với VITE_API_URL=http://localhost:3055
  - [ ] 1c. Script seed: đăng ký user thử, tạo tab/category/tag/từ vựng (có ảnh), lịch sử luyện tập
  - [ ] 1d. Script đo `audit.mjs`: duyệt tất cả route x 4 độ rộng, xuất báo cáo JSON/text
- [ ] 2. Chạy audit lần 1 (baseline), lưu danh sách lỗi theo route/file
- [ ] 3. Nền tảng toàn cục
  - [ ] 3a. `index.html`: viewport-fit=cover, theme-color
  - [ ] 3b. `assets/base.css|main.css`: chống tràn ngang (`overflow-x: clip`), `min-width:0` cho flex con, ảnh/video `max-width:100%`, safe-area, `-webkit-text-size-adjust`
  - [ ] 3c. `tailwind.config.js`: thêm breakpoint `xs: 420px`
- [ ] 4. Khung chung
  - [ ] 4a. AppHeader + app-header/* (menu mobile, avatar, actions)
  - [ ] 4b. AppFooter, AuthLayout, BackToTop, AppToastContainer
- [ ] 5. Modal dùng chung -> vừa màn hình nhỏ (max-h dvh, cuộn trong, padding nhỏ, nút xếp dọc)
  - [ ] 5a. VocabularyDetailModal, AvatarZoomModal, VideoZoomModal, IPAPronunciationModal, WordDrawingModal, BackgroundPicker, CustomBackgroundsTab
  - [ ] 5b. Modal trong view: VocabularyModal, TabNameModal, VocabularyTabManagerModal, ProfileEditModal ...
- [ ] 6. Từng trang (theo kết quả audit)
  - [ ] 6a. Login / Register / LoginCallback
  - [ ] 6b. Home / About
  - [ ] 6c. Vocabulary (controls, filters, tabs, grid, list) + VocabularyByDate
  - [ ] 6d. Categories / Tags / Favorites / History
  - [ ] 6e. Practice (mode selection, session, games) / Srs
  - [ ] 6f. LearningProgress / Profile / VoiceSettings
- [ ] 7. Chạy audit lần 2 -> lặp lại bước 6 tới khi hết lỗi tràn ngang
- [ ] 8. Kiểm tra desktop không bị vỡ (audit ở 1280px: so sánh scrollWidth) + `vue-tsc` không phát sinh lỗi mới
- [ ] 9. Dọn dẹp môi trường tạm, commit + push phần front
