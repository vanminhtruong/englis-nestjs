# Kế hoạch: Gửi dữ liệu (export) tới email người khác, người nhận Đồng ý / Từ chối

## Bối cảnh
- Dự án: VocabMaster (back: NestJS + TypeORM + better-sqlite3, front: Vue 3 + Pinia + vue-i18n en/vi/ko/zh-CN).
- Production chạy `NODE_ENV=production` => `synchronize=false` => BẮT BUỘC có migration và đăng ký trong `database.config.ts`.
- Yêu cầu: ở trang Profile, ngoài "Xuất dữ liệu" ra file xlsx còn có "Gửi tới email". Nhập email -> người nhận (phải có tài khoản) thấy hộp thoại Đồng ý / Từ chối. Đồng ý => dữ liệu được gộp vào tài khoản người nhận. Người gửi được báo kết quả.
- Quyết định (mặc định, không hỏi lại): snapshot dữ liệu lúc gửi (giống nội dung file export: từ vựng + lịch sử luyện tập), người nhận chưa có tài khoản => báo lỗi rõ ràng, từ đã có trùng `word` thì bỏ qua (không ghi đè dữ liệu người nhận), lời mời hết hạn sau 7 ngày, kèm email thông báo best-effort qua SMTP đã cấu hình.

## Kiến trúc / luồng
1. Sender: POST /data-share {email} -> tạo bản ghi `data_shares` (status=pending, payload JSON snapshot) -> emit WS `data-share:received` tới các socket của người nhận + gửi email thông báo (không chặn, lỗi thì bỏ qua).
2. Recipient: khi đăng nhập/mở app, GET /data-share/incoming lấy danh sách pending; đồng thời nghe WS `data-share:received` -> hiện modal toàn cục (Đồng ý / Từ chối).
3. Accept: POST /data-share/:id/accept -> trong 1 transaction: chuyển pending->accepted (có điều kiện), gộp dữ liệu, recalc totalWords -> emit WS `data-share:responded` cho sender + `vocabulary:bydate:refresh` cho recipient.
4. Reject: POST /data-share/:id/reject -> status=rejected -> emit `data-share:responded` cho sender.
5. Sender hủy: DELETE /data-share/:id (chỉ khi pending) -> cancelled -> emit `data-share:cancelled` cho recipient để đóng modal.

## BACKEND
- [ ] B1. `back/src/entities/data-share.entity.ts`: entity `DataShare` (id uuid, senderId, recipientId, recipientEmail, status pending|accepted|rejected|cancelled, payload text(JSON), vocabularyCount, historyCount, resultStats text null, createdAt, respondedAt null).
- [ ] B2. `back/src/migrations/1795500000000-CreateDataShares.ts`: tạo bảng `data_shares` + index (recipientId,status) và (senderId,status); idempotent (hasTable).
- [ ] B3. `database.config.ts`: đăng ký migration mới.
- [ ] B4. `websocket.gateway.ts`: thêm `emitToUser(userId, event, data)` gửi đúng socket của user (map socketId->userId), không broadcast.
- [ ] B5. `modules/data-share/dto/create-data-share.dto.ts`: `email` IsEmail, MaxLength(254), trim+lowercase.
- [ ] B6. `modules/data-share/services/data-share-mail.service.ts`: gửi mail thông báo best-effort (nodemailer, giống PasswordResetMailService), escape HTML tên người gửi.
- [ ] B7. `modules/data-share/services/data-share.service.ts`:
  - `create(senderId, email)`: tìm user theo email (không phân biệt hoa/thường) -> lỗi EMAIL_NOT_FOUND / CANNOT_SHARE_SELF; sender phải có >=1 từ (NO_DATA_TO_SHARE); chặn trùng pending cùng cặp (ALREADY_PENDING); tối đa 20 pending đang gửi (TOO_MANY_PENDING); dựng payload; lưu; emit WS; gửi mail.
  - `listIncoming(userId)`: pending, chưa hết hạn 7 ngày, kèm thông tin sender (fullName, email, avatar), số lượng; KHÔNG trả payload.
  - `accept(userId, id)`: kiểm tra quyền/hết hạn/đã xử lý; transaction: update có điều kiện + gộp từ vựng (bỏ qua trùng word) + gộp lịch sử (dedupe theo vocabularyId|practiceType|score|timeSpent) theo lô; lưu resultStats; recalc totalWords; emit WS.
  - `reject(userId, id)`, `cancel(userId, id)`.
- [ ] B8. `modules/data-share/data-share.controller.ts`: POST /data-share, GET /data-share/incoming, POST /data-share/:id/accept, POST /data-share/:id/reject, DELETE /data-share/:id; JwtAuthGuard.
- [ ] B9. `modules/data-share/data-share.module.ts` + đăng ký trong `app.module.ts`.
- [ ] B10. Test (jest): spec cho phần thuần (build payload / dedupe merge) hoặc service với sqlite in-memory nếu repo đã có mẫu.
- [ ] B11. `tsc --noEmit` + `nest build` sạch.

## FRONTEND
- [ ] F1. `services/api.service.ts`: thêm nhóm `dataShare` (send, incoming, accept, reject, cancel).
- [ ] F2. `services/websocket.service.ts`: thêm event `data-share:received`, `data-share:responded`, `data-share:cancelled`.
- [ ] F3. `components/data-share/language/*`: chuỗi en/vi/ko/zh-CN (khóa `dataShare`), gồm map mã lỗi.
- [ ] F4. `components/data-share/ShareDataModal.vue`: ô nhập email, validate, gửi, trạng thái loading, hiển thị lỗi theo mã.
- [ ] F5. `components/data-share/DataShareIncomingModal.vue`: modal toàn cục (người gửi, số từ/lịch sử, nút Đồng ý / Từ chối, xếp hàng nhiều lời mời), toast kết quả; lắng nghe WS; lấy danh sách khi đăng nhập + khi WS reconnect.
- [ ] F6. `ProfileHeader.vue`: thêm nút "Gửi tới email" -> emit `share`; `ProfileView.vue` mở `ShareDataModal`.
- [ ] F7. `layouts/DefaultLayout.vue`: mount `DataShareIncomingModal` (chỉ khi đã đăng nhập).
- [ ] F8. Người gửi nhận toast khi người nhận đồng ý/từ chối (WS `data-share:responded`).
- [ ] F9. `vue-tsc`/build front sạch.

## Edge case
- Email không tồn tại / chính mình / trùng lời mời / quá nhiều lời mời / hết hạn / đã xử lý (double click accept) / sender xóa hết từ / payload lớn (cap 5000 từ, 20000 lịch sử) / người nhận offline (xem lại khi đăng nhập) / nhiều tab.
- Bảo mật: chỉ recipient mới accept/reject, chỉ sender mới cancel; không trả payload ở danh sách; escape HTML trong email; không log dữ liệu.

## Kiểm thử
- Backend: script gọi API thật bằng 2 JWT (2 user local) -> create, incoming, accept, kiểm tra DB; reject; cancel; lỗi.
- Production: build + restart watchdog + test qua Funnel với Origin GitHub Pages.
