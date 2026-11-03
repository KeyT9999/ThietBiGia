import "server-only";
import { createClient } from "@supabase/supabase-js";
import {
  CREW_MEMBERS,
  KEYT_DANAFF_GALLERY,
  KEYT_NINI_SHOWCASE_ITEM,
  KEYT_SU_KIEN_SHOWCASE_ITEM,
  KEYT_TU_THIEN_SHOWCASE_ITEM,
} from "@/data/crew";
import { WORKS_DATA } from "@/data/works";
import { GEAR_ARSENAL } from "@/data/gear";
import { GROUP_MOMENTS } from "@/data/moments";
import { DEFAULT_ABOUT_CONTENT, DEFAULT_CONTACT_SERVICES, DEFAULT_NAVIGATION_ORDER, SiteContentSchema, type SiteContent } from "@/lib/content-schema";
import { normalizeCrewOrder } from "@/lib/crew-order";
import { normalizeNavigationOrder } from "@/lib/navigation-order";

const KEYT_NINI_MIGRATION_ID = "tkt-nini-v1";
const KEYT_PORTFOLIO_V2_MIGRATION_ID = "tkt-portfolio-2026-v2";

export const DEFAULT_SITE_CONTENT: SiteContent = {
  crew: normalizeCrewOrder(structuredClone(CREW_MEMBERS)),
  works: structuredClone(WORKS_DATA),
  contactServices: structuredClone(DEFAULT_CONTACT_SERVICES),
  partnerOrganizations: [],
  gear: structuredClone(GEAR_ARSENAL),
  moments: structuredClone(GROUP_MOMENTS),
  seededMigrations: [KEYT_NINI_MIGRATION_ID, KEYT_PORTFOLIO_V2_MIGRATION_ID],
  homepage: {
    eyebrow: "CREATIVE MEDIA COLLECTIVE",
    title: "Chúng tôi là Thiết Bị Gia",
    description:
      "Một tập thể sáng tạo đồng hành trong nhiếp ảnh, quay phim và công nghệ. Cùng kể những câu chuyện bằng hình ảnh, âm thanh và góc nhìn riêng.",
    ctaLabel: "KHÁM PHÁ ĐỘI NGŨ",
    heroMediaType: "image",
    heroMediaUrl: "/anhchungtbg.jpg",
    heroMediaAlt: "Đại gia đình Thiết Bị Gia",
  },
  about: structuredClone(DEFAULT_ABOUT_CONTENT),
  settings: {
    brandName: "THIẾT BỊ GIA",
    brandSubtitle: "Creative Media & Design Collective",
    siteDescription:
      "Portfolio tập thể Thiết Bị Gia: nhiếp ảnh, quay phim, hậu kỳ và thiết kế sáng tạo.",
    contactEmail: "booking@thietbigia.vn",
    phone: "(+84) 909 • TBG • CREW",
    location: "Đà Nẵng & TP. Hồ Chí Minh • Sẵn sàng di chuyển toàn quốc",
    instagramUrl: "",
    facebookUrl: "",
    navTimelineLabel: "TIMELINE 3D",
    navProjectsLabel: "PROJECTS",
    navCrewLabel: "CREW",
    navPartnersLabel: "ĐƠN VỊ ĐỒNG HÀNH",
    navOrder: [...DEFAULT_NAVIGATION_ORDER],
    navAboutLabel: "ABOUT & GEAR",
    navContactLabel: "CONTACT",
  },
};

function applySeededMigrations(data: SiteContent): SiteContent {
  const migrations = new Set(data.seededMigrations ?? []);
  let crew = data.crew;
  let works = data.works;

  if (!migrations.has(KEYT_PORTFOLIO_V2_MIGRATION_ID)) {
    const newPersonalItems = [
      KEYT_NINI_SHOWCASE_ITEM,
      KEYT_SU_KIEN_SHOWCASE_ITEM,
      KEYT_TU_THIEN_SHOWCASE_ITEM,
    ];

    crew = crew.map((member) => {
      if (member.id !== "tbg-14" && member.slug !== "tran-kim-thang") {
        return member;
      }

      const updatedShowcase = member.showcase.map((item) => {
        if (item.id === "tkt-2" || item.projectSlug === "lien-hoan-phim-chau-a-danaff") {
          const mergedGallery = Array.from(
            new Set([...KEYT_DANAFF_GALLERY, ...(item.gallery ?? [])])
          );
          return {
            ...item,
            gallery: mergedGallery,
            durationOrSpec: `${mergedGallery.length} FRAMES • RED CARPET`,
          };
        }
        return item;
      });

      const toPrepend = newPersonalItems
        .filter((seed) => !updatedShowcase.some((existing) => existing.id === seed.id))
        .map((seed) => structuredClone(seed));

      const nextGear = member.favoriteGear.includes("Sony A9")
        ? member.favoriteGear
        : ["Sony A9", ...member.favoriteGear].slice(0, 4);

      return {
        ...member,
        favoriteGear: nextGear,
        showcase: [...toPrepend, ...updatedShowcase],
      };
    });

    works = works.map((work) => {
      if (work.slug !== "lien-hoan-phim-chau-a-danaff") {
        return work;
      }
      const mergedImages = Array.from(
        new Set([...KEYT_DANAFF_GALLERY, ...work.galleryImages])
      );
      return {
        ...work,
        galleryImages: mergedImages,
        exifSpec:
          "SONY ILCE-6400 • SIGMA 18-50MM F2.8 DC DN • 18–50mm • f/3.5–5.6 • 1/100–1/200s • ISO 100–640",
      };
    });

    migrations.add(KEYT_NINI_MIGRATION_ID);
    migrations.add(KEYT_PORTFOLIO_V2_MIGRATION_ID);
  }

  return {
    ...data,
    crew: normalizeCrewOrder(crew),
    works,
    seededMigrations: Array.from(migrations),
  };
}

function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export async function getPublicSiteContent(): Promise<SiteContent> {
  const client = createPublicClient();
  if (!client) return DEFAULT_SITE_CONTENT;

  try {
    const result = await client
      .from("site_content")
      .select("content")
      .eq("id", "primary")
      .maybeSingle();
    if (result.error || !result.data?.content) return DEFAULT_SITE_CONTENT;
    const parsed = parseSiteContent(result.data.content);
    return parsed.success ? parsed.data : DEFAULT_SITE_CONTENT;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export function parseSiteContent(input: unknown) {
  const parsed = SiteContentSchema.safeParse(input);
  if (!parsed.success) return parsed;

  const migrated = applySeededMigrations(parsed.data);
  return {
    ...parsed,
    data: {
      ...migrated,
      settings: {
        ...migrated.settings,
        navOrder: normalizeNavigationOrder(migrated.settings.navOrder),
      },
    },
  };
}
