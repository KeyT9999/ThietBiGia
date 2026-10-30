"use client";

import { useEffect, useState } from "react";
import { FolderKanban, IdCard, Image as ImageIcon, KeyRound, Trash2 } from "lucide-react";
import type { CrewMember, WorkProject } from "@/data/schema";
import { AdminField, AdminImageField, AdminStringListField } from "./AdminFields";
import { MemberProjectsEditor } from "./MemberProjectsEditor";
import { MemberAccountTools } from "./MemberAccountTools";

type Role = "chup-anh" | "quay-phim" | "it-tech";
const roles: { id: Role; label: string }[] = [
  { id: "chup-anh", label: "Chụp ảnh" },
  { id: "quay-phim", label: "Quay phim" },
  { id: "it-tech", label: "IT / Tech" },
];

export function MemberEditor({
  member,
  memberCount,
  works,
  crew,
  canDelete,
  accountCanManage,
  onChange,
  onDelete,
}: {
  member: CrewMember;
  memberCount: number;
  works: WorkProject[];
  crew: CrewMember[];
  canDelete: boolean;
  accountCanManage: boolean;
  onChange: (patch: Partial<CrewMember>) => void;
  onDelete: () => void;
}) {
  const [badgeNumberDraft, setBadgeNumberDraft] = useState(member.badgeNumber);
  const [section, setSection] = useState<"profile" | "media" | "projects" | "account">("profile");

  useEffect(() => {
    setBadgeNumberDraft(member.badgeNumber);
  }, [member.id, member.badgeNumber]);

  function commitBadgeNumber() {
    const requested = Number(badgeNumberDraft);
    if (!Number.isInteger(requested) || requested < 1 || requested > memberCount) {
      setBadgeNumberDraft(member.badgeNumber);
      return;
    }

    onChange({ badgeNumber: String(requested).padStart(2, "0") });
  }

  return (
    <div className="space-y-5 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] text-rec">PROFILE / {member.slug}</p>
          <h2 className="mt-1 font-display text-2xl font-bold">{member.name}</h2>
        </div>
        <button type="button" disabled={!canDelete} onClick={onDelete} className="inline-flex items-center gap-2 rounded-xl border border-red-400/25 px-3 py-2 text-xs font-mono text-red-300 disabled:opacity-30">
          <Trash2 className="h-4 w-4" /> XÓA HỒ SƠ
        </button>
      </div>

      <nav aria-label="Công cụ thành viên" className="grid grid-cols-2 gap-2">
        {([
          { id: "profile", label: "Hồ sơ", detail: "Tên, vai trò, giới thiệu", icon: IdCard },
          { id: "media", label: "Ảnh & liên hệ", detail: "Ảnh thẻ, mạng xã hội", icon: ImageIcon },
          { id: "projects", label: "Dự án", detail: "Bài cá nhân và dự án chung", icon: FolderKanban },
          { id: "account", label: "Tài khoản", detail: "Đăng nhập và mật khẩu", icon: KeyRound },
        ] as const).map((item) => {
          const Icon = item.icon;
          return <button key={item.id} type="button" onClick={() => setSection(item.id)} aria-current={section === item.id ? "page" : undefined} className={"flex min-w-0 items-start gap-3 rounded-xl border px-3 py-3 text-left transition sm:px-4 " + (section === item.id ? "border-rec/60 bg-rec/10" : "border-white/10 bg-obsidian/50 hover:border-white/25")}>
            <Icon className={"mt-0.5 h-4 w-4 shrink-0 " + (section === item.id ? "text-rec" : "text-ivory-subtle")} aria-hidden="true" />
            <span className="min-w-0"><span className="block text-sm font-semibold text-ivory">{item.label}</span><span className="mt-1 hidden text-xs text-ivory-subtle sm:block">{item.detail}</span></span>
          </button>;
        })}
      </nav>

      {section === "profile" ? <section className="space-y-5" aria-label="Thông tin hồ sơ">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Tên hiển thị" value={member.name} onChange={(name) => onChange({ name })} />
        <AdminField label="Nickname" value={member.nickname ?? ""} onChange={(nickname) => onChange({ nickname: nickname || undefined })} />
        <AdminField label="Slug URL" value={member.slug} onChange={(slug) => onChange({ slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-") })} hint="Chữ thường, số và dấu gạch ngang." />
        <label className="block space-y-1.5">
          <span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">Số thẻ</span>
          <input
            type="number"
            min={1}
            max={memberCount}
            step={1}
            value={badgeNumberDraft}
            onChange={(event) => setBadgeNumberDraft(event.target.value)}
            onBlur={commitBadgeNumber}
            className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm text-ivory outline-none focus:border-rec"
          />
          <span className="block text-xs text-ivory-subtle">Đổi số thẻ sẽ chuyển vị trí thành viên và đánh lại số liên tiếp.</span>
        </label>
        <AdminField label="Chức danh chính" value={member.roleTitle} onChange={(roleTitle) => onChange({ roleTitle })} />
        <AdminField label="Thâm niên / nhãn" value={member.yearsActive} onChange={(yearsActive) => onChange({ yearsActive })} />
        <AdminField label="Địa điểm" value={member.location} onChange={(location) => onChange({ location })} />
      </div>

      <div className="space-y-2">
        <span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">Nhóm chuyên môn</span>
        <div className="flex flex-wrap gap-3">
          {roles.map((role) => (
            <label key={role.id} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-ivory">
              <input
                type="checkbox"
                checked={member.roles.includes(role.id)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? Array.from(new Set([...member.roles, role.id]))
                    : member.roles.filter((item) => item !== role.id);
                  const safeRoles = next.length ? next : [member.roleCategory];
                  onChange({ roles: safeRoles, roleCategory: safeRoles[0] });
                }}
              />
              {role.label}
            </label>
          ))}
        </div>
      </div>

      <AdminStringListField label="Vai trò phụ" value={member.secondaryRoles} onChange={(secondaryRoles) => onChange({ secondaryRoles })} placeholder="Ví dụ: Camera Operator" addLabel="THÊM VAI TRÒ" reorderable />
      <AdminField label="Giới thiệu cá nhân" value={member.bio} multiline rows={6} onChange={(bio) => onChange({ bio })} />
      <AdminStringListField label="Gear yêu thích" value={member.favoriteGear} onChange={(favoriteGear) => onChange({ favoriteGear })} placeholder="Ví dụ: Sony FX6" addLabel="THÊM THIẾT BỊ" reorderable />
      </section> : null}

      {section === "media" ? <section className="space-y-5" aria-label="Ảnh và liên hệ">
      <AdminImageField label="Ảnh đại diện" value={member.avatar} folder="thiet-bi-gia/members" onChange={(avatar) => onChange({ avatar })} />
      <AdminImageField label="Ảnh khi rê chuột vào thẻ" value={member.avatarAlt ?? ""} folder="thiet-bi-gia/members" onChange={(avatarAlt) => onChange({ avatarAlt: avatarAlt || undefined })} />
      <p className="-mt-3 text-xs text-ivory-subtle">Ảnh này thay ảnh đại diện khi khách rê chuột lên thẻ thành viên ở trang Đội ngũ. Để trống nếu không cần hiệu ứng đổi ảnh.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Instagram URL" value={member.socials.instagram ?? ""} onChange={(value) => onChange({ socials: { ...member.socials, instagram: value || undefined } })} />
        <AdminField label="Behance URL" value={member.socials.behance ?? ""} onChange={(value) => onChange({ socials: { ...member.socials, behance: value || undefined } })} />
        <AdminField label="Facebook URL" value={member.socials.facebook ?? ""} onChange={(value) => onChange({ socials: { ...member.socials, facebook: value || undefined } })} />
        <AdminField label="Email" type="email" value={member.socials.email ?? ""} onChange={(value) => onChange({ socials: { ...member.socials, email: value || undefined } })} />
      </div>
      </section> : null}

      {section === "projects" ? <MemberProjectsEditor member={member} works={works} crew={crew} onChange={onChange} /> : null}
      {section === "account" ? <MemberAccountTools memberId={member.id} slug={member.slug} canManage={accountCanManage} /> : null}
    </div>
  );
}
