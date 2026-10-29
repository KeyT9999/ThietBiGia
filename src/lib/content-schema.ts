import { z } from "zod";
import { CrewMemberSchema, WorkProjectSchema } from "@/data/schema";

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
  navAboutLabel: z.string().max(80),
  navContactLabel: z.string().max(80),
});

export const SiteContentSchema = z.object({
  crew: z.array(CrewMemberSchema).min(1).max(100),
  works: z.array(WorkProjectSchema).min(1).max(500),
  gear: z.array(GearCategorySchema).max(100),
  moments: z.array(GroupMomentSchema).max(1000),
  homepage: HomeIntroSchema,
  about: AboutContentSchema,
  settings: SiteSettingsSchema,
});

export type SiteContent = z.infer<typeof SiteContentSchema>;
export type HomeIntroContent = z.infer<typeof HomeIntroSchema>;
export type AboutContent = z.infer<typeof AboutContentSchema>;
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
