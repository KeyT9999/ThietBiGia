import { z } from "zod";

export const RoleCategorySchema = z.enum(["chup-anh", "quay-phim", "it-tech"]);

export const BentoItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  year: z.string().optional(),
  kind: z.enum(["reel", "photo", "poster", "motion"]),
  span: z.enum(["wide", "tall", "normal"]),
  image: z.string(),
  gallery: z.array(z.string()).optional(),
  description: z.string().optional(),
  projectSlug: z.string().optional(),
  durationOrSpec: z.string(),
  exifSpec: z.string().optional(),
  videoUrl: z.string().optional(),
  externalUrl: z.string().optional(),
});

export const CrewMemberSchema = z.object({
  id: z.string(),
  badgeNumber: z.string(),
  slug: z.string(),
  name: z.string(),
  nickname: z.string().optional(),
  roleCategory: RoleCategorySchema,
  roles: z.array(RoleCategorySchema),
  roleTitle: z.string(),
  secondaryRoles: z.array(z.string()),
  bio: z.string(),
  avatar: z.string(),
  avatarAlt: z.string().optional(),
  favoriteGear: z.array(z.string()),
  yearsActive: z.string(),
  location: z.string(),
  socials: z.object({
    instagram: z.string().optional(),
    behance: z.string().optional(),
    facebook: z.string().optional(),
    email: z.string().optional(),
  }),
  showcase: z.array(BentoItemSchema),
  profileSharedWorkIds: z.array(z.string()).optional(),
  profileProjectOrder: z.array(z.string()).optional(),
});

export const ProjectCreditSchema = z.object({
  memberSlug: z.string(),
  roleOnProject: z.string(),
});

export const WorkProjectSchema = z.object({
  id: z.string(),
  indexLabel: z.string(),
  slug: z.string(),
  title: z.string(),
  clientOrSeries: z.string(),
  category: z.string(),
  year: z.string(),
  durationTimecode: z.string(),
  coverImage: z.string(),
  accentColor: z.string(),
  cameraSpec: z.string(),
  exifSpec: z.string().optional(),
  beforeImage: z.string().optional(),
  videoUrl: z.string().optional(),
  summary: z.string(),
  videoEmbedUrl: z.string().optional(),
  galleryImages: z.array(z.string()),
  galleryDriveFolderUrl: z.string().optional(),
  btsNotes: z.array(z.string()),
  gearUsed: z.array(z.string()),
  credits: z.array(ProjectCreditSchema),
});

export type CrewMember = z.infer<typeof CrewMemberSchema>;
export type BentoItem = z.infer<typeof BentoItemSchema>;
export type WorkProject = z.infer<typeof WorkProjectSchema>;
export type ProjectCredit = z.infer<typeof ProjectCreditSchema>;
