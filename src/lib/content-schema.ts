import { z } from "zod";
import { CrewMemberSchema, PartnerOrganizationSchema, WorkProjectSchema } from "@/data/schema";

export const DEFAULT_CONTACT_SERVICES = [
  { id: "tron-goi-ekip-quay-chup", label: "Trọn gói Ekip Quay & Chụp" },
  { id: "photographer", label: "Photographer (Thời trang / Sự kiện / Sản phẩm)" },
  { id: "quay-mv-tvc-phim-ngan", label: "Quay MV / TVC / Phim ngắn (DOP & Cam)" },
  { id: "dung-video-color-grading", label: "Dựng Video, Color Grading & Same-Day Edit" },
  { id: "key-visual-3d-motion", label: "Key Visual, 3D Motion & Thiết kế Sân khấu" },
  { id: "lighting-gaffer-thiet-bi", label: "Hỗ trợ Lighting, Gaffer & Thiết bị" },
];

export const NAVIGATION_ITEM_IDS = ["timeline", "projects", "crew", "partners", "about", "contact"] as const;
export const DEFAULT_NAVIGATION_ORDER = [...NAVIGATION_ITEM_IDS];
export const NavigationItemIdSchema = z.enum(NAVIGATION_ITEM_IDS);

export const ContactServiceSchema = z.object({
  id: z.string().min(1).max(120),
  label: z.string().trim().min(1).max(240),
});

const GearItemSchema = z.object({
  name: z.string(),
  spec: z.string(),
  tag: z.string(),
});
const GearCategorySchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  subtitle: z.string(),
  items: z.array(GearItemSchema),
});
const GroupMomentSchema = z.object({
  id: z.string(),
  frameCode: z.string(),
  src: z.string(),
  title: z.string(),
  caption: z.string(),
  location: z.string(),
  filmStock: z.string(),
  dateLabel: z.string(),
  category: z.enum(["dai-gia-dinh", "hau-truong", "doi-thuong"]),
  onFilmStrip: z.boolean().optional(),
  detectedFaceCount: z.number().optional(),
  memberSlugs: z.array(z.string()).optional(),
  memberNames: z.array(z.string()).optional(),
});

export const HomeIntroSchema = z.object({
  eyebrow: z.string().max(120),
  title: z.string().min(1).max(180),
  description: z.string().max(3000),
  ctaLabel: z.string().max(80),
  heroMediaType: z.enum(["image", "youtube"]),
  heroMediaUrl: z.string().max(2000),
  heroMediaAlt: z.string().max(240),
});

