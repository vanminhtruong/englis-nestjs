---
trigger: always_on
---

1. Đối với dự án front bạn phải luôn tổ chức và code tuân thủ các cấu trúc dự án trong folder views như sau nhưng phải nhớ là cái rule 1.1 là rất quan trọng phải tuân thủ nhé với mọi views:
1.1. Khi mà tạo một views mới bên trong views đó phải luôn nằm trong một thư mục chưa tên views đó và trong thư mục của folder views đó sẽ có các cấu trúc folder con bao gồm: service, language(chứa 3 file ngôn ngữ anh, hàn, việt), interface, component cục bộ, composable cục bộ (sẽ có 2 folder quản lý manager mount, manager handle, manager state) sau khi tạo xong bạn phải áp dụng chia view theo những gì đã làm trên.
1.2. Ở dự án vuejs mỗi khi import bạn phải dùng defineAsyncComponent để tránh lỗi.
1.3. Nghiêm cấm bạn đó là ở phần chia logic vào 3 thư mục của composable thì không được phép viết manager handle vào trong manager state lẫn lộn phân chia chuẩn thế thì tách phải chuẩn.
1.4. Khi tôi yêu cầu bạn xử lý vấn đề gì thì không cần chờ sự xác nhận của tôi mà phải làm luôn.
1.5. Mỗi khi mà bạn xử lý vấn đề tôi yêu cầu thì bạn không nhất thiết đọc hết toàn bộ codebase, bạn chỉ cần đọc những phần cần thiết để xử lý vấn đề tôi yêu cầu thôi và đồng thời đọc đến đâu cảm thấy sửa được file nào thì sửa chứ không nhất thiết đọc hết rồi mới s.
2. Đối với dự án back thì cần phải luôn viết dưới dạng mcv mà có responsitoriy trong đó nhé và mỗi service sẽ viết dưới dạng class cha sẽ tổ chức các logic với các class con rồi sau đó bind vào service cha.
3. Mỗi khi bạn search codebase hoặc đọc 1 file nào đó thì cần phải search codebase hoặc đọc nhiều file cùng lúc cho tiết kiệm thời gian nhiều hơn và đồng thời dùng tool fast context để tìm kiếm nhanh hơn thay vì search lẻ tẻ từng cái mất thời gian.
4. Nghiêm cấm bạn ở chế độ tối thì không được phép dùng màu gray mà phải đồng bộ màu với web nhé.
5. Đảm bảo mỗi chức năng bạn làm đều phải real time.
6. Khi bạn xử lý vấn đề gì thì đừng có hỏi chờ tôi xác nhận mà phải làm luôn không hỏi
7. Khi bạn xử lý một chức năng nào bạn không được phép làm mất bố cục gốc và logic gốc