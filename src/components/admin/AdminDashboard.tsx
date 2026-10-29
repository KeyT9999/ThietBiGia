"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LogOut, Plus, Save, Search } from "lucide-react";
import type { CrewMember, WorkProject } from "@/data/schema";
import type { SiteContent } from "@/lib/content-schema";
import { useSetSiteContent } from "@/lib/store";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toYoutubeEmbedUrl } from "@/lib/youtube";
import { AdminField, AdminImageField } from "./AdminFields";
import { GearManager, GroupMomentsManager } from "./AboutToolsEditor";
import { MemberEditor } from "./MemberEditor";
import { ProjectEditor } from "./ProjectEditor";
import { moveCrewMemberToBadgeNumber, normalizeCrewOrder } from "@/lib/crew-order";

type Tab = "home" | "members" | "projects" | "about" | "settings";
const tabs: { id: Tab; label: string }[] = [
  { id: "home", label: "Trang chủ" },
  { id: "members", label: "Thành viên" },
  { id: "projects", label: "Dự án" },
  { id: "about", label: "About & kho ảnh" },
  { id: "settings", label: "Cài đặt website" },
];

export function AdminDashboard() {
  const router = useRouter();
  const updateSiteContent = useSetSiteContent();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [memberId, setMemberId] = useState("");
  const [workId, setWorkId] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [workSearch, setWorkSearch] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/content", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (response.status === 401) {
          router.replace("/admin/login");
          return null;
        }
        if (!response.ok) throw new Error(result.error || "Không đọc được nội dung.");
        return result;
      })
      .then((result) => {
        if (!alive || !result) return;
        setContent(result.content as SiteContent);
        setSavedSnapshot(JSON.stringify(result.content));
        setMemberId(result.content.crew[0]?.id ?? "");
        setWorkId(result.content.works[0]?.id ?? "");
      })
      .catch((cause) => {
        if (alive) setError(cause instanceof Error ? cause.message : "Không tải được nội dung.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [router]);

  const member = useMemo(() => content?.crew.find((item) => item.id === memberId) ?? null, [content, memberId]);
  const work = useMemo(() => content?.works.find((item) => item.id === workId) ?? null, [content, workId]);
  const isDirty = Boolean(content && JSON.stringify(content) !== savedSnapshot);
  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    return (content?.crew ?? []).filter((item) => !query || `${item.name} ${item.nickname ?? ""} ${item.slug} ${item.badgeNumber} ${item.roleTitle}`.toLowerCase().includes(query));
  }, [content, memberSearch]);
  const filteredWorks = useMemo(() => {
    const query = workSearch.trim().toLowerCase();
    return (content?.works ?? []).filter((item) => !query || `${item.title} ${item.slug} ${item.clientOrSeries} ${item.category} ${item.year}`.toLowerCase().includes(query));
  }, [content, workSearch]);

  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [isDirty]);

  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((current) => current ? { ...current, [key]: value } : current);
    setNotice("");
  }

  function updateMember(memberId: string, patch: Partial<CrewMember>) {
    setContent((current) => {
      if (!current) return current;
      const oldMember = current.crew.find((item) => item.id === memberId);
      if (!oldMember) return current;
      const updated = { ...oldMember, ...patch };
      const crew = patch.badgeNumber !== undefined
        ? moveCrewMemberToBadgeNumber(current.crew, memberId, patch.badgeNumber).map((item) =>
            item.id === memberId ? { ...updated, badgeNumber: item.badgeNumber } : item
          )
        : normalizeCrewOrder(current.crew.map((item) => item.id === memberId ? updated : item));
      return {
        ...current,
        crew,
        works: oldMember.slug === updated.slug ? current.works : current.works.map((item) => ({
          ...item,
          credits: item.credits.map((credit) => credit.memberSlug === oldMember.slug ? { ...credit, memberSlug: updated.slug } : credit),
        })),
        moments: oldMember.slug === updated.slug && oldMember.name === updated.name ? current.moments : current.moments.map((moment) => {
          const isTagged = moment.memberSlugs?.includes(oldMember.slug) ?? false;
          return {
            ...moment,
            memberSlugs: oldMember.slug === updated.slug ? moment.memberSlugs : moment.memberSlugs?.map((slug) => slug === oldMember.slug ? updated.slug : slug),
            memberNames: isTagged && oldMember.name !== updated.name
              ? moment.memberNames?.map((name) => name === oldMember.name ? updated.name : name)
              : moment.memberNames,
          };
        }),
      };
    });
    setNotice("");
  }

  function addMember() {
    if (!content) return;
    const number = String(content.crew.length + 1).padStart(2, "0");
    const newMember: CrewMember = {
      id: "member-" + Date.now(), badgeNumber: number, slug: "thanh-vien-moi-" + number,
      name: "Thành viên mới", roleCategory: "chup-anh", roles: ["chup-anh"],
      roleTitle: "Thành viên", secondaryRoles: [], bio: "", avatar: "/anhchungtbg.jpg",
      favoriteGear: [], yearsActive: "THIẾT BỊ GIA", location: "VIỆT NAM", socials: {}, showcase: [],
    };
    setContent({ ...content, crew: normalizeCrewOrder([...content.crew, newMember]) });
    setMemberId(newMember.id);
    setNotice("");
  }

  function deleteMember() {
    if (!content || !member || content.crew.length <= 1) return;
    if (!window.confirm("Xóa hồ sơ " + member.name + "?")) return;
    const slug = member.slug;
    const crew = normalizeCrewOrder(content.crew.filter((item) => item.id !== member.id));
    setContent({
      ...content,
      crew,
      works: content.works.map((item) => ({ ...item, credits: item.credits.filter((credit) => credit.memberSlug !== slug) })),
      moments: content.moments.map((item) => {
        const wasTagged = item.memberSlugs?.includes(slug) ?? false;
        return {
          ...item,
          memberSlugs: item.memberSlugs?.filter((itemSlug) => itemSlug !== slug),
          memberNames: wasTagged ? item.memberNames?.filter((name) => name !== member.name) : item.memberNames,
        };
      }),
    });
    setMemberId(crew[0]?.id ?? "");
  }

  function addWork() {
    if (!content) return;
    const number = String(content.works.length + 1).padStart(2, "0");
    const newWork: WorkProject = {
      id: "work-" + Date.now(), indexLabel: number, slug: "du-an-moi-" + number,
      title: "Dự án mới", clientOrSeries: "Thiết Bị Gia", category: "Quay phim & Nhiếp ảnh",
      year: String(new Date().getFullYear()), durationTimecode: "00:00:00:00",
      coverImage: "/media/works/work-01.jpg", accentColor: "#FF4D00", cameraSpec: "",
      summary: "", galleryImages: [], btsNotes: [], gearUsed: [], credits: [],
    };
    setContent({ ...content, works: [...content.works, newWork] });
    setWorkId(newWork.id);
    setNotice("");
  }

  function deleteWork() {
    if (!content || !work || content.works.length <= 1) return;
    if (!window.confirm("Xóa dự án " + work.title + "?")) return;
    setContent({
      ...content,
      works: content.works.filter((item) => item.id !== work.id),
      crew: content.crew.map((item) => ({
        ...item,
        profileSharedWorkIds: item.profileSharedWorkIds?.filter((id) => id !== work.id),
        profileProjectOrder: item.profileProjectOrder?.filter((id) => id !== `work-${work.id}`),
      })),
    });
    setWorkId(content.works.find((item) => item.id !== work.id)?.id ?? "");
  }

  function updateWork(workId: string, patch: Partial<WorkProject>) {
    setContent((current) => {
      if (!current) return current;
      const works = current.works.map((item) => item.id === workId ? { ...item, ...patch } : item);
      const changed = works.find((item) => item.id === workId);
      const crew = patch.credits && changed
        ? current.crew.map((member) => {
            if (member.profileSharedWorkIds === undefined || changed.credits.some((credit) => credit.memberSlug === member.slug)) return member;
            return { ...member, profileSharedWorkIds: member.profileSharedWorkIds.filter((id) => id !== workId) };
          })
        : current.crew;
      return { ...current, works, crew };
    });
    setNotice("");
  }

  async function save() {
    if (!content || !isDirty) return;
    setSaving(true);
    setError("");
    setNotice("");
    const submittedContent = JSON.stringify(content);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: submittedContent,
      });
      const result = await response.json();
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Không lưu được dữ liệu.");
      const savedContent = result.content as SiteContent;
      setContent((current) => JSON.stringify(current) === submittedContent ? savedContent : current);
      setSavedSnapshot(JSON.stringify(savedContent));
      updateSiteContent(result.content as SiteContent);
      setNotice("Đã lưu nội dung vào Supabase.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được dữ liệu.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    if (isDirty && !window.confirm("Bạn còn thay đổi chưa lưu. Thoát và bỏ các thay đổi này?")) return;
    await createSupabaseBrowserClient()?.auth.signOut();
    router.replace("/admin/login");
  }

  useEffect(() => {
    if (isDirty) setError("");
  }, [isDirty]);

  if (loading) return <main className="min-h-screen bg-obsidian px-5 pt-32 text-center font-mono text-sm text-ivory-muted">ĐANG TẢI BẢNG QUẢN TRỊ...</main>;
  if (!content) {
    return (
      <main className="min-h-screen bg-obsidian px-5 pb-16 pt-28 text-ivory">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-obsidian-surface p-6 sm:p-9">
          <p className="font-mono text-xs text-rec">THIẾT BỊ GIA / ADMIN</p>
          <h1 className="mt-3 font-display text-3xl font-bold">Chưa kết nối được CMS</h1>
          <p className="mt-3 text-sm leading-relaxed text-ivory-muted">{error}</p>
          <p className="mt-4 text-sm leading-relaxed text-ivory-muted">Hãy cấu hình Supabase, chạy migration trong supabase/migrations rồi tải lại trang.</p>
          <button onClick={() => router.refresh()} className="mt-6 rounded-xl bg-rec px-4 py-2.5 text-xs font-mono font-bold text-obsidian">THỬ LẠI</button>
        </div>
      </main>
    );
  }

  const home = content.homepage;

  return (
    <main className="min-h-screen bg-[#0b0c10] px-4 pb-20 pt-24 text-ivory sm:px-7">
      <div className="mx-auto max-w-[1480px]">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-rec">THIẾT BỊ GIA / CONTENT STUDIO</p>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Quản trị website</h1>
            <p className="mt-2 text-sm text-ivory-muted">Nội dung được lưu tập trung trong Supabase.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={"hidden text-xs sm:inline " + (isDirty ? "text-amber-300" : "text-emerald-300")}>{isDirty ? "Có thay đổi chưa lưu" : "Mọi thay đổi đã lưu"}</span>
            <button type="button" onClick={save} disabled={saving || !isDirty} className="inline-flex items-center gap-2 rounded-xl bg-rec px-4 py-3 text-xs font-mono font-bold text-obsidian disabled:cursor-not-allowed disabled:opacity-45">
              <Save className="h-4 w-4" /> {saving ? "ĐANG LƯU..." : isDirty ? "LƯU THAY ĐỔI" : "ĐÃ LƯU"}
            </button>
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-mono text-ivory-muted hover:text-ivory"><LogOut className="h-4 w-4" /> THOÁT</button>
          </div>
        </header>

        {error ? <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
        {notice ? <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"><Check className="h-4 w-4" />{notice}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={"shrink-0 rounded-xl px-4 py-3 text-left text-sm transition " + (tab === item.id ? "bg-rec font-bold text-obsidian" : "border border-white/10 bg-white/[0.025] text-ivory-muted hover:text-ivory")}>{item.label}</button>)}
          </nav>

          <section className="min-w-0 space-y-5">
            {tab === "home" ? (
              <div className="grid gap-5 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
                <div><h2 className="font-display text-2xl font-bold">Giới thiệu trang chủ</h2><p className="mt-1 text-sm text-ivory-muted">Phần mở đầu mà khách truy cập nhìn thấy đầu tiên.</p></div>
                <AdminField label="Eyebrow" value={home.eyebrow} onChange={(eyebrow) => update("homepage", { ...home, eyebrow })} />
                <AdminField label="Tiêu đề" value={home.title} onChange={(title) => update("homepage", { ...home, title })} />
                <AdminField label="Lời giới thiệu" value={home.description} multiline rows={5} onChange={(description) => update("homepage", { ...home, description })} />
                <AdminField label="Nhãn nút xem đội ngũ" value={home.ctaLabel} onChange={(ctaLabel) => update("homepage", { ...home, ctaLabel })} />
                <label className="block space-y-1.5"><span className="text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">Media giới thiệu</span><select value={home.heroMediaType} onChange={(event) => update("homepage", { ...home, heroMediaType: event.target.value as "image" | "youtube" })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm text-ivory"><option value="image">Ảnh Cloudinary</option><option value="youtube">Video YouTube</option></select></label>
                {home.heroMediaType === "image" ? <AdminImageField label="Ảnh nhóm" value={home.heroMediaUrl} folder="thiet-bi-gia/home" onChange={(heroMediaUrl) => update("homepage", { ...home, heroMediaUrl })} /> : <AdminField label="Link video YouTube" value={home.heroMediaUrl} onChange={(heroMediaUrl) => update("homepage", { ...home, heroMediaUrl })} hint="Dán link watch, Shorts hoặc youtu.be." />}
                {home.heroMediaType === "youtube" && home.heroMediaUrl && !toYoutubeEmbedUrl(home.heroMediaUrl) ? <p className="text-xs text-amber-300">Link chưa đúng định dạng YouTube.</p> : null}
                <AdminField label="Mô tả ảnh/video" value={home.heroMediaAlt} onChange={(heroMediaAlt) => update("homepage", { ...home, heroMediaAlt })} />
              </div>
            ) : null}

            {tab === "members" ? (
              <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="space-y-3 rounded-3xl border border-white/10 bg-obsidian-surface p-4">
                  <div className="flex items-center justify-between gap-2"><h2 className="font-display text-xl font-bold">Thành viên ({content.crew.length})</h2><button type="button" onClick={addMember} className="rounded-lg bg-rec p-2 text-obsidian" title="Thêm thành viên"><Plus className="h-4 w-4" /></button></div>
                  <p className="text-xs text-ivory-subtle">Danh sách được sắp theo số thẻ.</p>
                  <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-subtle" /><input value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Tìm tên, số thẻ, vai trò..." aria-label="Tìm thành viên" className="w-full rounded-xl border border-white/10 bg-obsidian py-2.5 pl-9 pr-3 text-sm text-ivory outline-none placeholder:text-ivory-subtle focus:border-rec" /></label>
                  <div className="max-h-[65vh] space-y-1 overflow-y-auto">{filteredMembers.map((item) => <button key={item.id} type="button" onClick={() => setMemberId(item.id)} className={"w-full rounded-lg px-3 py-2 text-left text-sm " + (item.id === memberId ? "bg-white/10 text-ivory" : "text-ivory-muted hover:bg-white/5 hover:text-ivory")}><span className="font-mono text-[10px] text-rec">#{item.badgeNumber}</span><span className="ml-2">{item.name}</span></button>)}{filteredMembers.length === 0 ? <p className="rounded-lg px-3 py-4 text-sm text-ivory-subtle">Không tìm thấy thành viên.</p> : null}</div>
                </div>
                {member ? <MemberEditor member={member} memberCount={content.crew.length} works={content.works} crew={content.crew} canDelete={content.crew.length > 1} onChange={(patch) => updateMember(member.id, patch)} onDelete={deleteMember} /> : null}
              </div>
            ) : null}

            {tab === "projects" ? (
              <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="space-y-3 rounded-3xl border border-white/10 bg-obsidian-surface p-4">
                  <div className="flex items-center justify-between gap-2"><h2 className="font-display text-xl font-bold">Dự án ({content.works.length})</h2><button type="button" onClick={addWork} className="rounded-lg bg-rec p-2 text-obsidian" title="Thêm dự án"><Plus className="h-4 w-4" /></button></div>
                  <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-subtle" /><input value={workSearch} onChange={(event) => setWorkSearch(event.target.value)} placeholder="Tìm tên, khách hàng, năm..." aria-label="Tìm dự án" className="w-full rounded-xl border border-white/10 bg-obsidian py-2.5 pl-9 pr-3 text-sm text-ivory outline-none placeholder:text-ivory-subtle focus:border-rec" /></label>
                  <div className="max-h-[65vh] space-y-1 overflow-y-auto">{filteredWorks.map((item) => <button key={item.id} type="button" onClick={() => setWorkId(item.id)} className={"w-full rounded-lg px-3 py-2 text-left text-sm " + (item.id === workId ? "bg-white/10 text-ivory" : "text-ivory-muted hover:bg-white/5 hover:text-ivory")}><span className="font-mono text-[10px] text-rec">{item.indexLabel}</span><span className="ml-2">{item.title}</span></button>)}{filteredWorks.length === 0 ? <p className="rounded-lg px-3 py-4 text-sm text-ivory-subtle">Không tìm thấy dự án.</p> : null}</div>
                </div>
                {work ? <ProjectEditor work={work} crew={content.crew} canDelete={content.works.length > 1} onChange={(patch) => updateWork(work.id, patch)} onDelete={deleteWork} /> : null}
              </div>
            ) : null}

            {tab === "about" ? (
              <div className="space-y-5">
                <div className="grid gap-4 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
                  <h2 className="font-display text-2xl font-bold">Nội dung About</h2>
                  <AdminField label="Tiêu đề" value={content.about.title} onChange={(title) => update("about", { ...content.about, title })} />
                  <AdminField label="Giới thiệu" value={content.about.introduction} multiline rows={4} onChange={(introduction) => update("about", { ...content.about, introduction })} />
                  <AdminField label="Tiêu đề câu chuyện" value={content.about.storyTitle} onChange={(storyTitle) => update("about", { ...content.about, storyTitle })} />
                  <AdminField label="Câu chuyện" value={content.about.storyBody} multiline rows={4} onChange={(storyBody) => update("about", { ...content.about, storyBody })} />
                </div>
                <GearManager categories={content.gear} onChange={(gear) => update("gear", gear)} />
                <GroupMomentsManager moments={content.moments} crew={content.crew} onChange={(moments) => update("moments", moments)} />
              </div>
            ) : null}

            {tab === "settings" ? (
              <div className="grid gap-4 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
                <h2 className="font-display text-2xl font-bold">Cài đặt website</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Tên thương hiệu" value={content.settings.brandName} onChange={(brandName) => update("settings", { ...content.settings, brandName })} />
                  <AdminField label="Dòng mô tả thương hiệu" value={content.settings.brandSubtitle} onChange={(brandSubtitle) => update("settings", { ...content.settings, brandSubtitle })} />
                  <AdminField label="Email liên hệ" type="email" value={content.settings.contactEmail} onChange={(contactEmail) => update("settings", { ...content.settings, contactEmail })} />
                  <AdminField label="Điện thoại" value={content.settings.phone} onChange={(phone) => update("settings", { ...content.settings, phone })} />
                  <AdminField label="Địa điểm" value={content.settings.location} onChange={(location) => update("settings", { ...content.settings, location })} />
                  <AdminField label="Instagram" value={content.settings.instagramUrl} onChange={(instagramUrl) => update("settings", { ...content.settings, instagramUrl })} />
                  <AdminField label="Facebook" value={content.settings.facebookUrl} onChange={(facebookUrl) => update("settings", { ...content.settings, facebookUrl })} />
                </div>
                <AdminField label="Mô tả SEO" value={content.settings.siteDescription} multiline rows={3} onChange={(siteDescription) => update("settings", { ...content.settings, siteDescription })} />
                <details className="rounded-xl border border-white/10 p-4"><summary className="cursor-pointer text-sm font-semibold">Nhãn điều hướng</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <AdminField label="Trang chủ" value={content.settings.navTimelineLabel} onChange={(navTimelineLabel) => update("settings", { ...content.settings, navTimelineLabel })} />
                  <AdminField label="Dự án" value={content.settings.navProjectsLabel} onChange={(navProjectsLabel) => update("settings", { ...content.settings, navProjectsLabel })} />
                  <AdminField label="Thành viên" value={content.settings.navCrewLabel} onChange={(navCrewLabel) => update("settings", { ...content.settings, navCrewLabel })} />
                  <AdminField label="About" value={content.settings.navAboutLabel} onChange={(navAboutLabel) => update("settings", { ...content.settings, navAboutLabel })} />
                  <AdminField label="Liên hệ" value={content.settings.navContactLabel} onChange={(navContactLabel) => update("settings", { ...content.settings, navContactLabel })} />
                </div></details>
              </div>
            ) : null}

            {isDirty ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rec/25 bg-rec/[0.06] p-4 sm:p-5">
                <div>
                  <p className="text-sm font-semibold text-ivory">Mục này có thay đổi chưa lưu</p>
                  <p className="mt-1 text-xs text-ivory-muted">Nút này lưu mọi nội dung đang chỉnh sửa trên website.</p>
                </div>
                <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-rec px-4 py-3 text-xs font-mono font-bold text-obsidian disabled:cursor-not-allowed disabled:opacity-60">
                  <Save className="h-4 w-4" /> {saving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
