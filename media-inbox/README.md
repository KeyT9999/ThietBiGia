# Hộp Thư Nạp Ảnh & Video Gốc — Thiết Bị Gia (`media-inbox/`)

Thư mục này dùng để lưu trữ file ảnh/video gốc chất lượng cao (RAW xuất JPG/PNG từ máy cơ) của **16 thành viên Thiết Bị Gia** trước khi nén đưa lên web.
> Toàn bộ file nặng trong `media-inbox/*` đã được cấu hình `.gitignore` để không làm nặng GitHub và máy chủ Vercel, chỉ đưa các bản tối ưu nhẹ (`~100–300 KB`) sang `public/media/`.

## Cách nạp thêm ảnh & Project cho thành viên bất kỳ

1. Tạo thư mục theo đúng `slug` của thành viên (ví dụ: `media-inbox/doan-phuoc-truong-hai/`, `media-inbox/khoa-anh/`, `media-inbox/tran-kim-thang/`...).
2. Thả ảnh chân dung và các thư mục con từng Project vào trong đó.
3. Chạy lệnh tại thư mục gốc dự án:
   ```bash
   npm run ingest:media
   ```
4. Script sẽ tự động:
   - Đọc thông số **EXIF thật từ thân máy & ống kính** (Body, Tiêu cự, Khẩu độ `f/`, Tốc độ màn trập, `ISO`).
   - Nén ảnh kích thước lớn xuống chuẩn WebGL sắc nét (`max 1680px`, dung lượng nhẹ ~120–250KB) vào `public/media/<slug>/`.
   - Xuất báo cáo JSON tại `media-inbox/ingest-report.json` để gắn nhanh vào `src/data/crew.ts` & `src/data/works.ts`.
