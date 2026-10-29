export type GroupMomentCategory = "dai-gia-dinh" | "hau-truong" | "doi-thuong";

export interface GroupMoment {
  id: string;
  frameCode: string;
  src: string;
  title: string;
  caption: string;
  location: string;
  filmStock: string;
  dateLabel: string;
  category: GroupMomentCategory;
  onFilmStrip?: boolean;
  detectedFaceCount?: number;
  memberSlugs?: string[];
  memberNames?: string[];
}

export const GROUP_CATEGORY_META: Record<
  GroupMomentCategory,
  { label: string; shortLabel: string; accent: string }
> = {
  "dai-gia-dinh": {
    label: "Đại Gia Đình Đông Đủ",
    shortLabel: "ĐẠI GIA ĐÌNH",
    accent: "#FF4D00",
  },
  "hau-truong": {
    label: "Hậu Trường Tác Nghiệp",
    shortLabel: "HẬU TRƯỜNG SET",
    accent: "#00E5FF",
  },
  "doi-thuong": {
    label: "Dã Ngoại & Đời Thường",
    shortLabel: "DÃ NGOẠI & ANH EM",
    accent: "#F59E0B",
  },
};

/**
 * Kho lưu trữ 36 ảnh tập thể & kỷ niệm hành trình của Thiết Bị Gia (trích xuất từ Ảnh Nhóm TBG).
 * Hiển thị trực tiếp trên Trang Giới Thiệu (/about): Cuộn Phim 35mm + Bức Tường Kỷ Niệm Tập Thể.
 */
