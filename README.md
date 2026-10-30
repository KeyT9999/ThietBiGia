# Thiết Bị Gia — Creative Media, Photography & Tech Collective

Website portfolio tập thể chính thức dành cho **16 thành viên Thiết Bị Gia** (Chụp ảnh, Quay phim & IT), xây dựng trên nền tảng **Next.js 15 + Three.js (`@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`) + GSAP + Lenis** theo chuẩn hiệu năng **Awwwards 3D Studio** (tham chiếu tại [`skill.md`](./skill.md)).

---

## Khởi chạy dự án

```bash
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:3000`.

---

## Điểm nhấn trải nghiệm & Kiến trúc kỹ thuật

1. **Trang chủ `/` — Vòng Cung Timeline 3D (16 Thẻ Thành Viên & 12 Dự Án Nhóm):**
   - Mặc định hiển thị **16 Thẻ Collector 3D** tương ứng với 16 thành viên Thiết Bị Gia (`#01` → `#16`), kết xuất bằng `CanvasTexture` độ phân giải cao hỗ trợ đầy đủ tiếng Việt có dấu, nhãn chuyên môn (`QUAY PHIM`, `CHỤP ẢNH`, `IT`), khung ngắm `AF-C`, thông số **Gear tủ** và mã vạch.
   - Chuyển đổi tức thì sang chế độ **Dự Án Nhóm** (mở màn bằng dự án tập thể *Đại Gia Đình Thiết Bị Gia* cùng các dự án thực tế).
   - Điều khiển bằng cuộn chuột, phím mũi tên hoặc kéo kim Playhead cam `#FF4D00` trên thước dựng phim **NLE Master Timeline** kèm âm thanh cơ học ống kính (Web Audio API).
2. **Hồ sơ cá nhân `/crew/[slug]` — Thẻ Đeo Vật Lý 3D & Bento Showcase:**
   - **Cột trái:** **Thẻ tác nghiệp Press Pass 3D** treo trên dây đeo vật lý thật (`@react-three/rapier` rope & spherical joints), phản quang ánh kim Holographic, nắm kéo đung đưa trực tiếp.
   - **Cột phải:** Lưới **Bento Showcase** tích hợp trình chiếu Slideshow & **Lightbox Album đa khung hình** không cắt cúp ảnh dọc/ngang, kèm danh sách chiến dịch nhóm và **Đồng đội cùng Ekip**.
   - Hỗ trợ cả **Intercepting Modal Overlay** khi nhấn từ Timeline lẫn URL riêng biệt để chia sẻ (ví dụ `/crew/tran-kim-thang`, `/crew/doan-phuoc-truong-hai`...).
3. **Đội ngũ `/crew` — Stop-Motion Group Hero & Bộ Lọc GSAP `Flip`:**
   - Mở đầu bằng khung ngắm **Stop-Motion 2-Frame** chụp tập thể bên bờ suối đá (tự động lặp hoặc nhấn nút **BẤM CHỤP** kèm chớp màn trập).
   - Lọc mượt 16 thành viên đa vai trò (*Chụp ảnh, Quay phim, IT*) hoặc tìm nhanh theo tên và thiết bị.
4. **Câu chuyện & Kho Thiết Bị `/about` + Đặt Lịch `/contact`:**
   - Tích hợp **Dải Cuộn Phim Nhựa 35mm Kodak Portra 400** trượt ngang theo cuộn trang (`GSAP ScrollTrigger`) lưu giữ kỷ niệm hành trình của nhóm, cùng danh mục **Gear Arsenal**.

---

## Cách thêm ảnh thành viên & dự án mới

- **Danh sách 16 thành viên & Bento cá nhân:** `src/data/crew.ts`
- **Danh sách dự án & chiến dịch:** `src/data/works.ts`
- **Cuộn phim kỷ niệm tập thể 35mm (`/about`):** `src/data/moments.ts`
- **Tài nguyên hình ảnh tối ưu WebGL:** `public/media/crew/`, `public/media/works/`, `public/media/keyt/`

### Album dự án từ Google Drive

- Ảnh bìa được tải riêng trong Admin và chỉ dùng làm ảnh chính của dự án.
- Đưa ảnh album trực tiếp vào một thư mục Google Drive, bật **Bất kỳ ai có đường liên kết → Người xem**, rồi dán link thư mục vào trường **Link thư mục ảnh Google Drive** trong Admin. Tên file `01-...`, `02-...` giúp giữ thứ tự mong muốn.
- Bật **Google Drive API** trong Google Cloud, tạo API key chỉ cho Drive API, rồi thêm biến môi trường server `GOOGLE_DRIVE_API_KEY` vào `.env.local` và Vercel. Không đặt key này thành biến `NEXT_PUBLIC_*`.
- Album được đọc từ thư mục Drive và hiển thị theo kiểu masonry, giữ tỷ lệ ảnh ngang/dọc. Danh sách file được cache tối đa một giờ; trình duyệt tải từng ảnh khi cuộn tới.
- Các album cũ đã tải lên vẫn được giữ làm phương án dự phòng. Khi có link Drive hợp lệ, album Drive sẽ được ưu tiên.