export const DEFAULT_ABOUT_CONTENT = {
  eyebrow: "MANIFESTO // GIỚI THIỆU ĐẠI GIA ĐÌNH THIẾT BỊ GIA",
  title: "Một đội ngũ, nhiều góc nhìn",
  introduction:
    "Thiết Bị Gia kết nối những người yêu hình ảnh, phim ảnh và công nghệ để cùng tạo nên các sản phẩm sáng tạo.",
  storyTitle: "Cùng nhau tạo nên câu chuyện",
  storyBody:
    "Từ ý tưởng, ghi hình đến hậu kỳ, mỗi thành viên góp một góc nhìn và một kỹ năng để hoàn thiện dự án.",
  heroBanner: {
    imageUrl: "/media/group/tbg-group-01.jpg",
    imageAlt: "Đại Gia Đình Thiết Bị Gia FUDA Trên Đồi Hoàng Hôn",
    label: "COLLECTIVE MASTERFRAME // FUDA MASTERALBUM",
    badge: "30+ ANH CHỊ EM TRONG KHUNG HÌNH",
    location: "ĐỒI HOÀNG HÔN • ĐÀ NẴNG",
    title: "ĐẠI GIA ĐÌNH THIẾT BỊ GIA — HƠN CẢ MỘT EKIP BẤM MÁY",
    description:
      "Từ giảng đường FUDA, phòng chụp studio đến những chuyến thiện nguyện vùng cao và sân khấu hàng nghìn khán giả.",
    archiveButtonLabel: "KHÁM PHÁ TOÀN BỘ {count} ẢNH CHUNG ↓",
  },
  metrics: [
    { id: "team", value: "16+", label: "Thành viên ekip" },
    { id: "archive", value: "310+", label: "Ảnh chung lưu trữ" },
    { id: "works", value: "40+", label: "Set quay & Sự kiện" },
  ],
  pipeline: {
    eyebrow: "FULL PIPELINE",
    title: "Tiền kỳ → Hiện trường → Hậu kỳ 4K RAW & Web 3D",
    bookingLabel: "BOOKING →",
  },
  archiveJumpLabel: "XEM KHO ẢNH CHUNG [{count}] ↓",
  crewJumpLabel: "GẶP {count} THÀNH VIÊN →",
  filmStripEyebrow: "35MM CONTACT SHEET // TRỌN BỘ {count} ẢNH CHUNG TẬP THỂ",
  filmStripTitle: "CUỘN PHIM KỶ NIỆM ANH EM THIẾT BỊ GIA",
  filmStripDescription:
    "Lướt ngang hoặc kéo trực tiếp dải phim nhựa 35mm gồm đầy đủ {count} khoảnh khắc tập thể của anh em Thiết Bị Gia — nhấn vào từng frame để xem rõ toàn màn hình.",
  albumEyebrow: "COLLECTIVE PHOTO ARCHIVE // TỪ THƯ MỤC ẢNH NHÓM TBG",
  albumTitle: "KHO ẢNH CHUNG ĐẠI GIA ĐÌNH THIẾT BỊ GIA",
  albumDescription:
    "Những khung hình tập thể từ các buổi hội quân, hậu trường set đèn, sân khấu lớn, đêm lửa trại và chuyến dã ngoại bên nhau.",
  disciplinesEyebrow: "DISCIPLINES // 01 — 04",
  disciplinesTitle: "BỐN MŨI NHỌN CỦA NHÓM",
  pillars: [
    {
      id: "photography",
      icon: "aperture" as const,
      code: "01 // PHOTOGRAPHY",
      title: "Nhiếp Ảnh Thương Mại & Sự Kiện",
      description:
        "Từ Studio Lookbook 102MP Medium Format, kiến trúc Tilt-Shift đến đại nhạc hội hàng chục nghìn khán giả trả ảnh realtime.",
    },
    {
      id: "cinematography",
      icon: "clapperboard" as const,
      code: "02 // CINEMATOGRAPHY",
      title: "Quay Phim Điện Ảnh & FPV",
      description:
        "Làm chủ ngôn ngữ ống kính Anamorphic, hệ thống đèn CRMX công suất lớn, Car-Rig tốc độ cao và Drone FPV xuyên không gian.",
    },
    {
      id: "post-production",
      icon: "layers" as const,
      code: "03 // POST-PRODUCTION",
      title: "Dựng Phim, Color Grading & Sound",
      description:
        "Quy trình hậu kỳ chuẩn ACEScct trên DaVinci Resolve, dựng Same-Day Edit thần tốc ngay tại hiện trường và thiết kế âm thanh.",
    },
    {
      id: "design-3d-motion",
      icon: "cpu" as const,
      code: "04 // DESIGN & 3D MOTION",
      title: "Art Direction, Key Visual & VFX",
      description:
        "Xây dựng trọn vẹn bộ nhận diện chiến dịch, thiết kế sân khấu LED 8K, 3D CGI và poster chuẩn lưới đồ họa hiện đại.",
    },
  ],
  gearEyebrow: "EQUIPMENT LOCKER // VŨ KHÍ TÁC NGHIỆP",
  gearTitle: "KHO THIẾT BỊ CHỦ LỰC CỦA THIẾT BỊ GIA",
  bottomCta: {
    eyebrow: "READY FOR SET",
    title: "Cần một Photographer riêng lẻ hay trọn gói cả Ekip Sản Xuất?",
    description:
      "Chọn đúng người hoặc để Thiết Bị Gia ráp đội hình phù hợp nhất cho dự án của bạn.",
    bookingLabel: "ĐẶT LỊCH EKIP NGAY",
    timelineLabel: "XEM TIMELINE 3D",
  },
};

const AboutMetricSchema = z.object({
  id: z.string().min(1).max(80),
  value: z.string().max(80),
  label: z.string().max(180),
});

const AboutPillarSchema = z.object({
  id: z.string().min(1).max(100),
  icon: z.enum(["aperture", "clapperboard", "layers", "cpu"]),
  code: z.string().max(120),
  title: z.string().max(180),
  description: z.string().max(2000),
});

const AboutHeroBannerSchema = z.object({
  imageUrl: z.string().max(2000).default(DEFAULT_ABOUT_CONTENT.heroBanner.imageUrl),
  imageAlt: z.string().max(240).default(DEFAULT_ABOUT_CONTENT.heroBanner.imageAlt),
  label: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.heroBanner.label),
  badge: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.heroBanner.badge),
  location: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.heroBanner.location),
  title: z.string().max(240).default(DEFAULT_ABOUT_CONTENT.heroBanner.title),
  description: z.string().max(2000).default(DEFAULT_ABOUT_CONTENT.heroBanner.description),
  archiveButtonLabel: z.string().max(120).default(DEFAULT_ABOUT_CONTENT.heroBanner.archiveButtonLabel),
});

