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

export const AboutContentSchema = z.object({
  title: z.string().max(180),
  introduction: z.string().max(3000),
  storyTitle: z.string().max(180),
  storyBody: z.string().max(5000),
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
