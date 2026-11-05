"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Building2, Check, Clock3, Send, X } from "lucide-react";
import type { PartnerOrganization } from "@/data/schema";
import type { PartnerOrganizationProposal } from "@/data/partner-proposal";
import { AdminField, AdminImageField } from "./AdminFields";

const statusLabels = {
  pending: { label: "ĐANG CHỜ DUYỆT", className: "border-amber-300/20 bg-amber-300/[0.07] text-amber-100", icon: Clock3 },
  approved: { label: "ĐÃ ĐƯỢC DUYỆT", className: "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100", icon: Check },
  rejected: { label: "CHƯA ĐƯỢC DUYỆT", className: "border-red-300/20 bg-red-300/[0.07] text-red-100", icon: X },
} as const;

export function MemberPartnerOrganizationsEditor({ organizations, signatureEndpoint }: { organizations: PartnerOrganization[]; signatureEndpoint?: string }) {
  const [proposals, setProposals] = useState<PartnerOrganizationProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/member/partner-proposals", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Không tải được đề xuất.");
        if (alive) setProposals((result.proposals ?? []) as PartnerOrganizationProposal[]);
      })
      .catch((cause) => { if (alive) setError(cause instanceof Error ? cause.message : "Không tải được đề xuất."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/member/partner-proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, website, logo, description }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Chưa gửi được đề xuất.");
      setProposals((current) => [result.proposal as PartnerOrganizationProposal, ...current]);
      setName("");
      setWebsite("");
      setLogo("");
      setDescription("");
      setNotice("Đã gửi đề xuất cho admin. Đơn vị sẽ được chia sẻ trên website sau khi được duyệt.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chưa gửi được đề xuất.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-6">
        <p className="font-mono text-[10px] tracking-[0.16em] text-rec">PROFILE / SHARED PARTNERS</p>
        <h3 className="mt-1 font-display text-xl font-bold">Đơn vị đồng hành dùng chung</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ivory-muted">Admin và tất cả thành viên cùng sử dụng danh sách này. Bạn có thể chọn các đơn vị đã duyệt trong dự án cá nhân. Đơn vị mới cần được admin duyệt trước khi xuất hiện trên website.</p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div><h4 className="font-display text-lg font-bold">Danh sách đã được duyệt</h4><p className="mt-1 text-xs text-ivory-subtle">Có thể chọn ngay trong mục “Dự án trưng bày”.</p></div>
          <span className="font-mono text-xs text-ivory-subtle">{organizations.length}</span>
        </div>
        {organizations.length ? <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {organizations.map((organization) => <div key={organization.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            {organization.logo ? <img src={organization.logo} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-white/10 bg-white object-contain p-1" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]"><Building2 className="h-4 w-4 text-ivory-subtle" /></span>}
            <span className="min-w-0"><span className="block truncate text-sm font-semibold">{organization.name}</span>{organization.website ? <span className="block truncate text-[10px] text-ivory-subtle">{organization.website}</span> : <span className="block text-[10px] text-emerald-200">Đã duyệt · dùng chung</span>}</span>
          </div>)}
        </div> : <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-ivory-subtle">Danh sách chưa có đơn vị nào. Bạn có thể gửi đề xuất bên dưới.</p>}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
        <form onSubmit={(event) => void submit(event)} className="space-y-4 rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-6">
          <div className="border-b border-white/10 pb-3"><p className="font-mono text-[10px] text-rec">NEW PARTNER / REVIEW</p><h4 className="mt-1 font-display text-lg font-bold">Gửi đơn vị mới cho admin duyệt</h4></div>
          <AdminField label="Tên đơn vị *" value={name} onChange={setName} hint="Admin sẽ kiểm tra để tránh tạo trùng đơn vị đã có." />
          <AdminField label="Website (không bắt buộc)" type="url" value={website} onChange={setWebsite} hint="Dùng địa chỉ đầy đủ, ví dụ https://tenmien.vn" />
          <AdminImageField label="Ảnh / logo đơn vị (không bắt buộc)" value={logo} folder="thiet-bi-gia/partners" signatureEndpoint={signatureEndpoint} onChange={setLogo} />
          <AdminField label="Giới thiệu ngắn (không bắt buộc)" value={description} multiline rows={3} onChange={setDescription} />
          <button type="submit" disabled={submitting || !name.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rec px-4 py-3 text-xs font-mono font-bold text-obsidian disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" />{submitting ? "ĐANG GỬI..." : "GỬI ADMIN DUYỆT"}</button>
          {error ? <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3 text-sm text-red-200">{error}</p> : null}
          {notice ? <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-3 text-sm text-emerald-100">{notice}</p> : null}
        </form>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-6">
          <div className="border-b border-white/10 pb-3"><h4 className="font-display text-lg font-bold">Đề xuất của bạn</h4><p className="mt-1 text-xs text-ivory-subtle">Trạng thái được cập nhật sau khi admin xem xét.</p></div>
          {loading ? <p className="text-sm text-ivory-subtle">Đang tải trạng thái…</p> : null}
          {!loading && proposals.length === 0 ? <p className="text-sm text-ivory-subtle">Bạn chưa gửi đề xuất nào.</p> : null}
          {proposals.map((proposal) => {
            const status = statusLabels[proposal.status];
            const StatusIcon = status.icon;
            return <article key={proposal.id} className="rounded-xl border border-white/10 p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2"><p className="font-semibold">{proposal.name}</p><span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[9px] ${status.className}`}><StatusIcon className="h-3 w-3" />{status.label}</span></div>
              <p className="mt-2 text-[11px] text-ivory-subtle">Gửi ngày {new Date(proposal.created_at).toLocaleDateString("vi-VN")}</p>
              {proposal.review_note ? <p className="mt-2 text-xs leading-relaxed text-ivory-muted">Ghi chú admin: {proposal.review_note}</p> : null}
            </article>;
          })}
        </section>
      </div>
    </div>
  );
}
