# CMS Admin — Thiết Bị Gia

**Trạng thái:** Phạm vi đã ghi nhận; nền tảng đã chọn.  
**Thư mục dự án:** D:\SE Code\profile_tgg

## Mục tiêu

Xây khu vực quản trị để cập nhật nội dung website mà không phải sửa mảng dữ liệu TypeScript hoặc triển khai lại mỗi lần đổi nội dung.

## Yêu cầu đã xác nhận

- Có đăng nhập admin và giao diện quản trị riêng.
- Quản lý thành viên: thêm, sửa hồ sơ và thông tin hiển thị trên trang cá nhân.
- Quản lý dự án: thêm, sửa, xóa; gắn một hoặc nhiều thành viên tham gia cùng vai trò của từng người.
- Quản lý nội dung trang chủ: chỉnh tiêu đề, lời giới thiệu và ảnh hoặc video giới thiệu nhóm.
- Ảnh do admin tải lên lưu bằng Cloudinary. Ảnh cấu hình cho thấy cloud name dx5szhyyt và chế độ dynamic folders.
- Dự án video MV nhận link YouTube; website hiển thị player phù hợp trong giao diện dự án.
- Nội dung được lưu bền vững; nền tảng triển khai đã chọn: Vercel + Supabase.

## Phạm vi CMS đề xuất từ yêu cầu “chỉnh sửa toàn bộ trang web”

- Cài đặt website: tên/nhãn, điều hướng, thông tin liên hệ, footer và SEO cơ bản.
- Trang About: câu chuyện nhóm và danh sách thiết bị.
- Thành viên: hồ sơ, ảnh đại diện, vai trò, gear và showcase.
- Dự án: thông tin, ảnh, YouTube URL, ghi chú hậu trường, gear và credits.
- Trang chủ: phần giới thiệu nhóm cùng media đang hiển thị.

## Lưu ý bảo mật và dữ liệu

- Cloudinary API secret chỉ được đọc từ biến môi trường phía server; không ghi vào source, .env.example, Git hoặc gửi xuống trình duyệt.
- Upload ảnh cần chữ ký tạo ở server; trình duyệt không được biết API secret.
- Link YouTube cần được chuẩn hóa/kiểm tra trước khi dùng làm embed URL.
- Hiện website lưu dữ liệu thành viên/dự án trong src/data/*.ts; chưa có cơ sở dữ liệu.
- API đặt lịch hiện chỉ ghi log cục bộ theo kiểu best-effort và có thể không tồn tại trên môi trường serverless.
- Supabase sẽ lưu nội dung website; Vercel giữ secrets trong environment variables.

## Giả định mặc định để triển khai

- Bản đầu dùng một tài khoản admin được xác thực qua Supabase Auth; có thể mở rộng thành nhiều admin.
- Nếu trang chủ dùng video, media được nhúng từ YouTube; ảnh dùng Cloudinary.
- Admin có thể quản lý cả gear, phần About, footer, điều hướng và SEO cơ bản để đáp ứng mục tiêu chỉnh sửa toàn bộ nội dung công khai.

## Việc cần cấu hình trước khi chạy CMS

- Tạo Supabase project và cài schema SQL trong thư mục supabase/migrations.
- Thiết lập biến môi trường Supabase và tạo tài khoản admin trong Supabase Auth.
- Thiết lập Cloudinary credentials bằng biến môi trường phía server; không đưa API secret vào Git hoặc chat.
- Thiết lập cùng các biến môi trường tương ứng trong Vercel khi deploy.

## Tiêu chí hoàn thành

- Admin đăng nhập được; người chưa đăng nhập không thể sửa nội dung hoặc gọi API ghi dữ liệu.
- CRUD thành viên và dự án, có thể gắn credits dự án với thành viên hiện có.
- Upload ảnh trả về asset Cloudinary và lưu URL/metadata vào Supabase.
- Cập nhật homepage intro, ảnh/video và nội dung công khai được hiển thị sau khi lưu.
- URL YouTube hợp lệ hiển thị player trong trang chi tiết dự án.
- Dữ liệu còn nguyên sau khi khởi động lại/deploy trên Vercel.

