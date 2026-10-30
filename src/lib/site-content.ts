import "server-only";
import { createClient } from "@supabase/supabase-js";
import { CREW_MEMBERS } from "@/data/crew";
import { WORKS_DATA } from "@/data/works";
import { GEAR_ARSENAL } from "@/data/gear";
import { GROUP_MOMENTS } from "@/data/moments";
import { SiteContentSchema, type SiteContent } from "@/lib/content-schema";
import { normalizeCrewOrder } from "@/lib/crew-order";

export const DEFAULT_SITE_CONTENT: SiteContent = {
  crew: normalizeCrewOrder(structuredClone(CREW_MEMBERS)),
  works: structuredClone(WORKS_DATA),
  gear: structuredClone(GEAR_ARSENAL),
  moments: structuredClone(GROUP_MOMENTS),
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
  about: {
    title: "Một đội ngũ, nhiều góc nhìn",
    introduction:
      "Thiết Bị Gia kết nối những người yêu hình ảnh, phim ảnh và công nghệ để cùng tạo nên các sản phẩm sáng tạo.",
    storyTitle: "Cùng nhau tạo nên câu chuyện",
    storyBody:
      "Từ ý tưởng, ghi hình đến hậu kỳ, mỗi thành viên góp một góc nhìn và một kỹ năng để hoàn thiện dự án.",
  },
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
    navAboutLabel: "ABOUT & GEAR",
    navContactLabel: "CONTACT",
  },
};

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

  return {
    ...parsed,
    data: {
      ...parsed.data,
      crew: normalizeCrewOrder(parsed.data.crew),
    },
  };
}
