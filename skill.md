---
name: thiet-bi-gia-animation-webgl-skill
description: >-
  Tài liệu quy chuẩn bắt buộc về kiến trúc 3D WebGL, Smooth Scroll, Timeline Animation
  và Page Transitions cho dự án Portfolio Nhóm Thiết Bị Gia — tham chiếu trực tiếp tới
  kho mã nguồn cục bộ tại F:\Portfolio\Skill.
---

# Playbook Kỹ Thuật Animation & 3D WebGL — Portfolio Thiết Bị Gia

> **QUY TẮC BẮT BUỘC TRƯỚC KHI CODE (MANDATORY PRE-FLIGHT RULE):**
> Trước khi thiết kế hoặc viết code cho **bất kỳ** hiệu ứng chuyển động, cảnh 3D WebGL, shader, thanh cuộn mượt hay hiệu ứng chuyển trang nào trong dự án `PortfolioThietBiGia`, **BẮT BUỘC** phải:
> 1. Xác định rõ hiệu ứng đó thuộc nhóm kỹ thuật nào trong [`F:\Portfolio\Skill\SKILL.md`](file:///F:/Portfolio/Skill/SKILL.md).
> 2. Đọc trực tiếp file mã nguồn mẫu / công thức tương ứng trong `F:\Portfolio\Skill` (theo bảng ánh xạ bên dưới) để dùng đúng API chuẩn, đúng cách quản lý bộ nhớ GPU và đồng bộ khung hình.
> 3. Tuyệt đối không tự ý tạo nhiều `<Canvas>` rời rạc hoặc nhiều vòng lặp `requestAnimationFrame` chạy lệch nhịp nhau.

---

## 1. Kiến trúc Nền tảng Tham chiếu Chính

- **Công thức gốc:** [`F:\Portfolio\Skill\05-tech-stack-recipes\nextjs-r3f-awwwards-recipe.md`](file:///F:/Portfolio/Skill/05-tech-stack-recipes/nextjs-r3f-awwwards-recipe.md)
- **Chỉ mục tổng thể:** [`F:\Portfolio\Skill\SKILL.md`](file:///F:/Portfolio/Skill/SKILL.md)
- **Tài liệu hiệu năng R3F:** [`F:\Portfolio\Skill\01-3d-webgl\react-three-fiber\docs`](file:///F:/Portfolio/Skill/01-3d-webgl/react-three-fiber/docs)

---

## 2. Bản Đồ Ánh Xạ Tính Năng ⇄ Mã Nguồn Mẫu trong `F:\Portfolio\Skill`

### A. Trang chủ — "The Living Timeline" (Dải phim 3D & Thước Timeline Dựng Phim)

| Hạng mục hiệu ứng | Thư viện sử dụng | Đường dẫn mã nguồn mẫu bắt buộc tham chiếu trước khi code | Cách áp dụng vào Thiết Bị Gia |
| :--- | :--- | :--- | :--- |
| **Vòng cung / Dải thẻ dự án 3D (Curved 3D Cards)** | `@react-three/fiber`, `@react-three/drei` (`Image`), `maath` | `F:\Portfolio\Skill\04-portfolio-showcases\pmndrs-examples\examples\cards\src\App.tsx` & `...\cards-with-border-radius` | Xếp các dự án Photo / Quay / Dựng / Design trên cung tròn 3D, dùng `easing.damp3` để phóng nhẹ thẻ đang active/hover và nghiêng camera mượt theo con trỏ chuột. |
| **Thước Timeline NLE (Tick Marks & Scrubber Ruler)** | `@react-three/drei`, `gsap` (`Observer` / `Draggable`), `maath` | `F:\Portfolio\Skill\04-portfolio-showcases\pmndrs-examples\examples\horizontal-tiles\src\App.tsx` (`Minimap`) & `...\scrollcontrols-with-minimap\src\App.tsx` | Tạo dải vạch chia khung hình (`01..N` kèm Timecode `00:01:24:18`). Khi cuộn chuột hoặc kéo kim Playhead, các vạch lân cận nhô cao theo hàm hình sin (`curve`) + `easing.damp`. |
| **Phát Video Reel trên thẻ 3D khi Hover / Active** | `@react-three/drei` (`useVideoTexture`), `three` | `F:\Portfolio\Skill\04-portfolio-showcases\pmndrs-examples\examples\video-textures` & `...\ground-reflections-and-video-textures` | Mặc định hiển thị ảnh tĩnh WebP nhẹ cho toàn dải; chỉ gắn `VideoTexture` cho thẻ đang ở tâm điểm hoặc đang hover để giữ vững 60–120 FPS. |
| **Thẻ Credit Ekip nổi (Frosted-Glass Crew Pills)** | `@react-three/drei` (`Html`) + `motion/react` | `F:\Portfolio\Skill\04-portfolio-showcases\pmndrs-examples\examples\html-annotations` & `...\mixing-html-and-webgl` | Hiển thị nhóm thẻ kính mờ (`Photographer`, `DOP`, `Editor`, `Design`, `+N Crew`) bám theo dự án đang chọn; click vào tên ai mở thẳng sang Hồ sơ cá nhân người đó. |
| **Hậu kỳ ống kính điện ảnh (Subtle Lens Feel)** | `@react-three/postprocessing` | `F:\Portfolio\Skill\04-portfolio-showcases\pmndrs-examples\examples\chromatic-aberration`, `...\vignette`, `...\lens-distortion` | Áp hiệu ứng quang sai nhẹ ở rìa khung hình khi vuốt nhanh timeline (scroll velocity) tạo cảm giác ống kính máy quay thật. |

---

### B. Hồ sơ Cá nhân — "Hybrid Member Spotlight" (`/crew/[slug]` — Thẻ Đeo 3D + Bento)

| Hạng mục hiệu ứng | Thư viện sử dụng | Đường dẫn mã nguồn mẫu bắt buộc tham chiếu trước khi code | Cách áp dụng vào Thiết Bị Gia |
| :--- | :--- | :--- | :--- |
| **Thẻ Tác Nghiệp 3D có Dây Đeo Vật Lý (3D Press Pass Lanyard)** | `@react-three/fiber`, `@react-three/drei` (`RenderTexture`, `Environment`), `@react-three/rapier`, `meshline` | `F:\Portfolio\Skill\04-portfolio-showcases\pmndrs-examples\examples\rapier-physics`, `...\bezier-curves-and-nodes`, `...\drei-rendertexture`, `...\iridescent-decals` | Mô phỏng dây đeo và thẻ cứng bằng khớp vật lý; cho phép người xem nắm kéo/thả thẻ đung đưa. Mặt thẻ dùng `<RenderTexture>` + lớp phủ ánh kim holographic hiển thị ảnh chân dung, vai trò (*Photographer / Quay phim / Dựng phim / Design*), mã vạch và "Gear tủ". |
| **Nhúng khung 3D vào bố cục 2 cột mà không tạo `<Canvas>` thứ 2** | `@react-three/drei` (`View`, `View.Port`) | `F:\Portfolio\Skill\01-3d-webgl\drei\src\web\View.tsx` & `F:\Portfolio\Skill\04-portfolio-showcases\pmndrs-examples\examples\view-tracking` | Cột trái đặt thẻ `<View className="h-full w-full">` ánh xạ thẳng vào `<Canvas>` cố định ở Root Layout — mở/đóng overlay hồ sơ cực mượt, không re-init WebGL. |
| **Mở Overlay Intercepting Route mượt không mất vị trí Timeline** | `motion/react` (`AnimatePresence`, `layoutId`) + Next.js App Router (`@modal/(.)crew/[slug]`) | `F:\Portfolio\Skill\03-page-transitions\motion\packages\framer-motion` & `F:\Portfolio\Skill\04-portfolio-showcases\pmndrs-examples\examples\router-transitions` | Đang xem Timeline bấm vào thành viên thì trượt mở Overlay toàn màn hình nhưng URL vẫn đổi thành `/crew/[slug]`; đóng lại quay về đúng giây đang dừng trên Timeline. |
| **Chữ chạy giải mã thông số máy & Timecode** | Custom Hook / GSAP Text | `F:\Portfolio\Skill\04-portfolio-showcases\hamishmw-portfolio\app\components\decoder-text` | Hiệu ứng nhảy ký tự kiểu màn hình máy ảnh (`SONY FX3 • 24-70 GM II • DAVINCI RESOLVE`) khi mở hồ sơ thành viên. |

---

### C. Trang Danh sách Thành viên — "CREW Directory" (Quản lý nhóm đông người)

| Hạng mục hiệu ứng | Thư viện sử dụng | Đường dẫn mã nguồn mẫu bắt buộc tham chiếu trước khi code | Cách áp dụng vào Thiết Bị Gia |
| :--- | :--- | :--- | :--- |
| **Bộ lọc đội ngũ đông thành viên mượt tuyệt đối** | `gsap` (`Flip`) | `F:\Portfolio\Skill\02-scroll-animation\gsap\src\Flip.js` | Khi lọc giữa *Tất cả / Photographer / Quay video / Dựng video / Design*, ghi lại trạng thái bằng `Flip.getState()` rồi animate sang bố cục mới mượt như nước. |
| **Cuộn mượt đồng bộ toàn trang & Bento** | `lenis/react` (`ReactLenis`) + `gsap` (`ScrollTrigger`) | `F:\Portfolio\Skill\02-scroll-animation\lenis\packages\react` & `F:\Portfolio\Skill\02-scroll-animation\gsap\src\ScrollTrigger.js` | Cuộn mượt cho trang danh sách thành viên và cột phải Bento Showcase bên trong hồ sơ cá nhân. |

---

## 3. Năm Nguyên Tắc Kỹ Thuật Bất Di Bất Dịch (Non-Negotiables)

1. **Một vòng lặp thời gian duy nhất (Single RAF Ticker):**
   - Khởi tạo `<ReactLenis root options={{ autoRaf: false, lerp: 0.08, smoothWheel: true }}>`.
   - Gắn `lenis.raf(time * 1000)` trực tiếp vào `gsap.ticker.add(...)` kèm `gsap.ticker.lagSmoothing(0)` đúng chuẩn file `nextjs-r3f-awwwards-recipe.md`.
2. **Duy nhất một Persistent `<Canvas>` ở Root Layout:**
   - Đặt `<Canvas dpr={[1, 2]} eventSource={document.body} eventPrefix="client">` cố định (`fixed inset-0 pointer-events-none z-0`) cùng `<View.Port />`.
   - Không bao giờ unmount/remount `<Canvas>` khi chuyển giữa Trang chủ Timeline, Trang Crew và Overlay Hồ sơ cá nhân.
3. **Không `setState` trong `useFrame`:**
   - Trong React Three Fiber, mọi biến đổi theo từng khung hình (vị trí thẻ 3D, độ nghiêng thẻ Press Pass, vạch thước timeline, vị trí con trỏ) phải thao tác trực tiếp qua `ref` (`meshRef.current.position`, `material.uniforms`) kết hợp `maath/easing.damp*` có truyền `delta`.
4. **Quản trị bộ nhớ GPU & Video cho nhóm đông thành viên:**
   - Dispose geometry/material/texture đúng chuẩn khi không dùng; nén ảnh thành viên và dự án sang `WebP/AVIF`; giới hạn số lượng luồng `<video>` đang giải mã đồng thời tối đa `1–2` video đang hiện diện ở tâm điểm.
5. **Tương thích Mobile & Thiết bị yếu:**
   - Kiểm tra kích thước màn hình và năng lực GPU (`useDetectGPU` từ `@react-three/drei` hoặc media query) để giảm `dpr`, tắt post-processing nặng trên điện thoại và hỗ trợ vuốt cảm ứng mượt trên cả Timeline lẫn Thẻ 3D.

---

## 4. Checklist Tự Kiểm Tra Trước Khi Code Mỗi Component Mới

Trước khi tạo bất kỳ file animation/3D nào trong `src/`, hãy trả lời nhanh 4 câu sau:
- [ ] Đã đọc file mẫu tương ứng trong `F:\Portfolio\Skill` chưa?
- [ ] Component này chạy trên DOM (`GSAP` / `Motion`) hay trên WebGL (`R3F View`), và đã dùng chung `Single Ticker` / `Persistent Canvas` chưa?
- [ ] Có lệnh `useState` nào bị gọi liên tục 60 lần/giây trong `useFrame` hay `onScroll` không? *(Nếu có → chuyển ngay sang `useRef` + `damp` hoặc `gsap.quickTo`)*.
- [ ] Khi danh sách lên tới 30–50+ thành viên hoặc 20+ dự án video, giải pháp lazy-load / chỉ render vùng nhìn thấy đã được đảm bảo chưa?

