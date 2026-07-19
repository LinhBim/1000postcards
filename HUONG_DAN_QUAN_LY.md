# 📚 HƯỚNG DẪN QUẢN LÝ WEBSITE POSTCARDS CỦA BẠN

Bí kíp này được tạo ra để bạn luôn làm chủ được website của mình, dù là 1 năm hay 10 năm nữa mà không cần phải nhớ những dòng code phức tạp!

---

## CÁC LỆNH QUAN TRỌNG (Mở Terminal trong VS Code và gõ)

### 1. Xem Website (Chạy Server)
Khi bạn mới bật máy lên và muốn xem website của mình đang chạy như thế nào:
👉 **Lệnh:** `npm run dev`
*(Sau khi gõ, mở trình duyệt vào link: http://localhost:3000)*

### 2. Cập nhật Tags từ Google Sheets
Sau khi bạn đã tự vào Google Sheets sửa tên Tag, sửa Tiêu đề, và muốn web cập nhật theo:
👉 **Lệnh:** `npm run sync`
*(Web sẽ tự động kết nối với Google Sheets, tải dữ liệu mới nhất về và cập nhật vào hàng trăm bài viết trong chưa tới 1 giây).*

### 3. Thêm một rổ Postcards mới
Khi bạn đi du lịch về và có thêm một lô ảnh Postcards mới:
1. Thả toàn bộ ảnh mới đó vào thư mục `incoming_postcards` ở trong mã nguồn.
2. Gõ lệnh: `npm run import`
3. Hệ thống sẽ: 
   - Tự sắp xếp ảnh vào đúng chỗ.
   - Tự tạo các file bài viết nháp.
   - Tự xuất ra một file Excel tên là `postcards_database.csv`.
4. Mở file `postcards_database.csv` đó lên, copy các dòng dữ liệu mới và dán nối tiếp vào Google Sheets của bạn. (Thế là xong!)

---

## 🔗 LINK QUAN TRỌNG
- **Google Sheets Quản Lý:** [Bảng tính Postcards Database của bạn](https://docs.google.com/spreadsheets/d/1R8CQNzqdARHzTm1oS7aCFAt0sFTGoRWX/edit) (Hãy lưu bookmark link này vào trình duyệt).

---

## 🛠 NẾU CÓ LỖI XẢY RA THÌ SAO?
Đừng hoảng! Hệ thống được thiết kế để không bao giờ ghi đè lên những bài viết (file markdown) mà bạn ĐÃ TỰ TAY VIẾT TEXT. Bất kỳ sự tự động hóa nào cũng chỉ chạy ngầm với những bài rỗng (placeholder). Nếu có gì khó khăn, cứ vứt cả thư mục này lại cho một AI trợ lý (như Antigravity hoặc ChatGPT), gửi cho họ file này, họ sẽ lập tức hiểu toàn bộ cấu trúc và sửa lỗi giúp bạn!
