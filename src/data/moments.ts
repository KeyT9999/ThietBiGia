export interface GroupMoment {
  id: string;
  frameCode: string;
  src: string;
  title: string;
  caption: string;
  location: string;
  filmStock: string;
  dateLabel: string;
}

/**
 * Kho lưu trữ ảnh tập thể & kỷ niệm hành trình của Thiết Bị Gia.
 * Khi có thêm ảnh chung mới trong thư mục `public/`, chỉ cần thêm 1 dòng vào mảng này
 * là tự động xuất hiện trên Cuộn Phim 35mm (/about) và Bộ sưu tập nhóm!
 */
export const GROUP_MOMENTS: GroupMoment[] = [
  {
    id: "tbg-moment-01a",
    frameCode: "► 01A",
    src: "/anhchungtbg.jpg",
    title: "Bình Minh Bên Suối Đá — Sẵn Sàng Bấm Máy",
    caption: "Anh em Thiết Bị Gia giơ máy ngắm thẳng về phía ống kính giữa thung lũng sương sớm.",
    location: "Suối Đá & Đồi Núi Ngoại Ô",
    filmStock: "KODAK PORTRA 400 • 35MM",
    dateLabel: "FIELD TRIP TBG",
  },
  {
    id: "tbg-moment-01b",
    frameCode: "► 02A",
    src: "/anhchungtbg2.jpg",
    title: "Hướng Về Bầu Trời Mới — Cú Nhảy Stop-Motion",
    caption: "Cùng một góc chân máy cố định, cả đội đồng loạt đổi tư thế chỉ tay hướng lên bầu trời.",
    location: "Suối Đá & Đồi Núi Ngoại Ô",
    filmStock: "KODAK PORTRA 400 • 35MM",
    dateLabel: "FIELD TRIP TBG",
  },
  {
    id: "tbg-moment-02",
    frameCode: "► 03A",
    src: "/media/works/work-01.jpg",
    title: "Đêm Set Đèn Studio — Chạm Ánh Sáng",
    caption: "Tổ Quay phim và Nhiếp ảnh phối hợp cân chỉnh ánh sáng trước giờ bấm máy chính thức.",
    location: "TBG Studio",
    filmStock: "CINESTILL 800T",
    dateLabel: "STUDIO SET",
  },
  {
    id: "tbg-moment-03",
    frameCode: "► 04A",
    src: "/media/keyt/pkl-03.jpg",
    title: "Tác Nghiệp Sân Khấu Live — Phùng Khánh Linh",
    caption: "Khoảnh khắc bắt trọn ca sĩ trên sân khấu lớn cùng tay máy tác nghiệp trực tiếp dưới ánh đèn LED.",
    location: "Live Concert Stage • Photo by KeyT",
    filmStock: "SONY ALPHA • STAGE TELEPHOTO",
    dateLabel: "LIVE COVERAGE",
  },
  {
    id: "tbg-moment-04",
    frameCode: "► 05A",
    src: "/media/keyt/danaff-03.jpg",
    title: "Thảm Đỏ Liên Hoan Phim Châu Á (DANAFF)",
    caption: "Tác nghiệp báo chí & nhiếp ảnh thảm đỏ sự kiện điện ảnh quốc tế tại Đà Nẵng.",
    location: "Đà Nẵng • Photo by KeyT",
    filmStock: "FULL-FRAME FLASH & AMBIENT",
    dateLabel: "RED CARPET",
  },
];

