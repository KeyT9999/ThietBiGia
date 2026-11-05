"use client";

import { useEffect, useState } from "react";
import { Building2, Check, Clock3, ExternalLink, X } from "lucide-react";
import type { PartnerOrganization } from "@/data/schema";
import type { PartnerOrganizationProposal } from "@/data/partner-proposal";

export function PartnerProposalsQueue({ onApproved }: { onApproved: (organization: PartnerOrganization) => void }) {
  const [proposals, setProposals] = useState<PartnerOrganizationProposal[]>([]);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/partner-proposals", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Không tải được hàng chờ.");
        if (alive) setProposals((result.proposals ?? []) as PartnerOrganizationProposal[]);
      })
      .catch((cause) => { if (alive) setError(cause instanceof Error ? cause.message : "Không tải được hàng chờ."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function review(proposalId: string, decision: "approve" | "reject") {
    setBusyId(proposalId);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/partner-proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, decision, reviewNote: reviewNotes[proposalId] ?? "" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Không xử lý được đề xuất.");
      const proposal = result.proposal as PartnerOrganizationProposal;
      setProposals((current) => current.map((item) => item.id === proposal.id ? proposal : item));
      if (decision === "approve" && result.organization) {
        onApproved(result.organization as PartnerOrganization);
        setNotice(`Đã duyệt “${proposal.name}”. Đơn vị đã được thêm vào danh sách dùng chung trên website.`);
      } else {
        setNotice(`Đã từ chối đề xuất “${proposal.name}”.`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không xử lý được đề xuất.");
    } finally {
      setBusyId("");
    }
  }

  const pendingCount = proposals.filter((proposal) => proposal.status === "pending").length;

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div><p className="font-mono text-[10px] tracking-[0.18em] text-rec">MEMBER SUBMISSIONS / REVIEW</p><h2 className="mt-2 font-display text-2xl font-bold">Đề xuất chờ duyệt</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-ivory-muted">Đơn vị chỉ được đưa vào danh mục dùng chung và hiển thị trên website sau khi admin duyệt.</p></div>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-3 py-2 font-mono text-xs text-amber-100"><Clock3 className="h-4 w-4" />{pendingCount} chờ duyệt</span>
      </header>

      {loading ? <p className="text-sm text-ivory-subtle">Đang tải đề xuất…</p> : null}
      {!loading && proposals.length === 0 ? <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-ivory-subtle">Chưa có thành viên nào gửi đơn vị mới.</p> : null}

      <div className="space-y-3">
        {proposals.map((proposal) => <article key={proposal.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {proposal.logo ? <img src={proposal.logo} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-white/10 bg-white object-contain p-1" /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10"><Building2 className="h-4 w-4 text-ivory-subtle" /></span>}
              <div className="min-w-0"><h3 className="truncate font-display text-lg font-bold">{proposal.name}</h3><p className="mt-1 text-xs text-ivory-subtle">Gửi bởi {proposal.member_name} · {new Date(proposal.created_at).toLocaleDateString("vi-VN")}</p></div>
            </div>
            <span className={`rounded-full border px-2.5 py-1 font-mono text-[9px] ${proposal.status === "pending" ? "border-amber-300/20 bg-amber-300/[0.07] text-amber-100" : proposal.status === "approved" ? "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100" : "border-red-300/20 bg-red-300/[0.07] text-red-100"}`}>{proposal.status === "pending" ? "CHỜ DUYỆT" : proposal.status === "approved" ? "ĐÃ DUYỆT" : "ĐÃ TỪ CHỐI"}</span>
          </div>
          {proposal.description ? <p className="mt-3 text-sm leading-relaxed text-ivory-muted">{proposal.description}</p> : null}
          {proposal.website ? <a href={proposal.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs text-rec hover:underline"><ExternalLink className="h-3.5 w-3.5" />{proposal.website}</a> : null}
          {proposal.review_note ? <p className="mt-3 text-xs text-ivory-subtle">Ghi chú: {proposal.review_note}</p> : null}
          {proposal.status === "pending" ? <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1 space-y-1.5"><span className="block text-[10px] font-mono uppercase tracking-wide text-ivory-subtle">Ghi chú tùy chọn</span><input value={reviewNotes[proposal.id] ?? ""} onChange={(event) => setReviewNotes((current) => ({ ...current, [proposal.id]: event.target.value }))} maxLength={1000} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2.5 text-sm text-ivory outline-none focus:border-rec" placeholder="Ví dụ: vui lòng bổ sung website" /></label>
            <div className="flex shrink-0 gap-2"><button type="button" disabled={busyId === proposal.id} onClick={() => void review(proposal.id, "reject")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-400/20 px-3 py-2 text-xs font-mono text-red-200 hover:bg-red-400/10 disabled:opacity-50"><X className="h-4 w-4" />TỪ CHỐI</button><button type="button" disabled={busyId === proposal.id} onClick={() => void review(proposal.id, "approve")} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rec px-3 py-2 text-xs font-mono font-bold text-obsidian disabled:opacity-50"><Check className="h-4 w-4" />{busyId === proposal.id ? "ĐANG XỬ LÝ..." : "DUYỆT VÀ THÊM"}</button></div>
          </div> : null}
        </article>)}
      </div>

      {error ? <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3 text-sm text-red-200">{error}</p> : null}
      {notice ? <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-3 text-sm text-emerald-100">{notice}</p> : null}
    </section>
  );
}