const AboutPipelineSchema = z.object({
  eyebrow: z.string().max(120).default(DEFAULT_ABOUT_CONTENT.pipeline.eyebrow),
  title: z.string().max(240).default(DEFAULT_ABOUT_CONTENT.pipeline.title),
  bookingLabel: z.string().max(120).default(DEFAULT_ABOUT_CONTENT.pipeline.bookingLabel),
});

const AboutBottomCtaSchema = z.object({
  eyebrow: z.string().max(120).default(DEFAULT_ABOUT_CONTENT.bottomCta.eyebrow),
  title: z.string().max(240).default(DEFAULT_ABOUT_CONTENT.bottomCta.title),
  description: z.string().max(2000).default(DEFAULT_ABOUT_CONTENT.bottomCta.description),
  bookingLabel: z.string().max(120).default(DEFAULT_ABOUT_CONTENT.bottomCta.bookingLabel),
  timelineLabel: z.string().max(120).default(DEFAULT_ABOUT_CONTENT.bottomCta.timelineLabel),
});

export const AboutContentSchema = z.object({
  eyebrow: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.eyebrow),
  title: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.title),
  introduction: z.string().max(3000).default(DEFAULT_ABOUT_CONTENT.introduction),
  storyTitle: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.storyTitle),
  storyBody: z.string().max(5000).default(DEFAULT_ABOUT_CONTENT.storyBody),
  heroBanner: AboutHeroBannerSchema.default(DEFAULT_ABOUT_CONTENT.heroBanner),
  metrics: z.array(AboutMetricSchema).max(6).default(DEFAULT_ABOUT_CONTENT.metrics),
  pipeline: AboutPipelineSchema.default(DEFAULT_ABOUT_CONTENT.pipeline),
  archiveJumpLabel: z.string().max(120).default(DEFAULT_ABOUT_CONTENT.archiveJumpLabel),
  crewJumpLabel: z.string().max(120).default(DEFAULT_ABOUT_CONTENT.crewJumpLabel),
  filmStripEyebrow: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.filmStripEyebrow),
  filmStripTitle: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.filmStripTitle),
  filmStripDescription: z.string().max(1000).default(DEFAULT_ABOUT_CONTENT.filmStripDescription),
  albumEyebrow: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.albumEyebrow),
  albumTitle: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.albumTitle),
  albumDescription: z.string().max(1000).default(DEFAULT_ABOUT_CONTENT.albumDescription),
  disciplinesEyebrow: z.string().max(120).default(DEFAULT_ABOUT_CONTENT.disciplinesEyebrow),
  disciplinesTitle: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.disciplinesTitle),
  pillars: z.array(AboutPillarSchema).max(12).default(DEFAULT_ABOUT_CONTENT.pillars),
  gearEyebrow: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.gearEyebrow),
  gearTitle: z.string().max(180).default(DEFAULT_ABOUT_CONTENT.gearTitle),
  bottomCta: AboutBottomCtaSchema.default(DEFAULT_ABOUT_CONTENT.bottomCta),
});

export const SiteSettingsSchema = z.object({
  brandName: z.string().min(1).max(120),
  brandSubtitle: z.string().max(180),
  siteDescription: z.string().max(500),
  contactEmail: z.string().max(180),
  phone: z.string().max(80),
  location: z.string().max(180),
  instagramUrl: z.string().max(500),
  facebookUrl: z.string().max(500),
  navTimelineLabel: z.string().max(80),
  navProjectsLabel: z.string().max(80),
  navCrewLabel: z.string().max(80),
  navPartnersLabel: z.string().max(80).default("ĐƠN VỊ ĐỒNG HÀNH"),
  navOrder: z.array(NavigationItemIdSchema).max(NAVIGATION_ITEM_IDS.length).default(DEFAULT_NAVIGATION_ORDER),
  navAboutLabel: z.string().max(80),
  navContactLabel: z.string().max(80),
});

export const SiteContentSchema = z.object({
  crew: z.array(CrewMemberSchema).min(1).max(100),
  works: z.array(WorkProjectSchema).min(1).max(500),
  contactServices: z.array(ContactServiceSchema).max(100).default(DEFAULT_CONTACT_SERVICES),
  partnerOrganizations: z.array(PartnerOrganizationSchema).max(300).default([]),
  gear: z.array(GearCategorySchema).max(100),
  moments: z.array(GroupMomentSchema).max(1000),
  homepage: HomeIntroSchema,
  about: AboutContentSchema,
  settings: SiteSettingsSchema,
  seededMigrations: z.array(z.string()).max(200).optional(),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;
export type HomeIntroContent = z.infer<typeof HomeIntroSchema>;
export type AboutContent = z.infer<typeof AboutContentSchema>;
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
export type ContactService = z.infer<typeof ContactServiceSchema>;
export type NavigationItemId = z.infer<typeof NavigationItemIdSchema>;
