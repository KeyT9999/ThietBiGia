"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Check, CircleUserRound, Images, KeyRound, LogOut, Save, ShieldCheck, UserRound } from "lucide-react";
import type { CrewMember, WorkProject } from "@/data/schema";
import { useSetSiteContent } from "@/lib/store";
import type { SiteContent } from "@/lib/content-schema";
import { AdminField, AdminImageField, AdminStringListField } from "@/components/admin/AdminFields";
import { MemberProjectsEditor } from "@/components/admin/MemberProjectsEditor";
import { BrandLogo } from "@/components/layout/BrandLogo";

type Section = "profile" | "projects" | "security";
const sections: { id: Section; label: string; detail: string; icon: typeof CircleUserRound }[] = [
  { id: "profile", label: "Thông tin cá nhân", detail: "Ảnh, giới thiệu và liên hệ", icon: CircleUserRound },
  { id: "projects", label: "Dự án trưng bày", detail: "Dự án riêng và dự án chung", icon: Images },
  { id: "security", label: "Bảo mật tài khoản", detail: "Đổi mật khẩu đăng nhập", icon: KeyRound },
];

export function MemberWorkspace() {
  const router = useRouter();
  const updateSiteContent = useSetSiteContent();
  const [section, setSection] = useState<Section>("profile");
  const [profile, setProfile] = useState<CrewMember | null>(null);
  const [works, setWorks] = useState<WorkProject[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const isDirty = Boolean(profile && JSON.stringify(profile) !== savedSnapshot);

  useEffect(() => {
    let alive = true;
    fetch("/api/member/profile", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (response.status === 401) {
          router.replace("/member/login");
          return null;
        }
        if (!response.ok) throw new Error(result.error || "Không tải được profile.");
        return result;
      })
      .then((result) => {
        if (!alive || !result) return;
        setProfile(result.profile as CrewMember);
        setWorks(result.works as WorkProject[]);
        setCrew(result.crew as CrewMember[]);
        setUpdatedAt(result.updatedAt as string | null);
        setSavedSnapshot(JSON.stringify(result.profile));
      })
      .catch((cause) => { if (alive) setError(cause instanceof Error ? cause.message : "Không tải được profile."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [router]);

  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeLeave = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [isDirty]);

  const title = useMemo(() => sections.find((item) => item.id === section)?.label ?? "Profile", [section]);

  function update(patch: Partial<CrewMember>) {
    setProfile((current) => current ? { ...current, ...patch } : current);
    setNotice("");
    setError("");
  }

  async function saveProfile() {
    if (!profile || !isDirty) return;
    setSaving(true);
    setError("");
    setNotice("");
    const submitted = JSON.stringify(profile);
    try {
      const response = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, updatedAt }),
      });
      const result = await response.json();
      if (response.status === 401) {
        router.replace("/member/login");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Không lưu được profile.");
      const saved = result.profile as CrewMember;
      setSavedSnapshot(JSON.stringify(saved));
      setUpdatedAt(result.updatedAt as string);
      setCrew((current) => current.map((member) => member.id === saved.id ? saved : member));
      setProfile((current) => current && JSON.stringify(current) === submitted ? saved : current);
      updateSiteContent(result.content as SiteContent);
      setNotice("Profile đã được lưu và cập nhật trên website.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được profile.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/member/auth/logout", { method: "POST" });
    router.replace("/member/login");
    router.refresh();
  }

  if (loading) return <main className="min-h-screen bg-obsidian px-4 pt-28 text-center font-mono text-sm text-ivory-muted">ĐANG TẢI PROFILE...</main>;
  if (!profile) return <main className="min-h-screen bg-obsidian px-4 pt-28 text-center text-ivory"><p>{error || "Không tải được profile."}</p><Link href="/member/login" className="mt-4 inline-flex text-sm text-rec">Quay lại đăng nhập</Link></main>;

  return (
    <main className="min-h-screen bg-[#0b0c10] px-4 pb-28 pt-5 text-ivory sm:px-7 sm:pt-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" aria-label="Về trang chủ Thiết Bị Gia" className="shrink-0 rounded-md"><BrandLogo /></Link>
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-[0.2em] text-rec">THIẾT BỊ GIA / MEMBER STUDIO</p>
                <h1 className="mt-1 truncate font-display text-lg font-bold sm:text-xl">Không gian của {profile.name}</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/crew/${profile.slug}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs text-ivory-muted hover:text-ivory"><ArrowLeft className="h-3.5 w-3.5" />XEM PROFILE</Link>
              <button type="button" onClick={() => void logout()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs text-ivory-muted hover:text-ivory"><LogOut className="h-3.5 w-3.5" />THOÁT</button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            {profile.avatar ? <img src={profile.avatar} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-white/10 object-cover sm:h-16 sm:w-16" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 text-ivory-subtle sm:h-16 sm:w-16"><UserRound className="h-7 w-7" /></div>}
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] text-rec">THẺ #{profile.badgeNumber}</p>
              <p className="mt-1 truncate font-display text-base font-bold sm:text-lg">{profile.name}</p>
              <p className="mt-0.5 truncate text-xs text-ivory-muted sm:text-sm">{profile.roleTitle} · {profile.location}</p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 px-3 py-2 text-[10px] font-mono text-emerald-200 sm:inline-flex"><ShieldCheck className="h-3.5 w-3.5" />TÀI KHOẢN RIÊNG</span>
          </div>
        </header>

        <div className="grid items-start gap-5">
          <nav aria-label="Công cụ profile" className="grid min-w-0 grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-obsidian-surface p-2 sm:grid-cols-3 lg:sticky lg:top-5">
            {sections.map((item) => {
              const Icon = item.icon;
              const active = item.id === section;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSection(item.id)}
                  className={`flex w-full min-w-0 items-center gap-2.5 rounded-xl px-3 py-3 text-left transition sm:gap-3 ${active ? "bg-rec text-obsidian" : "border border-white/5 text-ivory-muted hover:bg-white/5 hover:text-ivory"}`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-black/10" : "bg-white/5"}`}><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold sm:text-sm">{item.label}</span>
                    <span className={`mt-1 hidden text-[10px] leading-tight lg:block ${active ? "text-obsidian/70" : "text-ivory-subtle"}`}>{item.detail}</span>
                  </span>
                </button>
              );
            })}
            <p className="hidden border-t border-white/10 px-3 pt-3 text-xs leading-relaxed text-ivory-subtle sm:col-span-3 lg:block">Chỉnh nội dung rồi bấm <b className="text-ivory">Lưu thay đổi</b> để cập nhật trang công khai.</p>
          </nav>

          <section className="min-w-0 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-obsidian-surface px-4 py-4 sm:px-6">
              <p className="font-mono text-[10px] tracking-[0.16em] text-rec">CÔNG CỤ THÀNH VIÊN</p>
              <div className="mt-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <h2 className="font-display text-xl font-bold sm:text-2xl">{title}</h2>
                <p className="text-xs text-ivory-muted sm:text-sm">{sections.find((item) => item.id === section)?.detail}</p>
              </div>
            </div>

            {section === "profile" ? <div className="columns-1 gap-4 xl:columns-2">
              <section className="mb-4 break-inside-avoid space-y-4 rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-5">
                <div className="border-b border-white/10 pb-3">
                  <p className="font-mono text-[10px] text-rec">01 / HIỂN THỊ</p>
                  <h3 className="mt-1 font-display text-lg font-bold">Thông tin cơ bản</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <AdminField label="Đường dẫn profile" value={profile.slug} onChange={(slug) => update({ slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-") })} hint="Ví dụ: ten-cua-ban. Dùng chữ thường, số và dấu gạch ngang." />
                  <AdminField label="Tên hiển thị" value={profile.name} onChange={(name) => update({ name })} />
                  <AdminField label="Nickname" value={profile.nickname ?? ""} onChange={(nickname) => update({ nickname: nickname || undefined })} />
                  <AdminField label="Chức danh chính" value={profile.roleTitle} onChange={(roleTitle) => update({ roleTitle })} />
                  <AdminField label="Thâm niên / nhãn" value={profile.yearsActive} onChange={(yearsActive) => update({ yearsActive })} />
                  <AdminField label="Địa điểm" value={profile.location} onChange={(location) => update({ location })} />
                </div>
              </section>

              <section className="mb-4 break-inside-avoid space-y-5 rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-5">
                <div className="border-b border-white/10 pb-3">
                  <p className="font-mono text-[10px] text-rec">02 / GIỚI THIỆU</p>
                  <h3 className="mt-1 font-display text-lg font-bold">Vai trò & câu chuyện</h3>
                </div>
                <div className="space-y-2"><p className="text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">Nhóm chuyên môn</p><div className="flex flex-wrap gap-2">{([ ["chup-anh", "Chụp ảnh"], ["quay-phim", "Quay phim"], ["it-tech", "IT / Tech"] ] as const).map(([id, label]) => <label key={id} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-ivory"><input type="checkbox" checked={profile.roles.includes(id)} onChange={(event) => { const roles = event.target.checked ? [...new Set([...profile.roles, id])] : profile.roles.filter((role) => role !== id); if (roles.length) update({ roles, roleCategory: roles[0] }); }} className="accent-[#ff4d00]" />{label}</label>)}</div><p className="text-xs text-ivory-subtle">Chọn ít nhất một nhóm chuyên môn.</p></div>
                <AdminStringListField label="Vai trò phụ" value={profile.secondaryRoles} onChange={(secondaryRoles) => update({ secondaryRoles })} placeholder="Ví dụ: Camera Operator" addLabel="THÊM VAI TRÒ" reorderable />
                <AdminField label="Giới thiệu cá nhân" value={profile.bio} multiline rows={6} onChange={(bio) => update({ bio })} />
              </section>

              <section className="mb-4 break-inside-avoid space-y-5 rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-5">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <Camera className="h-4 w-4 text-rec" />
                  <div><p className="font-mono text-[10px] text-rec">03 / HÌNH ẢNH</p><h3 className="mt-1 font-display text-lg font-bold">Ảnh & thiết bị</h3></div>
                </div>
                <AdminImageField label="Ảnh đại diện" value={profile.avatar} folder="thiet-bi-gia/members" signatureEndpoint="/api/member/cloudinary-signature" onChange={(avatar) => update({ avatar })} />
                <div><AdminImageField label="Ảnh khi rê chuột vào thẻ" value={profile.avatarAlt ?? ""} folder="thiet-bi-gia/members" signatureEndpoint="/api/member/cloudinary-signature" onChange={(avatarAlt) => update({ avatarAlt: avatarAlt || undefined })} /><p className="mt-2 text-xs text-ivory-subtle">Ảnh này sẽ hiện khi khách rê chuột lên thẻ của bạn ở trang Đội ngũ. Có thể để trống.</p></div>
                <AdminStringListField label="Gear yêu thích" value={profile.favoriteGear} onChange={(favoriteGear) => update({ favoriteGear })} placeholder="Ví dụ: Sony FX6" addLabel="THÊM THIẾT BỊ" reorderable />
              </section>

              <section className="mb-4 break-inside-avoid space-y-4 rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-5">
                <div className="border-b border-white/10 pb-3">
                  <p className="font-mono text-[10px] text-rec">04 / LIÊN HỆ</p>
                  <h3 className="mt-1 font-display text-lg font-bold">Liên kết công khai</h3>
                </div>
                <p className="text-xs leading-relaxed text-ivory-subtle">Các thông tin này sẽ thành liên kết trên profile công khai. Trường để trống sẽ không hiển thị.</p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><AdminField label="Instagram URL" value={profile.socials.instagram ?? ""} onChange={(value) => update({ socials: { ...profile.socials, instagram: value || undefined } })} /><AdminField label="Behance URL" value={profile.socials.behance ?? ""} onChange={(value) => update({ socials: { ...profile.socials, behance: value || undefined } })} /><AdminField label="Facebook URL" value={profile.socials.facebook ?? ""} onChange={(value) => update({ socials: { ...profile.socials, facebook: value || undefined } })} /><AdminField label="Email công khai" type="email" value={profile.socials.email ?? ""} onChange={(value) => update({ socials: { ...profile.socials, email: value || undefined } })} /></div>
              </section>
            </div> : null}

            {section === "projects" ? <MemberProjectsEditor member={profile} works={works} crew={crew} signatureEndpoint="/api/member/cloudinary-signature" onChange={update} /> : null}

            {section === "security" ? <div className="rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-6"><PasswordSettings /></div> : null}

            {isDirty ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rec/25 bg-rec/[0.06] p-4"><div><p className="text-sm font-semibold">Có thay đổi chưa lưu</p><p className="mt-1 text-xs text-ivory-muted">Lưu để các thay đổi xuất hiện trên profile công khai.</p></div><button type="button" onClick={() => void saveProfile()} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rec px-4 py-3 text-xs font-mono font-bold text-obsidian disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}</button></div> : null}
            {error ? <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm leading-relaxed text-red-200">{error}</p> : null}
            {notice ? <p className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm leading-relaxed text-emerald-100"><Check className="mt-0.5 h-4 w-4 shrink-0" />{notice}</p> : null}
          </section>
        </div>

        {isDirty ? <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-rec/30 bg-[#15161c]/95 p-3 shadow-2xl backdrop-blur sm:hidden"><span className="min-w-0 truncate text-xs text-ivory-muted">Có thay đổi chưa lưu</span><button type="button" onClick={() => void saveProfile()} disabled={saving} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-rec px-3 py-2 text-[10px] font-mono font-bold text-obsidian disabled:opacity-50"><Save className="h-3.5 w-3.5" />{saving ? "ĐANG LƯU" : "LƯU"}</button></div> : null}
      </div>
    </main>
  );
}

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (newPassword.length < 6) { setError("Mật khẩu mới cần có ít nhất 6 ký tự."); return; }
    if (newPassword !== confirmPassword) { setError("Hai lần nhập mật khẩu mới chưa khớp."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/member/auth/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Không đổi được mật khẩu.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Mật khẩu đã được đổi. Lần đăng nhập sau hãy dùng mật khẩu mới.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không đổi được mật khẩu.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="max-w-2xl space-y-5"><div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4"><p className="flex items-center gap-2 text-sm font-semibold text-emerald-100"><ShieldCheck className="h-4 w-4" />Mật khẩu của bạn được lưu an toàn</p><p className="mt-2 text-sm leading-relaxed text-ivory-muted">Quản trị viên không thể xem mật khẩu hiện tại. Nếu quên, admin có thể cấp lại mật khẩu tạm mới.</p></div><form onSubmit={(event) => void submit(event)} className="space-y-4"><AdminField label="Mật khẩu hiện tại" type="password" value={currentPassword} onChange={setCurrentPassword} /><AdminField label="Mật khẩu mới" type="password" value={newPassword} onChange={setNewPassword} hint="Tối thiểu 6 ký tự." /><AdminField label="Nhập lại mật khẩu mới" type="password" value={confirmPassword} onChange={setConfirmPassword} /><button disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rec px-4 py-3 text-xs font-mono font-bold text-obsidian disabled:opacity-50"><KeyRound className="h-4 w-4" />{busy ? "ĐANG ĐỔI..." : "ĐỔI MẬT KHẨU"}</button></form>{error ? <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</p> : null}{notice ? <p className="text-sm text-emerald-200">{notice}</p> : null}</div>;
}
