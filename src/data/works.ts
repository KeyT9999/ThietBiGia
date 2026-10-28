import { type WorkProject, type CrewMember } from "./schema";
import { CREW_MEMBERS } from "./crew";
export type { WorkProject };

export const WORKS_DATA: WorkProject[] = [
  {
    id: "work-01",
    indexLabel: "01",
    slug: "hau-truong-thiet-bi-gia",
    title: "Đại Gia Đình Thiết Bị Gia",
    clientOrSeries: "Thiết Bị Gia Official Collective",
    category: "Showreel & Kỷ Niệm Tập Thể • 16 Thành Viên",
    year: "2026",
    durationTimecode: "00:02:58:23",
    coverImage: "/anhchungtbg.jpg",
    accentColor: "#FF4D00",
    cameraSpec: "TRIPOD LOCKED • KODAK PORTRA 400 • 2-FRAME STOP-MOTION",
    summary:
      "Khoảnh khắc tập thể của anh em Thiết Bị Gia bên bờ suối đá sương sớm — nơi những người cầm máy quay, máy chụp và làm công nghệ cùng giơ ống kính về một hướng và gắn kết như một gia đình.",
    galleryImages: [
      "/anhchungtbg.jpg",
      "/anhchungtbg2.jpg",
      "/media/keyt/pkl-03.jpg",
    ],
    btsNotes: [
      "Đặt chân máy cố định bên bờ suối đá sương sớm để chụp 2 frame liên tiếp: Frame 01A giơ máy ngắm thẳng và Frame 02A đồng loạt chỉ tay lên bầu trời.",
      "Nhấn nút Play trên màn hình xem trước ở trên để thưởng thức chuyển động Stop-Motion của anh em Thiết Bị Gia.",
      "Quy tụ đầy đủ 16 thành viên thuộc 3 mũi nhọn: Chụp ảnh, Quay phim và IT.",
    ],
    gearUsed: [
      "Full Thiết Bị Gia Arsenal",
      "35mm Film & Digital Bodies",
      "Tripod Locked-Off",
      "Creative WebGL",
    ],
    credits: [
      { memberSlug: "doan-phuoc-truong-hai", roleOnProject: "Quay & Chụp" },
      { memberSlug: "tran-kim-thang", roleOnProject: "Chụp ảnh & Web 3D" },
      { memberSlug: "khoa-anh", roleOnProject: "Quay & Chụp" },
      { memberSlug: "le-quang-vu", roleOnProject: "Chụp ảnh" },
      { memberSlug: "mai-nhat-thanh", roleOnProject: "Quay & Chụp" },
      { memberSlug: "nam-trung-dao", roleOnProject: "Quay phim" },
      { memberSlug: "nguyen-bao-photo", roleOnProject: "Chụp ảnh" },
      { memberSlug: "nguyen-bao", roleOnProject: "Chụp ảnh & IT" },
      { memberSlug: "nguyen-pham-viet-thong", roleOnProject: "Quay & Chụp" },
      { memberSlug: "quang-hoang", roleOnProject: "Chụp ảnh" },
      { memberSlug: "quoc-hi", roleOnProject: "Quay phim" },
      { memberSlug: "tai-anh", roleOnProject: "Chụp ảnh & IT" },
      { memberSlug: "tan-loc", roleOnProject: "Chụp ảnh" },
      { memberSlug: "thanh-le", roleOnProject: "Chụp ảnh & IT" },
      { memberSlug: "tran-thanh-van", roleOnProject: "Quay & Chụp" },
      { memberSlug: "nguyen-phu-trong", roleOnProject: "Chụp ảnh" },
    ],
  },
  {
    id: "work-02",
    indexLabel: "02",
    slug: "phung-khanh-linh-live-stage",
    title: "Phùng Khánh Linh — Live Stage",
    clientOrSeries: "Live Concert Photography • KeyT",
    category: "Nhiếp Ảnh Sân Khấu & Đại Nhạc Hội",
    year: "2026",
    durationTimecode: "00:03:24:10",
    coverImage: "/media/keyt/pkl-02.jpg",
    accentColor: "#00E5FF",
    cameraSpec: "SONY ALPHA FULL-FRAME • FE 70-200MM GM • STAGE LIGHT",
    summary:
      "Bộ ảnh sân khấu thực chiến ghi lại trọn vẹn thần thái thăng hoa của ca sĩ Phùng Khánh Linh giữa không gian visual Căn Gác Mùa Hè và những luồng đèn spotlight ngược sáng đầy mê hoặc.",
    galleryImages: [
      "/media/keyt/pkl-02.jpg",
      "/media/keyt/pkl-01.jpg",
      "/media/keyt/pkl-04.jpg",
      "/media/keyt/pkl-03.jpg",
    ],
    btsNotes: [
      "Tác nghiệp trực tiếp dưới chân sân khấu với tiêu cự tele khẩu lớn để tách chủ thể nổi bật giữa làn khói và màn LED công suất cao.",
      "Cân bằng chính xác độ phơi sáng trên trang phục trắng tinh khôi mà vẫn giữ trọn chi tiết đồ họa cassette trên màn hình LED phía sau.",
      "Khung hình thứ 4 ghi lại khoảnh khắc phối hợp nhịp nhàng giữa ca sĩ và tay máy quay trực tiếp ngay trên cánh gà sân khấu.",
    ],
    gearUsed: ["Sony Alpha Full-Frame", "FE 70-200mm f/2.8 GM", "Dual Card RAW", "Lightroom Classic"],
    credits: [
      { memberSlug: "tran-kim-thang", roleOnProject: "Lead Stage Photographer (KeyT)" },
      { memberSlug: "quoc-hi", roleOnProject: "Stage Cam Op" },
      { memberSlug: "nguyen-bao", roleOnProject: "Media Sync & IT" },
    ],
  },
  {
    id: "work-03",
    indexLabel: "03",
    slug: "lien-hoan-phim-chau-a-danaff",
    title: "Liên Hoan Phim Châu Á (DANAFF)",
    clientOrSeries: "Asian Film Festival Da Nang • KeyT",
    category: "Nhiếp Ảnh Thảm Đỏ & Sự Kiện Điện Ảnh",
    year: "2026",
    durationTimecode: "00:02:15:05",
    coverImage: "/media/keyt/danaff-03.jpg",
    accentColor: "#F43F5E",
    cameraSpec: "FULL-FRAME • 85MM & 70-200MM • TTL BOUNCE FLASH",
    summary:
      "Loạt ảnh tác nghiệp báo chí & chân dung nghệ sĩ trên thảm đỏ Liên Hoan Phim Châu Á Đà Nẵng (DANAFF) — bắt trọn khoảnh khắc giao lưu rạng rỡ, thanh lịch với độ trong trẻo và sắc độ da chuẩn xác.",
    galleryImages: [
      "/media/keyt/danaff-03.jpg",
      "/media/keyt/danaff-04.jpg",
      "/media/keyt/danaff-02.jpg",
      "/media/keyt/danaff-01.jpg",
      "/media/keyt/danaff-05.jpg",
    ],
    btsNotes: [
      "Xử lý ánh sáng flash thảm đỏ tốc độ cao giúp giữ độ khối mềm mại trên gương mặt và chi tiết đính kết tinh xảo của trang phục dạ hội.",
      "Bắt nhịp liên tục chỉ trong vài giây di chuyển của khách mời giữa hàng chục ống kính truyền thông quốc tế.",
    ],
    gearUsed: ["Sony Alpha Series", "FE 70-200mm GM", "On-Camera Pro Flash", "Fast Tether"],
    credits: [
      { memberSlug: "tran-kim-thang", roleOnProject: "Red Carpet Photographer (KeyT)" },
      { memberSlug: "tai-anh", roleOnProject: "Press Dispatch & IT" },
      { memberSlug: "thanh-le", roleOnProject: "Color & Retouch" },
    ],
  },
  {
    id: "work-04",
    indexLabel: "04",
    slug: "net-ngoc-ao-dai",
    title: "Nét Ngọc Áo Dài",
    clientOrSeries: "Vietnamese Heritage Editorial • KeyT",
    category: "Chân Dung Áo Dài & Ánh Sáng Tự Nhiên",
    year: "2026",
    durationTimecode: "00:01:18:00",
    coverImage: "/media/keyt/aodai-01.jpg",
    accentColor: "#10B981",
    cameraSpec: "85MM F/1.4 PRIME • NATURAL CHIAROSCURO SUNLIGHT",
    summary:
      "Bộ ảnh chân dung tôn vinh vẻ đẹp dịu dàng của tà Áo dài lụa xanh ngọc kết hợp chuỗi ngọc trai và quạt giấy truyền thống, khai thác vệt nắng xiên tự nhiên tương phản trên nền kiến trúc cổ.",
    galleryImages: [
      "/media/keyt/aodai-01.jpg",
    ],
    btsNotes: [
      "Canh đúng khung giờ nắng xiên tự nhiên tạo hiệu ứng tách sáng (chiaroscuro) làm nổi bật độ bóng óng ả của họa tiết lụa thêu chìm.",
      "Phối sắc xanh ngọc của tà áo với sắc vàng rực của khóm cúc và hậu cảnh trầm ấm để tạo chiều sâu hội họa.",
    ],
    gearUsed: ["Sony Alpha Full-Frame", "FE 85mm f/1.4 GM", "Natural Sunlight"],
    credits: [
      { memberSlug: "tran-kim-thang", roleOnProject: "Concept & Portrait Photographer (KeyT)" },
      { memberSlug: "le-quang-vu", roleOnProject: "Lighting Assist" },
    ],
  },
  {
    id: "work-05",
    indexLabel: "05",
    slug: "cham-anh-sang-tvc",
    title: "Chạm Ánh Sáng",
    clientOrSeries: "Commercial Brand Film",
    category: "Quay Phim & Chụp Ảnh Chiến Dịch",
    year: "2026",
    durationTimecode: "00:01:45:12",
    coverImage: "/media/works/work-01.jpg",
    accentColor: "#FF4D00",
    cameraSpec: "SONY FX6 • ATLAS ORION 40MM • T2.0",
    summary:
      "Dự án kết hợp đồng thời tổ Quay phim và tổ Nhiếp ảnh của Thiết Bị Gia, khai thác sự tương phản mạnh giữa ánh sáng gắt studio và chuyển động ống kính.",
    galleryImages: [
      "/media/works/work-01.jpg",
      "/media/works/work-05.jpg",
      "/anhchungtbg.jpg",
    ],
    btsNotes: [
      "Triển khai song song set máy quay chính và tổ chụp Key Visual ngay trên cùng hệ thống đèn công suất lớn.",
      "Truyền ảnh Tether trực tiếp lên trạm máy tính kiểm duyệt màu tại hiện trường.",
    ],
    gearUsed: ["Sony FX6", "Sony A7RV", "FE 24-70mm GM II", "Aputure 1200d Pro"],
    credits: [
      { memberSlug: "doan-phuoc-truong-hai", roleOnProject: "Quay phim" },
      { memberSlug: "nguyen-pham-viet-thong", roleOnProject: "Quay & Chụp" },
      { memberSlug: "le-quang-vu", roleOnProject: "Chụp ảnh" },
    ],
  },
  {
    id: "work-06",
    indexLabel: "06",
    slug: "dem-do-thi-mv",
    title: "Đêm Đô Thị",
    clientOrSeries: "Official Music Video",
    category: "Music Video • Cinematography",
    year: "2026",
    durationTimecode: "00:03:52:08",
    coverImage: "/media/works/work-02.jpg",
    accentColor: "#00E5FF",
    cameraSpec: "SONY FX6 + FX3 • 35MM GM • 24FPS",
    summary:
      "MV quay xuyên đêm với tông màu Cyan-Orange đặc trưng trên mặt đường ướt mưa, phối hợp nhịp nhàng giữa các tay máy quay chuyển động và chụp poster hậu trường.",
    galleryImages: [
      "/media/works/work-02.jpg",
      "/media/works/work-10.jpg",
      "/media/works/work-08.jpg",
    ],
    btsNotes: [
      "Lắp đặt hệ thống máy quay bám theo xe chạy dọc cầu Thủ Thiêm lúc rạng sáng.",
      "Ghi lại trọn bộ ảnh Stills quảng bá MV ngay trong lúc set đèn cảnh quay chính.",
    ],
    gearUsed: ["Sony FX6", "Sony FX3", "DJI RS4 Pro", "Astera Titan Tube"],
    credits: [
      { memberSlug: "khoa-anh", roleOnProject: "Quay phim" },
      { memberSlug: "nam-trung-dao", roleOnProject: "Cam Op" },
      { memberSlug: "quoc-hi", roleOnProject: "Quay phim" },
      { memberSlug: "quang-hoang", roleOnProject: "Unit Still Photo" },
    ],
  },
  {
    id: "work-07",
    indexLabel: "07",
    slug: "chat-thep-lookbook",
    title: "Chất Thép",
    clientOrSeries: "Editorial Portrait & Lookbook",
    category: "Chụp Ảnh Studio & Video Lookbook",
    year: "2026",
    durationTimecode: "00:00:36:00",
    coverImage: "/media/works/work-03.jpg",
    accentColor: "#F43F5E",
    cameraSpec: "SONY A7RV • 50MM F/1.2 GM • STUDIO STROBE",
    summary:
      "Bộ ảnh thời trang và fashion film ngắn tôn vinh vẻ đẹp sắc cạnh của kim loại công nghiệp và kỹ thuật kiểm soát ánh sáng studio chuẩn xác.",
    galleryImages: [
      "/media/works/work-03.jpg",
      "/media/works/work-11.jpg",
      "/media/works/work-09.jpg",
    ],
    btsNotes: [
      "Kết hợp đồng bộ đèn Strobe tốc độ cao cho tổ chụp ảnh và đèn LED liên tục cho tổ quay fashion reel.",
    ],
    gearUsed: ["Sony A7RV", "FE 50mm f/1.2 GM", "Profoto Strobe", "Capture One"],
    credits: [
      { memberSlug: "le-quang-vu", roleOnProject: "Chụp ảnh chính" },
      { memberSlug: "tran-thanh-van", roleOnProject: "Fashion Video & Photo" },
      { memberSlug: "nguyen-bao-photo", roleOnProject: "Chụp ảnh" },
      { memberSlug: "thanh-le", roleOnProject: "Chụp ảnh & Tether IT" },
    ],
  },
  {
    id: "work-08",
    indexLabel: "08",
    slug: "nhip-song-tre-festival",
    title: "Nhịp Sống Trẻ",
    clientOrSeries: "Live Concert & Festival Coverage",
    category: "Sự Kiện Lớn • Đa Máy Quay & Chụp",
    year: "2026",
    durationTimecode: "00:02:28:19",
    coverImage: "/media/works/work-04.jpg",
    accentColor: "#A855F7",
    cameraSpec: "MULTICAM VIDEO • REALTIME PHOTO DISPATCH",
    summary:
      "Chiến dịch tác nghiệp tổng lực của đại gia đình Thiết Bị Gia tại đêm nhạc hội hàng chục nghìn khán giả, trả ảnh truyền thông ngay trong đêm.",
    galleryImages: [
      "/media/works/work-04.jpg",
      "/media/works/work-08.jpg",
      "/anhchungtbg2.jpg",
    ],
    btsNotes: [
      "Tổ IT & Chụp ảnh dựng luồng đồng bộ ảnh nhanh từ thẻ nhớ lên hệ thống chung chỉ vài phút sau mỗi tiết mục.",
    ],
    gearUsed: ["Sony FX3", "Sony A7IV", "FE 70-200mm GM II", "FE 16-35mm GM II"],
    credits: [
      { memberSlug: "mai-nhat-thanh", roleOnProject: "Quay & Chụp" },
      { memberSlug: "nam-trung-dao", roleOnProject: "Quay phim" },
      { memberSlug: "nguyen-phu-trong", roleOnProject: "Chụp ảnh sân khấu" },
      { memberSlug: "tai-anh", roleOnProject: "Chụp ảnh & Media IT" },
      { memberSlug: "nguyen-bao", roleOnProject: "Chụp ảnh & Sync IT" },
    ],
  },
  {
    id: "work-09",
    indexLabel: "09",
    slug: "mua-ha-cuoi-shortfilm",
    title: "Mùa Hạ Cuối",
    clientOrSeries: "Indie Narrative Short Film",
    category: "Phim Ngắn • Quay Phim & Ảnh Tĩnh",
    year: "2025",
    durationTimecode: "00:18:24:00",
    coverImage: "/media/works/work-06.jpg",
    accentColor: "#F59E0B",
    cameraSpec: "SONY FX3 • PRIME LENSES • 24FPS",
    summary:
      "Phim ngắn độc lập mang sắc màu hoài niệm ấm áp như thước phim nhựa 35mm, ghi dấu sự ăn ý của các tay máy quay và chụp trong nhóm.",
    galleryImages: [
      "/media/works/work-06.jpg",
      "/media/works/work-07.jpg",
      "/media/works/work-09.jpg",
    ],
    btsNotes: [
      "Tận dụng hoàn toàn ánh sáng chiều tự nhiên kết hợp tản sáng lớn để giữ chất phim mộc mạc.",
    ],
    gearUsed: ["Sony FX3", "FE 35mm f/1.4 GM", "Black Pro-Mist 1/4"],
    credits: [
      { memberSlug: "tran-thanh-van", roleOnProject: "Quay & Chụp" },
      { memberSlug: "doan-phuoc-truong-hai", roleOnProject: "DOP" },
      { memberSlug: "nam-trung-dao", roleOnProject: "Cam Op" },
      { memberSlug: "tan-loc", roleOnProject: "Poster & Still Photo" },
    ],
  },
  {
    id: "work-10",
    indexLabel: "10",
    slug: "ban-sac-viet-doc",
    title: "Bản Sắc Việt",
    clientOrSeries: "Cultural Documentary Series",
    category: "Phóng Sự Tài Liệu • Quay & Chụp",
    year: "2025",
    durationTimecode: "00:12:40:16",
    coverImage: "/media/works/work-07.jpg",
    accentColor: "#10B981",
    cameraSpec: "DUAL HYBRID RIG • NATURAL LIGHT",
    summary:
      "Hành trình ghi hình và chụp bộ ảnh phóng sự tôn vinh vẻ đẹp lao động thủ công qua góc nhìn điện ảnh gần gũi, chân thực.",
    galleryImages: [
      "/media/works/work-07.jpg",
      "/media/works/work-06.jpg",
      "/media/works/work-11.jpg",
    ],
    btsNotes: [
      "Ekip gọn nhẹ cơ động di chuyển liên tục từ rạng sáng để bắt trọn làn khói bếp và nắng sớm.",
    ],
    gearUsed: ["Sony FX3", "Sony A7IV", "FE 24-70mm GM II"],
    credits: [
      { memberSlug: "nguyen-pham-viet-thong", roleOnProject: "Quay & Chụp" },
      { memberSlug: "mai-nhat-thanh", roleOnProject: "Quay phim" },
      { memberSlug: "tan-loc", roleOnProject: "Chụp ảnh tư liệu" },
      { memberSlug: "nguyen-phu-trong", roleOnProject: "Chụp ảnh" },
    ],
  },
  {
    id: "work-11",
    indexLabel: "11",
    slug: "vuot-gioi-han-sport",
    title: "Vượt Giới Hạn",
    clientOrSeries: "Athletic Action Campaign",
    category: "Quay Tốc Độ Cao 120FPS & Chụp Thể Thao",
    year: "2025",
    durationTimecode: "00:01:30:22",
    coverImage: "/media/works/work-10.jpg",
    accentColor: "#FF4D00",
    cameraSpec: "4K 120FPS SLOW-MOTION • AF TRACKING",
    summary:
      "Chiến dịch hình ảnh thể thao đòi hỏi tốc độ bắt nét cực nhanh và những cú lia máy bám sát chuyển động cường độ cao ngoài trời.",
    galleryImages: [
      "/media/works/work-10.jpg",
      "/media/works/work-01.jpg",
      "/media/works/work-02.jpg",
    ],
    btsNotes: [
      "Ghi hình slow-motion 120fps song song với chụp liên thanh tốc độ màn trập 1/4000s đóng băng từng giọt mồ hôi.",
    ],
    gearUsed: ["Sony FX6", "Sony FX3", "FE 70-200mm GM II"],
    credits: [
      { memberSlug: "khoa-anh", roleOnProject: "Quay & Chụp" },
      { memberSlug: "quoc-hi", roleOnProject: "Quay phim" },
      { memberSlug: "nam-trung-dao", roleOnProject: "Quay phim" },
      { memberSlug: "mai-nhat-thanh", roleOnProject: "Quay & Chụp" },
    ],
  },
  {
    id: "work-12",
    indexLabel: "12",
    slug: "tinh-lang-arch",
    title: "Tĩnh Lặng",
    clientOrSeries: "Space & Architecture Monograph",
    category: "Nhiếp Ảnh Không Gian & Kiến Trúc",
    year: "2025",
    durationTimecode: "00:02:05:10",
    coverImage: "/media/works/work-11.jpg",
    accentColor: "#38BDF8",
    cameraSpec: "WIDE ANGLE • GEOMETRIC PRECISION",
    summary:
      "Bộ ảnh kiến trúc và không gian nội thất tôn vinh đường nét hình học chuẩn xác cùng sự chuyển dịch êm ả của ánh nắng tự nhiên.",
    galleryImages: [
      "/media/works/work-11.jpg",
      "/media/works/work-03.jpg",
      "/media/works/work-07.jpg",
    ],
    btsNotes: [
      "Cân chỉnh trục máy tuyệt đối và hậu kỳ giữ trọn chất liệu bề mặt nguyên bản của công trình.",
    ],
    gearUsed: ["Sony A7RV", "FE 16-35mm GM II", "Tripod Geared Head"],
    credits: [
      { memberSlug: "thanh-le", roleOnProject: "Chụp ảnh & Hậu kỳ" },
      { memberSlug: "nguyen-bao", roleOnProject: "Chụp ảnh & IT" },
      { memberSlug: "quang-hoang", roleOnProject: "Chụp ảnh" },
      { memberSlug: "nguyen-bao-photo", roleOnProject: "Chụp ảnh" },
    ],
  },
];