export const GROUP_MOMENTS: GroupMoment[] = [
  {
    "id": "tbg-moment-01",
    "frameCode": "► 01A",
    "src": "/anhchungtbg.jpg",
    "title": "Bình Minh Bên Suối Đá — Sẵn Sàng Bấm Máy",
    "caption": "Anh em Thiết Bị Gia giơ máy ngắm thẳng về phía ống kính giữa thung lũng sương sớm.",
    "location": "Suối Đá & Đồi Núi Ngoại Ô",
    "filmStock": "KODAK PORTRA 400 • 35MM",
    "dateLabel": "FIELD TRIP TBG",
    "category": "dai-gia-dinh",
    "onFilmStrip": true,
    "detectedFaceCount": 16,
    "memberSlugs": [
      "doan-phuoc-truong-hai",
      "tran-kim-thang",
      "tai-anh",
      "nam-trung-dao",
      "le-quang-vu",
      "nguyen-pham-viet-thong",
      "tan-loc",
      "quoc-hi"
    ],
    "memberNames": [
      "Đoàn Phước Trường Hải",
      "Trần Kim Thắng",
      "Tài Anh",
      "Nam Trung Đào",
      "Lê Quang Vũ",
      "Viết Thông",
      "Tấn lộc",
      "Quốc Hi"
    ]
  },
  {
    "id": "tbg-moment-02",
    "frameCode": "► 02A",
    "src": "/anhchungtbg2.jpg",
    "title": "Hướng Về Bầu Trời Mới — Cú Nhảy Stop-Motion",
    "caption": "Cùng một góc chân máy cố định, cả đội đồng loạt đổi tư thế chỉ tay hướng lên bầu trời.",
    "location": "Suối Đá & Đồi Núi Ngoại Ô",
    "filmStock": "KODAK PORTRA 400 • 35MM",
    "dateLabel": "FIELD TRIP TBG",
    "category": "dai-gia-dinh",
    "onFilmStrip": true,
    "detectedFaceCount": 16,
    "memberSlugs": [
      "doan-phuoc-truong-hai",
      "tran-kim-thang",
      "tai-anh",
      "nam-trung-dao",
      "le-quang-vu",
      "nguyen-pham-viet-thong",
      "tan-loc",
      "quoc-hi"
    ],
    "memberNames": [
      "Đoàn Phước Trường Hải",
      "Trần Kim Thắng",
      "Tài Anh",
      "Nam Trung Đào",
      "Lê Quang Vũ",
      "Viết Thông",
      "Tấn lộc",
      "Quốc Hi"
    ]
  },
  {
    "id": "tbg-moment-03",
    "frameCode": "► 03A",
    "src": "/media/group/tbg-group-01.jpg",
    "title": "Đại Gia Đình Thiết Bị Gia FUDA Trên Đồi Hoàng Hôn",
    "caption": "Hơn 30 anh chị em thành viên tập hợp đầy đủ giữa sườn đồi ngập nắng chiều vàng rực.",
    "location": "Đồi Hoàng Hôn • Đà Nẵng",
    "filmStock": "KODAK PORTRA 400 • 35MM",
    "dateLabel": "FUDA COLLECTIVE",
    "category": "dai-gia-dinh",
    "onFilmStrip": true,
    "detectedFaceCount": 30,
    "memberSlugs": [
      "tai-anh",
      "le-quang-vu"
    ],
    "memberNames": [
      "Tài Anh",
      "Tân Lý",
      "Lê Quang Vũ"
    ]
  },
  {
    "id": "tbg-moment-04",
    "frameCode": "► 04A",
    "src": "/media/group/tbg-group-02.jpg",
    "title": "Đêm Hội Quân Áo Đen Thiết Bị Gia",
    "caption": "Đội hình 15 anh em trong màu áo đen đặc trưng cùng nở nụ cười rạng rỡ dưới ánh đèn dây ấm áp.",
    "location": "Đêm Hội Quân TBG",
    "filmStock": "KODAK PORTRA 400 • 35MM",
    "dateLabel": "FULL SQUAD",
    "category": "dai-gia-dinh",
    "onFilmStrip": true,
    "detectedFaceCount": 15,
    "memberSlugs": [
      "tran-kim-thang",
      "tai-anh",
      "nam-trung-dao",
      "quoc-hi",
      "nguyen-pham-viet-thong",
      "doan-phuoc-truong-hai"
    ],
    "memberNames": [
      "Trần Kim Thắng",
      "Tài Anh",
      "Phan Hiển",
      "Nam Trung Đào",
      "Quốc Hi",
      "An",
      "Viết Thông",
      "Đoàn Phước Trường Hải",
      "Phan Anh Lực",
      "Tân Lý",
      "Ân"
    ]
  },
  {
    "id": "tbg-moment-05",
    "frameCode": "► 05A",
    "src": "/media/group/tbg-group-03.jpg",
    "title": "Buổi Sinh Hoạt & Ra Quân CLB Thiết Bị Gia",
    "caption": "Khoảnh khắc 20 thành viên quây quần trong phòng họp chuẩn bị cho chuỗi dự án lớn của học kỳ.",
    "location": "FUDA Campus Room",
    "filmStock": "KODAK PORTRA 400 • 35MM",
    "dateLabel": "CLUB MEETING",
    "category": "dai-gia-dinh",
    "onFilmStrip": true,
    "detectedFaceCount": 20,
    "memberSlugs": [
      "doan-phuoc-truong-hai",
      "mai-nhat-thanh",
      "tran-kim-thang"
    ],
    "memberNames": [
      "Đoàn Phước Trường Hải",
      "Mai Nhất Thành",
      "Trần Kim Thắng"
    ]
  },
  {
    "id": "tbg-moment-06",
    "frameCode": "► 06A",
    "src": "/media/group/tbg-group-04.jpg",
    "title": "Hành Trình Thiện Nguyện Giữa Núi Rừng Vùng Cao",
    "caption": "Đại gia đình hơn 35 thành viên và tình nguyện viên căng băng rôn kỷ niệm giữa thung lũng xanh.",
    "location": "Chuyến Đi Thiện Nguyện",
    "filmStock": "KODAK PORTRA 400 • 35MM",
    "dateLabel": "CHARITY TRIP",
    "category": "dai-gia-dinh",
    "onFilmStrip": true,
    "detectedFaceCount": 36,
    "memberSlugs": [
      "nguyen-pham-viet-thong"
    ],
    "memberNames": [
      "Viết Thông"
    ]
  },
  {
    "id": "tbg-moment-07",
    "frameCode": "► 07A",
    "src": "/media/group/tbg-group-05.jpg",
    "title": "Đêm Lửa Trại & Gắn Kết 'Hổ Danh Mười'",
    "caption": "Góc máy cao ghi trọn tinh thần bùng nổ của 18 thành viên trong đêm hội trại đáng nhớ.",
    "location": "Hội Trại Hổ Danh Mười",
    "filmStock": "KODAK PORTRA 400 • 35MM",
    "dateLabel": "CAMP NIGHT",
    "category": "dai-gia-dinh",
    "onFilmStrip": true,
    "detectedFaceCount": 18,
    "memberSlugs": [],
    "memberNames": [
      "Phan Anh Lực",
      "Phan Hiển"
    ]
  },
  {
    "id": "tbg-moment-08",
    "frameCode": "► 08A",
    "src": "/media/group/tbg-group-06.jpg",
    "title": "Vinh Danh & Trao Chứng Nhận Giữa Thung Lũng Xanh",
    "caption": "13 thành viên cùng giơ cao tấm bằng ghi nhận chặng đường cống hiến hết mình cùng tập thể.",
    "location": "Thung Lũng Xanh",
    "filmStock": "KODAK PORTRA 400 • 35MM",
    "dateLabel": "MILESTONE",
    "category": "dai-gia-dinh",
    "onFilmStrip": false,
    "detectedFaceCount": 13,
    "memberSlugs": [
      "doan-phuoc-truong-hai",
      "nguyen-pham-viet-thong",
      "tran-kim-thang",
      "quoc-hi",
      "le-quang-vu"
    ],
    "memberNames": [
      "Đoàn Phước Trường Hải",
      "Viết Thông",
      "Trần Kim Thắng",
      "Quốc Hi",
      "Lê Quang Vũ"
    ]
  },
  {
    "id": "tbg-moment-09",
    "frameCode": "► 09A",
    "src": "/media/group/tbg-group-07.jpg",
    "title": "Sắc Màu Sân Khấu Lễ Hội Ngoài Trời",
    "caption": "Anh em Thiết Bị Gia lưu lại khoảnh khắc rực rỡ ngay trên sân khấu sau giờ bấm máy.",
    "location": "Sân Khấu Lễ Hội",
    "filmStock": "KODAK PORTRA 400 • 35MM",
    "dateLabel": "FESTIVAL SET",
    "category": "dai-gia-dinh",
    "onFilmStrip": true,
    "detectedFaceCount": 13,
    "memberSlugs": [
      "doan-phuoc-truong-hai",
      "mai-nhat-thanh",
      "tan-loc",
      "nam-trung-dao",
      "le-quang-vu",
      "nguyen-pham-viet-thong",
      "tai-anh",
      "tran-kim-thang"
    ],
    "memberNames": [
      "Đoàn Phước Trường Hải",
      "Mai Nhất Thành",
      "Tấn lộc",
      "Nam Trung Đào",
      "Lê Quang Vũ",
      "Viết Thông",
      "Tài Anh",
      "Phan Hiển",
      "Trần Kim Thắng"
    ]
  },
  {
    "id": "tbg-moment-10",
    "frameCode": "► 10A",
    "src": "/media/group/tbg-group-08.jpg",
    "title": "Đội Hình Đêm Thành Phố — Street Lookbook",
    "caption": "10 anh em lên đồ cực chất giữa ánh đèn đô thị về đêm sau ca quay muộn.",
    "location": "Đà Nẵng By Night",
    "filmStock": "KODAK PORTRA 400 • 35MM",
    "dateLabel": "NIGHT SQUAD",
    "category": "dai-gia-dinh",
    "onFilmStrip": false,
    "detectedFaceCount": 10,
    "memberSlugs": [
      "doan-phuoc-truong-hai",
      "tai-anh"
    ],
    "memberNames": [
      "Đoàn Phước Trường Hải",
      "Tài Anh",
      "Phan Hiển"
    ]
  },
  {
    "id": "tbg-moment-11",
    "frameCode": "► 11A",
    "src": "/media/group/tbg-group-09.jpg",
    "title": "Khung Hình Gia Đình Trong Phòng Studio Phông Đen",
    "caption": "9 anh chị em quây quần ấm cúng dưới ánh đèn softbox chuẩn chỉnh tại phòng chụp.",
    "location": "TBG Studio",
    "filmStock": "KODAK PORTRA 400 • 35MM",
    "dateLabel": "STUDIO PORTRAIT",
    "category": "dai-gia-dinh",
    "onFilmStrip": false,
    "detectedFaceCount": 9,
    "memberSlugs": [
      "nam-trung-dao",
      "doan-phuoc-truong-hai"
    ],
    "memberNames": [
      "Nam Trung Đào",
      "Phan Hiển",
      "Đoàn Phước Trường Hải",
      "Ân"
    ]
  },
  {
    "id": "tbg-moment-12",
    "frameCode": "► 12A",
    "src": "/media/group/tbg-group-10.jpg",
    "title": "Dàn Súng Ống & Gimbal Ra Trận",
    "caption": "Tổ máy 8 anh em đồng loạt giơ body Sony, ống kính tele và gimbal hướng thẳng vào ống kính.",
    "location": "FUDA Studio Set",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "GEAR READY",
    "category": "hau-truong",
    "onFilmStrip": true,
    "detectedFaceCount": 8,
    "memberSlugs": [
      "le-quang-vu",
      "doan-phuoc-truong-hai",
      "tran-kim-thang",
      "tai-anh",
      "mai-nhat-thanh",
      "nam-trung-dao"
    ],
    "memberNames": [
      "Lê Quang Vũ",
      "Đoàn Phước Trường Hải",
      "Trần Kim Thắng",
      "Tài Anh",
      "Mai Nhất Thành",
      "Nam Trung Đào"
    ]
  },
  {
    "id": "tbg-moment-13",
    "frameCode": "► 13A",
    "src": "/media/group/tbg-group-11.jpg",
    "title": "'Xe Rùa Dolly Rig' Độc Nhất Vô Nhị Ngoại Cảnh",
    "caption": "Khi anh em Thiết Bị Gia biến xe đẩy tay thành hệ thống tracking dolly siêu mượt giữa đồi cỏ.",
    "location": "Hậu Trường Ngoại Cảnh",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "CREATIVE RIG",
    "category": "hau-truong",
    "onFilmStrip": true,
    "detectedFaceCount": 14,
    "memberSlugs": [
      "tai-anh"
    ],
    "memberNames": [
      "Tài Anh"
    ]
  },
  {
    "id": "tbg-moment-14",
    "frameCode": "► 14A",
    "src": "/media/group/tbg-group-12.jpg",
    "title": "Tổ Máy 8 Anh Em Trên Đài Đá Giữa Núi Đồi",
    "caption": "Đội hình tác nghiệp ngoại cảnh tạo dáng cực ngầu bên chân máy sau khi hoàn thành cảnh quay.",
    "location": "Đài Đá Ngoại Ô",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "FIELD CREW",
    "category": "hau-truong",
    "onFilmStrip": false,
    "detectedFaceCount": 8,
    "memberSlugs": [
      "nam-trung-dao",
      "tran-kim-thang",
      "tan-loc",
      "doan-phuoc-truong-hai",
      "nguyen-bao",
      "le-quang-vu",
      "tai-anh",
      "nguyen-pham-viet-thong"
    ],
    "memberNames": [
      "Nam Trung Đào",
      "Trần Kim Thắng",
      "Tấn lộc",
      "Đoàn Phước Trường Hải",
      "Nguyễn Bảo",
      "Lê Quang Vũ",
      "Tài Anh",
      "Viết Thông"
    ]
  },
  {
    "id": "tbg-moment-15",
    "frameCode": "► 15A",
    "src": "/media/group/tbg-group-13.jpg",
    "title": "Ekip Tác Nghiệp Sự Kiện 'Hạ Sau Hè'",
    "caption": "6 tay máy chủ lực chụp ảnh tổng kết trước backdrop chương trình Hạ Sau Hè.",
    "location": "Sự Kiện Hạ Sau Hè",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "EVENT CREW",
    "category": "hau-truong",
    "onFilmStrip": false,
    "detectedFaceCount": 6,
    "memberSlugs": [
      "quoc-hi",
      "tran-thanh-van",
      "tan-loc",
      "nguyen-pham-viet-thong",
      "tran-kim-thang",
      "doan-phuoc-truong-hai"
    ],
    "memberNames": [
      "Quốc Hi",
      "Thanh Văn",
      "Tấn lộc",
      "Viết Thông",
      "Trần Kim Thắng",
      "Đoàn Phước Trường Hải"
    ]
  },
  {
    "id": "tbg-moment-16",
    "frameCode": "► 16A",
    "src": "/media/group/tbg-group-14.jpg",
    "title": "Chốt Set Sân Khấu Hội Trường Đỏ",
    "caption": "7 anh em tổ quay & chụp lưu niệm trên thảm sân khấu ấm rực sau nhiều giờ chạy sự kiện liên tục.",
    "location": "Hội Trường Lớn",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "STAGE WRAP",
    "category": "hau-truong",
    "onFilmStrip": false,
    "detectedFaceCount": 7,
    "memberSlugs": [
      "tai-anh",
      "doan-phuoc-truong-hai",
      "tan-loc",
      "nguyen-bao",
      "nguyen-pham-viet-thong",
      "quang-hoang"
    ],
    "memberNames": [
      "Tài Anh",
      "Đoàn Phước Trường Hải",
      "Tấn lộc",
      "Nguyễn Bảo",
      "Viết Thông",
      "Quang Hoàng"
    ]
  },
  {
    "id": "tbg-moment-17",
    "frameCode": "► 17A",
    "src": "/media/group/tbg-group-15.jpg",
    "title": "Đội Hình Truyền Thông Đêm Vinh Danh C-AWARD",
    "caption": "Tập thể anh em phụ trách hình ảnh tại lễ trao giải C-AWARD Summer.",
    "location": "C-AWARD Stage",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "AWARD SHOW",
    "category": "hau-truong",
    "onFilmStrip": false,
    "detectedFaceCount": 7,
    "memberSlugs": [
      "tan-loc",
      "nguyen-bao",
      "doan-phuoc-truong-hai",
      "quang-hoang",
      "tai-anh",
      "nguyen-pham-viet-thong"
    ],
    "memberNames": [
      "Tấn lộc",
      "Nguyễn Bảo",
      "Đoàn Phước Trường Hải",
      "Quang Hoàng",
      "Tài Anh",
      "Viết Thông"
    ]
  },
  {
    "id": "tbg-moment-18",
    "frameCode": "► 18A",
    "src": "/media/group/tbg-group-16.jpg",
    "title": "Hậu Trường Đêm Văn Nghệ 'Hành Khúc Trưởng Thành'",
    "caption": "Tổ truyền thông thức trắng cùng sân khấu đêm nhạc giàu cảm xúc của sinh viên.",
    "location": "Đêm Nhạc Trưởng Thành",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "LIVE SHOW",
    "category": "hau-truong",
    "onFilmStrip": false,
    "detectedFaceCount": 6,
    "memberSlugs": [
      "nguyen-bao",
      "nam-trung-dao",
      "tai-anh",
      "doan-phuoc-truong-hai"
    ],
    "memberNames": [
      "Nguyễn Bảo",
      "Nam Trung Đào",
      "Tài Anh",
      "Đoàn Phước Trường Hải"
    ]
  },
  {
    "id": "tbg-moment-19",
    "frameCode": "► 19A",
    "src": "/media/group/tbg-group-17.jpg",
    "title": "Chinh Chiến Sân Khấu Đại Nhạc Hội CAMP",
    "caption": "6 anh em rạng rỡ trước dàn màn hình LED rực sáng của đêm đại nhạc hội.",
    "location": "CAMP Festival Stage",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "CONCERT CREW",
    "category": "hau-truong",
    "onFilmStrip": false,
    "detectedFaceCount": 7,
    "memberSlugs": [
      "tai-anh",
      "le-quang-vu",
      "nguyen-bao",
      "doan-phuoc-truong-hai"
    ],
    "memberNames": [
      "Tài Anh",
      "Lê Quang Vũ",
      "Nguyễn Bảo",
      "Đoàn Phước Trường Hải",
      "Anh Nguyên"
    ]
  },
  {
    "id": "tbg-moment-20",
    "frameCode": "► 20A",
    "src": "/media/group/tbg-group-18.jpg",
    "title": "Giữa Rừng Chân Đèn C-Stand & Softbox",
    "caption": "Không gian hậu trường phòng chụp thương mại với đầy đủ thiết bị chiếu sáng chuyên dụng.",
    "location": "Commercial Studio",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "LIGHTING SET",
    "category": "hau-truong",
    "onFilmStrip": false,
    "detectedFaceCount": 6,
    "memberSlugs": [
      "doan-phuoc-truong-hai",
      "tai-anh",
      "tan-loc"
    ],
    "memberNames": [
      "Đoàn Phước Trường Hải",
      "Tài Anh",
      "Tấn lộc",
      "Tân Lý"
    ]
  },
  {
    "id": "tbg-moment-21",
    "frameCode": "► 21A",
    "src": "/media/group/tbg-group-19.jpg",
    "title": "Vác Máy Băng Suối Đá Rêu Phong",
    "caption": "4 tay máy đồng hành săn ánh sáng tự nhiên giữa dòng suối rừng nguyên sơ.",
    "location": "Suối Đá Rừng Xanh",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "OUTDOOR SHOOT",
    "category": "hau-truong",
    "onFilmStrip": false,
    "detectedFaceCount": 4,
    "memberSlugs": [
      "doan-phuoc-truong-hai",
      "tai-anh",
      "tran-kim-thang",
      "nam-trung-dao"
    ],
    "memberNames": [
      "Đoàn Phước Trường Hải",
      "Tài Anh",
      "Trần Kim Thắng",
      "Nam Trung Đào"
    ]
  },
  {
    "id": "tbg-moment-22",
    "frameCode": "► 22A",
    "src": "/media/group/tbg-group-20.jpg",
    "title": "Canh Khung Hình Hoàng Hôn Trên Đồi Gió",
    "caption": "Bóng dáng tổ quay phim bên chân máy giữa nền trời chạng vạng xanh thẫm đầy chất điện ảnh.",
    "location": "Đồi Gió Chạng Vạng",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "BLUE HOUR SET",
    "category": "hau-truong",
    "onFilmStrip": false,
    "detectedFaceCount": 4,
    "memberSlugs": [],
    "memberNames": [
      "Phan Anh Lực",
      "Phan Hiển",
      "Ân"
    ]
  },
  {
    "id": "tbg-moment-23",
    "frameCode": "► 23A",
    "src": "/media/group/tbg-group-21.jpg",
    "title": "Soi File RAW Ngay Tại Hiện Trường",
    "caption": "Khoảnh khắc anh em chụm đầu kiểm tra độ nét và ánh sáng trực tiếp trên màn hình máy ảnh.",
    "location": "On-Set Review",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "TETHER & CHECK",
    "category": "hau-truong",
    "onFilmStrip": false,
    "detectedFaceCount": 3,
    "memberSlugs": [
      "thanh-le",
      "tai-anh"
    ],
    "memberNames": [
      "Thành Lê",
      "Tài Anh"
    ]
  },
  {
    "id": "tbg-moment-24",
    "frameCode": "► 24A",
    "src": "/media/group/tbg-group-22.jpg",
    "title": "Cân Chỉnh Đèn & Hắt Sáng Trước Giờ Bấm Máy",
    "caption": "Phối hợp ăn ý giữa người cầm máy và người đánh sáng để tạo nên khung hình hoàn hảo.",
    "location": "Studio Lighting BTS",
    "filmStock": "CINESTILL 800T • ON-SET",
    "dateLabel": "GAFFER & DOP",
    "category": "hau-truong",
    "onFilmStrip": false,
    "detectedFaceCount": 2,
    "memberSlugs": [],
    "memberNames": []
  },
  {
    "id": "tbg-moment-25",
    "frameCode": "► 25A",
    "src": "/media/group/tbg-group-23.jpg",
    "title": "Bàn Tiệc Đêm Hội Ngộ Anh Em",
    "caption": "Sau những giờ vác máy nặng trên vai là lúc cả đại gia đình ngồi lại nâng ly kể chuyện nghề.",
    "location": "Đêm Liên Hoan TBG",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "BROTHERHOOD",
    "category": "doi-thuong",
    "onFilmStrip": true,
    "detectedFaceCount": 12,
    "memberSlugs": [
      "le-quang-vu",
      "tran-thanh-van",
      "doan-phuoc-truong-hai",
      "tai-anh",
      "nam-trung-dao",
      "tan-loc",
      "nguyen-bao",
      "nguyen-pham-viet-thong"
    ],
    "memberNames": [
      "Lê Quang Vũ",
      "Thanh Văn",
      "Đoàn Phước Trường Hải",
      "Tài Anh",
      "Nam Trung Đào",
      "Tấn lộc",
      "Nguyễn Bảo",
      "Viết Thông"
    ]
  },
  {
    "id": "tbg-moment-26",
    "frameCode": "► 26A",
    "src": "/media/group/tbg-group-24.jpg",
    "title": "Ngắm Trọn Đêm Đà Nẵng Từ Đỉnh Đèo",
    "caption": "6 anh em khoác vai nhau hóng gió đêm trên cao với ánh đèn thành phố lung linh phía xa.",
    "location": "Đỉnh Đèo Đêm Đà Nẵng",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "CITY OVERLOOK",
    "category": "doi-thuong",
    "onFilmStrip": true,
    "detectedFaceCount": 6,
    "memberSlugs": [
      "tai-anh",
      "nam-trung-dao",
      "tan-loc",
      "mai-nhat-thanh",
      "tran-thanh-van",
      "doan-phuoc-truong-hai"
    ],
    "memberNames": [
      "Tài Anh",
      "Nam Trung Đào",
      "Tấn lộc",
      "Mai Nhất Thành",
      "Thanh Văn",
      "Đoàn Phước Trường Hải"
    ]
  },
  {
    "id": "tbg-moment-27",
    "frameCode": "► 27A",
    "src": "/media/group/tbg-group-25.jpg",
    "title": "Chiều Xanh Lam Trên Sườn Đồi Gió Lộng",
    "caption": "Ngồi cạnh nhau nghe gió thổi qua triền cỏ xanh thẫm lúc hoàng hôn vừa tắt nắng.",
    "location": "Triền Đồi Ngoại Ô",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "TWILIGHT CHILL",
    "category": "doi-thuong",
    "onFilmStrip": false,
    "detectedFaceCount": 7,
    "memberSlugs": [
      "tai-anh",
      "nam-trung-dao",
      "doan-phuoc-truong-hai",
      "nguyen-bao"
    ],
    "memberNames": [
      "Tài Anh",
      "Nam Trung Đào",
      "Đoàn Phước Trường Hải",
      "Phan Anh Lực",
      "Nguyễn Bảo"
    ]
  },
  {
    "id": "tbg-moment-28",
    "frameCode": "► 28A",
    "src": "/media/group/tbg-group-26.jpg",
    "title": "Tạo Dáng 'Bá Đạo' Giữa Giờ Giải Lao Studio",
    "caption": "Khi những người chuyên đứng sau ống kính quyết định tự làm mẫu theo phong cách không giống ai.",
    "location": "Studio Fun Moment",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "FUN STUDIO",
    "category": "doi-thuong",
    "onFilmStrip": false,
    "detectedFaceCount": 5,
    "memberSlugs": [
      "tai-anh",
      "tran-thanh-van",
      "le-quang-vu",
      "tan-loc",
      "doan-phuoc-truong-hai"
    ],
    "memberNames": [
      "Tài Anh",
      "Thanh Văn",
      "Lê Quang Vũ",
      "Tấn lộc",
      "Đoàn Phước Trường Hải"
    ]
  },
  {
    "id": "tbg-moment-29",
    "frameCode": "► 29A",
    "src": "/media/group/tbg-group-27.jpg",
    "title": "Tổng Kết Đêm Sự Kiện Cùng Bảng Tên Kỷ Niệm",
    "caption": "8 anh em khoe huy hiệu và bảng kỷ niệm sau một kỳ chạy chương trình thành công rực rỡ.",
    "location": "Đêm Tổng Kết",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "TEAM SPIRIT",
    "category": "doi-thuong",
    "onFilmStrip": false,
    "detectedFaceCount": 8,
    "memberSlugs": [
      "thanh-le",
      "tai-anh",
      "le-quang-vu",
      "nguyen-bao",
      "nam-trung-dao"
    ],
    "memberNames": [
      "Thành Lê",
      "Tài Anh",
      "Anh Nguyên",
      "Lê Quang Vũ",
      "Nguyễn Bảo",
      "Nam Trung Đào"
    ]
  },
  {
    "id": "tbg-moment-30",
    "frameCode": "► 30A",
    "src": "/media/group/tbg-group-28.jpg",
    "title": "Phút Giải Lao Phía Sau Cánh Gà",
    "caption": "Nụ cười sảng khoái của anh em tổ sản xuất trong lúc nghỉ chân giữa hai ca bấm máy.",
    "location": "Backstage Break",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "BACKSTAGE",
    "category": "doi-thuong",
    "onFilmStrip": false,
    "detectedFaceCount": 8,
    "memberSlugs": [
      "nguyen-pham-viet-thong",
      "doan-phuoc-truong-hai",
      "tai-anh"
    ],
    "memberNames": [
      "Phan Hiển",
      "Viết Thông",
      "Phan Anh Lực",
      "Đoàn Phước Trường Hải",
      "Tài Anh"
    ]
  },
  {
    "id": "tbg-moment-31",
    "frameCode": "► 31A",
    "src": "/media/group/tbg-group-29.jpg",
    "title": "Góc Cà Phê Xanh & Những Câu Chuyện Làm Hình",
    "caption": "Buổi chiều thư thả bàn ý tưởng kịch bản mới trong không gian quán quen mang màu hoài niệm.",
    "location": "Góc Quán Quen",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "COFFEE TALK",
    "category": "doi-thuong",
    "onFilmStrip": false,
    "detectedFaceCount": 2,
    "memberSlugs": [],
    "memberNames": []
  },
  {
    "id": "tbg-moment-32",
    "frameCode": "► 32A",
    "src": "/media/group/tbg-group-30.jpg",
    "title": "Nắng Chiều Xuyên Qua Rừng Thông",
    "caption": "Khoảnh khắc ngược sáng đầy chất thơ của 6 anh em trong chuyến dã ngoại cuối tuần.",
    "location": "Đồi Thông Chiều Nắng",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "GOLDEN HOUR",
    "category": "doi-thuong",
    "onFilmStrip": false,
    "detectedFaceCount": 6,
    "memberSlugs": [
      "doan-phuoc-truong-hai",
      "tai-anh",
      "mai-nhat-thanh",
      "le-quang-vu",
      "nam-trung-dao"
    ],
    "memberNames": [
      "Đoàn Phước Trường Hải",
      "Tài Anh",
      "Mai Nhất Thành",
      "Lê Quang Vũ",
      "Nam Trung Đào"
    ]
  },
  {
    "id": "tbg-moment-33",
    "frameCode": "► 33A",
    "src": "/media/group/tbg-group-31.jpg",
    "title": "Dựng Lều Cắm Trại Giữa Rừng Xanh",
    "caption": "Tạm gác deadline hậu kỳ để cùng nhau dựng trại, đốt lửa và hít thở không khí núi rừng.",
    "location": "Khu Cắm Trại Rừng",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "CAMPING TRIP",
    "category": "doi-thuong",
    "onFilmStrip": false,
    "detectedFaceCount": 3,
    "memberSlugs": [
      "le-quang-vu",
      "tai-anh"
    ],
    "memberNames": [
      "Lê Quang Vũ",
      "Anh Nguyên",
      "Tài Anh"
    ]
  },
  {
    "id": "tbg-moment-34",
    "frameCode": "► 34A",
    "src": "/media/group/tbg-group-32.jpg",
    "title": "Góc Nhìn Hội Ngộ Từ Dưới Lên",
    "caption": "Cú bấm máy góc rộng đầy năng lượng tuổi trẻ khi cả nhóm cùng cúi xuống nhìn thẳng vào lens.",
    "location": "Huddle Shot",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "YOUTH ENERGY",
    "category": "doi-thuong",
    "onFilmStrip": false,
    "detectedFaceCount": 4,
    "memberSlugs": [
      "nguyen-pham-viet-thong"
    ],
    "memberNames": [
      "Phan Anh Lực",
      "Viết Thông",
      "Phan Hiển",
      "Tân Lý"
    ]
  },
  {
    "id": "tbg-moment-35",
    "frameCode": "► 35A",
    "src": "/media/group/tbg-group-33.jpg",
    "title": "Đằm Mình Dưới Làn Nước Suối Mát Lạnh",
    "caption": "Giải nhiệt sảng khoái giữa dòng suối trong vắt sau buổi sáng băng rừng chụp ngoại cảnh.",
    "location": "Suối Nguồn Dã Ngoại",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "STREAM SWIM",
    "category": "doi-thuong",
    "onFilmStrip": false,
    "detectedFaceCount": 2,
    "memberSlugs": [
      "tai-anh",
      "le-quang-vu"
    ],
    "memberNames": [
      "Tài Anh",
      "Lê Quang Vũ"
    ]
  },
  {
    "id": "tbg-moment-36",
    "frameCode": "► 36A",
    "src": "/media/group/tbg-group-34.jpg",
    "title": "Sẻ Chia Nụ Cười Cùng Các Em Nhỏ Vùng Cao",
    "caption": "Khoảnh khắc ấm áp tình người trong chuyến đi thiện nguyện mang yêu thương lên bản xa.",
    "location": "Điểm Trường Vùng Cao",
    "filmStock": "FUJIFILM PRO 400H • CANDID",
    "dateLabel": "WARM HEARTS",
    "category": "doi-thuong",
    "onFilmStrip": false,
    "detectedFaceCount": 9,
    "memberSlugs": [
      "tran-kim-thang"
    ],
    "memberNames": [
      "Trần Kim Thắng"
    ]
  }
];

export const FILM_STRIP_MOMENTS: GroupMoment[] = GROUP_MOMENTS.filter(
  (m) => m.onFilmStrip
);
