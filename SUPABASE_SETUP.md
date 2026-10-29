# Thiết Bị Gia CMS setup

CMS dùng Supabase Auth để đăng nhập, một bản ghi JSONB trong Supabase để lưu nội dung, và Cloudinary để nhận ảnh tải lên. API secret chỉ được dùng phía server.

## 1. Tạo project Supabase

Trong Supabase, tạo project mới rồi mở **Project Settings → API**. Lấy Project URL, anon/publishable key và service role/secret key.

## 2. Tạo bảng nội dung

Mở **SQL Editor** trong Supabase, chạy toàn bộ nội dung file `supabase/migrations/202610300001_site_content.sql`. Bảng cho phép khách truy cập đọc nội dung công khai; chỉ server dùng service role mới được ghi.

## 2a. Tạo tài khoản đăng nhập member

Chạy thêm file `supabase/migrations/202610300002_member_accounts.sql` trong **SQL Editor**. Member đăng nhập bằng username và mật khẩu do admin cấp tại `/member/login`; đây là luồng đăng nhập riêng của website, không tạo user trong Supabase Auth. Mật khẩu được băm trước khi lưu. Mật khẩu mặc định khi tạo member là `123`; member có thể đổi sau khi đăng nhập, với mật khẩu mới tối thiểu 6 ký tự. Admin có thể đặt lại mật khẩu nhưng không xem được mật khẩu hiện tại.

## 3. Tạo tài khoản admin

Trong **Authentication → Users**, tạo người dùng admin bằng email và mật khẩu mạnh. Tắt đăng ký công khai nếu project không cần người dùng đăng ký. Email admin phải được khai báo trong `ADMIN_EMAILS`.

## 4. Cấu hình local

Tạo file `.env.local` ở thư mục dự án từ `.env.example`, rồi điền:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MEMBER_SESSION_SECRET` (tùy chọn; nếu để trống, website dùng server-only Supabase secret để ký cookie member)
- `ADMIN_EMAILS` — email được phép quản trị
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Không đưa service role key hoặc Cloudinary API secret vào Git hay biến `NEXT_PUBLIC_*`. Khởi động lại server sau khi sửa biến môi trường.

## 5. Cấu hình Vercel

Thêm cùng các biến môi trường trong **Vercel → Project Settings → Environment Variables** cho Production, Preview và Development phù hợp. Sau đó deploy lại.

## 6. Mở CMS

Vào `/admin/login`, đăng nhập bằng user đã tạo ở bước 3. Bảng nội dung đầu tiên được tạo trong Supabase khi bấm **Lưu thay đổi**. Website dùng dữ liệu mẫu hiện có cho đến lần lưu đầu tiên.

## Ghi chú

- Video dự án và video giới thiệu trang chủ dùng link YouTube; API chuyển link hợp lệ sang embed URL bảo mật.
- Ảnh được upload trực tiếp từ trình duyệt lên Cloudinary bằng chữ ký do server tạo. API secret không gửi xuống trình duyệt.
- Bản CMS ban đầu có một danh sách email admin; có thể thêm nhiều email trong `ADMIN_EMAILS`.