export function getWorkBySlug(slug: string): WorkProject | undefined {
  return WORKS_DATA.find((w) => w.slug === slug);
}

export function getWorksForMember(memberSlug: string): WorkProject[] {
  return WORKS_DATA.filter((w) =>
    w.credits.some((c) => c.memberSlug === memberSlug)
  );
}

export interface TeammateConnection {
  member: CrewMember;
  sharedCount: number;
}

export function getTeammatesForMember(memberSlug: string): TeammateConnection[] {
  const counts = new Map<string, number>();
  for (const work of WORKS_DATA) {
    const involved = work.credits.some((c) => c.memberSlug === memberSlug);
    if (!involved) continue;
    for (const c of work.credits) {
      if (c.memberSlug !== memberSlug) {
        counts.set(c.memberSlug, (counts.get(c.memberSlug) ?? 0) + 1);
      }
    }
  }

  const results: TeammateConnection[] = [];
  counts.forEach((sharedCount, slug) => {
    const found = CREW_MEMBERS.find((m) => m.slug === slug);
    if (found) {
      results.push({ member: found, sharedCount });
    }
  });

  if (results.length < 6) {
    for (const m of CREW_MEMBERS) {
      if (m.slug !== memberSlug && !results.some((r) => r.member.slug === m.slug)) {
        results.push({ member: m, sharedCount: 1 });
        if (results.length >= 6) break;
      }
    }
  }

  return results.sort((a, b) => b.sharedCount - a.sharedCount).slice(0, 6);
}

export type MemberProjectScope = "lead" | "personal" | "ekip";

export interface UnifiedMemberProject {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  roleBadge: string;
  scope: MemberProjectScope;
  accentColor: string;
  cameraSpec: string;
  summary: string;
  coverImage: string;
  frames: string[];
  workSlug?: string;
  coCreators: CrewMember[];
  totalCrewCount: number;
}

/**
 * Merges and deduplicates a member's credited `WORKS_DATA` campaigns and personal `showcase`
 * series into a unified, visual-first project list (Lead Projects -> Personal Albums -> Ekip Campaigns).
 */
export function getUnifiedProjectsForMember(
  member: CrewMember
): UnifiedMemberProject[] {
  const memberWorks = getWorksForMember(member.slug);
  const seenWorkSlugs = new Set<string>();
  const seenCoverImages = new Set<string>();

  const fromWorks: UnifiedMemberProject[] = memberWorks.map((w) => {
    seenWorkSlugs.add(w.slug);
    seenCoverImages.add(w.coverImage);

    const credit = w.credits.find((c) => c.memberSlug === member.slug);
    const isLead =
      w.credits[0]?.memberSlug === member.slug &&
      w.slug !== "hau-truong-thiet-bi-gia";

    const coCreators: CrewMember[] = [];
    for (const c of w.credits) {
      if (c.memberSlug === member.slug) continue;
      const found = CREW_MEMBERS.find((m) => m.slug === c.memberSlug);
      if (found) coCreators.push(found);
    }

    return {
      id: `work-${w.id}`,
      title: w.title,
      subtitle: w.clientOrSeries,
      category: w.category,
      year: w.year,
      roleBadge: credit?.roleOnProject ?? member.roleTitle,
      scope: isLead ? "lead" : "ekip",
      accentColor: w.accentColor,
      cameraSpec: w.cameraSpec,
      summary: w.summary,
      coverImage: w.coverImage,
      frames: w.galleryImages.length > 0 ? w.galleryImages : [w.coverImage],
      workSlug: w.slug,
      coCreators,
      totalCrewCount: w.credits.length,
    };
  });

  const fromShowcase: UnifiedMemberProject[] = [];
  for (const item of member.showcase) {
    if (item.projectSlug && seenWorkSlugs.has(item.projectSlug)) continue;
    const itemFrames =
      item.gallery && item.gallery.length > 0 ? item.gallery : [item.image];
    if (itemFrames.length <= 1 && seenCoverImages.has(item.image)) continue;

    fromShowcase.push({
      id: `showcase-${item.id}`,
      title: item.title,
      subtitle: item.subtitle,
      category: item.durationOrSpec ?? "Bộ Sưu Tập Cá Nhân",
      year: "2026",
      roleBadge: item.durationOrSpec ?? member.roleTitle,
      scope: "personal",
      accentColor: "#FF4D00",
      cameraSpec: member.favoriteGear.join(" • ").toUpperCase(),
      summary:
        item.description ??
        `${item.subtitle} — Thực hiện bởi ${member.name} (${member.roleTitle}).`,
      coverImage: item.image,
      frames: itemFrames,
      workSlug: item.projectSlug,
      coCreators: [],
      totalCrewCount: 1,
    });
  }

  const leadProjects = fromWorks.filter((p) => p.scope === "lead");
  const multiFramePersonal = fromShowcase.filter((p) => p.frames.length > 1);
  const specificEkipProjects = fromWorks.filter(
    (p) => p.scope === "ekip" && p.workSlug !== "hau-truong-thiet-bi-gia"
  );
  const singleFramePersonal = fromShowcase.filter((p) => p.frames.length <= 1);
  const collectiveArchive = fromWorks.filter(
    (p) => p.workSlug === "hau-truong-thiet-bi-gia"
  );

  return [
    ...leadProjects,
    ...multiFramePersonal,
    ...specificEkipProjects,
    ...singleFramePersonal,
    ...collectiveArchive,
  ];
}
