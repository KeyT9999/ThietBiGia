"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Check, Clock3, Mail, Phone, RefreshCw, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";

type Order = {
  id: string;
  order_code: string;
  created_at: string;
  customer_name: string;
  contact_phone: string | null;
  contact_zalo: string | null;
  contact_email: string | null;
  date_info: string;
  services: string[];
  selected_crew_slugs: string[];
  selected_crew: { slug: string; name: string; nickname: string; badgeNumber: string; avatar: string }[];
  assigned_member_id: string | null;
  project_ref: string | null;
  brief: string;
  acceptance_status: "pending" | "accepted" | "declined";
  contact_status: "not_contacted" | "contacted";
  is_assigned_to_me: boolean;
  is_selected_member: boolean;
  progress_status: "new" | "in_progress" | "completed";
  progress_note: string;
  progress_updated_at: string | null;
  admin_progress_updated_at: string | null;
};

function dateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function MemberOrdersTool() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState("");
  const [progressDrafts, setProgressDrafts] = useState<Record<string, { status: Order["progress_status"]; note: string }>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/member/orders", { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401) { window.location.assign("/member/login"); return; }
      if (!response.ok) throw new Error(result.error || "Không tải được đơn được phân công.");
      setOrders(result.orders as Order[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được đơn được phân công.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  async function updateOrder(order: Order, patch: { acceptanceStatus?: "accepted" | "declined"; contactStatus?: "contacted"; progressStatus?: Order["progress_status"]; progressNote?: string }) {
    setBusyOrderId(order.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/member/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, ...patch }),
      });
      const result = await response.json();
      if (response.status === 401) { window.location.assign("/member/login"); return; }
      if (!response.ok) throw new Error(result.error || "Không cập nhật được trạng thái đơn.");
      await loadOrders();
      setNotice(patch.acceptanceStatus === "accepted" ? "Bạn đã đồng ý nhận đơn. Hãy liên hệ khách và cập nhật trạng thái sau khi trao đổi." : patch.acceptanceStatus === "declined" ? "Bạn đã từ chối đơn. Admin có thể phân công cho member khác." : patch.contactStatus ? "Đã ghi nhận bạn liên hệ khách hàng." : "Tiến độ đơn hàng đã được cập nhật.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được trạng thái đơn.");
    } finally {
      setBusyOrderId("");
    }
  }

  function progressDraft(order: Order) {
    return progressDrafts[order.id] ?? { status: order.progress_status ?? "new", note: order.progress_note ?? "" };
  }

  return (
    <div className="space-y-5">
      <header className="rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-rec">CÔNG CỤ THÀNH VIÊN / CALL SHEET</p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Đơn được phân công</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ivory-muted">Xác nhận bạn có nhận xử lý đơn không. Sau khi đồng ý và liên hệ khách, hãy cập nhật trạng thái để admin theo dõi.</p>
          </div>
          <button type="button" onClick={() => void loadOrders()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-mono text-ivory-muted hover:border-rec/50 hover:text-ivory disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />LÀM MỚI</button>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/15 p-3"><span className="text-xs text-ivory-subtle">Đơn bạn được xem</span><strong className="mt-1 block font-display text-2xl">{orders.length}</strong></div>
          <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.035] p-3"><span className="text-xs text-ivory-subtle">Đơn chờ bạn xác nhận</span><strong className="mt-1 block font-display text-2xl text-amber-200">{orders.filter((order) => order.is_assigned_to_me && order.acceptance_status === "pending").length}</strong></div>
        </div>
      </header>

      {error ? <p role="alert" className="rounded-xl border border-red-400/25 bg-red-400/[0.06] p-4 text-sm text-red-200">{error}</p> : null}
      {notice ? <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4 text-sm text-emerald-100"><Check className="h-4 w-4" />{notice}</p> : null}

      {loading ? <div className="rounded-2xl border border-white/10 bg-obsidian-surface p-8 text-center text-sm text-ivory-muted">Đang tải đơn được phân công...</div>
        : error && orders.length === 0 ? null
        : orders.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-surface p-8 text-center"><ShoppingBag className="mx-auto h-7 w-7 text-ivory-subtle" /><p className="mt-3 font-semibold">Chưa có đơn liên quan đến bạn</p><p className="mt-1 text-sm text-ivory-muted">Đơn sẽ xuất hiện khi admin phân công bạn hoặc khách chọn hồ sơ của bạn trong phần đặt lịch.</p></div>
        : <div className="grid gap-4 2xl:grid-cols-2">{orders.map((order) => {
          const accepted = order.acceptance_status === "accepted";
          const declined = order.acceptance_status === "declined";
          const contacted = order.contact_status === "contacted";
          return <article key={order.id} className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-obsidian-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
              <div className="min-w-0"><p className="font-mono text-[10px] tracking-[0.14em] text-rec">MÃ ĐƠN</p><h3 className="mt-1 break-all font-display text-lg font-bold sm:text-xl">{order.order_code}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-ivory-muted"><Clock3 className="h-3.5 w-3.5" />Đặt lúc {dateTime(order.created_at)}</p></div>
              <div className="flex flex-wrap gap-1.5"><span className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${accepted ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200" : declined ? "border-red-400/25 bg-red-400/[0.08] text-red-200" : "border-amber-300/25 bg-amber-300/[0.08] text-amber-200"}`}>{accepted ? "Đã đồng ý nhận" : declined ? "Đã từ chối" : order.is_assigned_to_me ? "Chờ bạn xác nhận" : order.assigned_member_id ? "Chờ người nhận xác nhận" : "Chờ admin phân công"}</span><span className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${contacted ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200" : "border-white/10 bg-white/[0.04] text-ivory-muted"}`}>{contacted ? "Đã liên hệ khách" : "Chưa liên hệ khách"}</span></div>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <section className="space-y-2.5 rounded-xl border border-white/10 bg-black/10 p-3.5">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ivory"><UserRound className="h-3.5 w-3.5 text-rec" />Thông tin khách hàng</h4>
                <p className="break-words font-semibold">{order.customer_name}</p>
                {order.contact_phone ? <a className="flex items-start gap-2 break-all text-sm text-ivory-muted hover:text-ivory" href={`tel:${order.contact_phone}`}><Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rec" />{order.contact_phone}</a> : null}
                {order.contact_zalo ? <p className="break-all text-sm text-ivory-muted">Zalo: {order.contact_zalo}</p> : null}
                {order.contact_email ? <a className="flex items-start gap-2 break-all text-sm text-ivory-muted hover:text-ivory" href={`mailto:${order.contact_email}`}><Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rec" />{order.contact_email}</a> : null}
              </section>
              <section className="space-y-2.5 rounded-xl border border-white/10 bg-black/10 p-3.5">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ivory"><CalendarClock className="h-3.5 w-3.5 text-rec" />Yêu cầu đặt lịch</h4>
                <p className="text-sm leading-relaxed text-ivory-muted">{order.date_info || "Chưa ấn định thời gian"}</p>
                <div className="flex flex-wrap gap-1.5">{(order.services ?? []).map((service, index) => <span key={`${service}-${index}`} className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-ivory-muted">{service}</span>)}</div>
                {order.project_ref ? <p className="text-xs text-ivory-subtle">Dự án tham chiếu: <span className="text-ivory-muted">{order.project_ref}</span></p> : null}
              </section>
              {order.brief ? <section className="rounded-xl border border-white/10 bg-black/10 p-3.5 sm:col-span-2"><h4 className="text-xs font-semibold uppercase tracking-wide text-ivory">Ghi chú từ khách</h4><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ivory-muted">{order.brief}</p></section> : null}
              {order.selected_crew?.length ? <section className="rounded-xl border border-white/10 bg-black/10 p-3.5 sm:col-span-2"><h4 className="text-xs font-semibold uppercase tracking-wide text-ivory">Ekip khách đã chọn</h4><div className="mt-2 flex flex-wrap gap-2">{order.selected_crew.map((member) => <span key={member.slug} className="inline-flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-3 text-xs text-ivory-muted">{member.avatar ? <img src={member.avatar} alt="" className="h-6 w-6 rounded-full object-cover" /> : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[9px]">{member.badgeNumber}</span>}{member.nickname || member.name}</span>)}</div></section> : null}
              <section className="space-y-3 border-t border-white/10 pt-4 sm:col-span-2">
                {order.is_selected_member && !order.is_assigned_to_me ? <p className="text-xs text-cyan-200">Khách đã chọn bạn trong ekip. Bạn có thể xem đơn, liên hệ khách và cập nhật tiến độ.</p> : null}
                {order.is_assigned_to_me && order.acceptance_status === "pending" ? <div className="flex flex-wrap items-center justify-between gap-3"><p className="max-w-md text-xs leading-relaxed text-ivory-subtle">Bạn là người nhận do admin phân công. Xác nhận bạn có nhận xử lý đơn không.</p><div className="flex flex-wrap gap-2"><button type="button" disabled={busyOrderId === order.id} onClick={() => void updateOrder(order, { acceptanceStatus: "declined" })} className="min-h-10 rounded-xl border border-white/15 px-3 py-2 text-xs font-mono text-ivory-muted hover:border-red-400/40 hover:text-red-200 disabled:opacity-50">TỪ CHỐI</button><button type="button" disabled={busyOrderId === order.id} onClick={() => void updateOrder(order, { acceptanceStatus: "accepted" })} className="min-h-10 rounded-xl bg-rec px-3 py-2 text-xs font-mono font-bold text-obsidian disabled:opacity-50">ĐỒNG Ý NHẬN</button></div></div> : null}
                {!contacted ? <div className="flex flex-wrap items-center justify-between gap-3"><p className="max-w-md text-xs leading-relaxed text-ivory-subtle">Nếu bạn đã trao đổi với khách, cập nhật để admin và ekip cùng nắm tiến độ.</p><button type="button" disabled={busyOrderId === order.id} onClick={() => void updateOrder(order, { contactStatus: "contacted" })} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rec/40 px-3 py-2 text-xs font-mono font-bold text-rec hover:bg-rec/10 disabled:opacity-50"><Check className="h-3.5 w-3.5" />ĐÃ LIÊN HỆ KHÁCH</button></div> : <p className="flex items-center gap-2 text-xs text-emerald-200"><ShieldCheck className="h-4 w-4" />Đã có member liên hệ khách.</p>}
              </section>
              <section className="space-y-3 rounded-xl border border-rec/20 bg-rec/[0.035] p-3.5 sm:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><h4 className="text-xs font-mono font-semibold uppercase tracking-wide text-rec">Cập nhật tiến độ</h4><p className="mt-1 text-xs text-ivory-subtle">Member được admin phân công hoặc được khách chọn có thể cập nhật khi admin chưa cập nhật.</p></div>
                  {order.progress_updated_at ? <span className="text-[10px] text-ivory-subtle">Cập nhật {dateTime(order.progress_updated_at)}{order.admin_progress_updated_at ? " · admin" : " · member"}</span> : null}
                </div>
                {order.admin_progress_updated_at ? <div className="rounded-lg border border-white/10 bg-black/10 p-3"><p className="text-sm font-semibold text-ivory">{order.progress_status === "completed" ? "Hoàn thành" : order.progress_status === "in_progress" ? "Đang thực hiện" : "Mới tiếp nhận"}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ivory-muted">{order.progress_note || "Admin chưa thêm ghi chú."}</p><p className="mt-2 text-[10px] text-ivory-subtle">Admin đã cập nhật tiến độ; chỉ admin có thể sửa tiếp.</p></div>
                  : <><div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)]"><label className="block space-y-1.5"><span className="text-[10px] font-mono uppercase tracking-wide text-ivory-muted">Trạng thái</span><select value={progressDraft(order).status} onChange={(event) => setProgressDrafts((current) => ({ ...current, [order.id]: { ...progressDraft(order), status: event.target.value as Order["progress_status"] } }))} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2.5 text-sm text-ivory"><option value="new">Mới tiếp nhận</option><option value="in_progress">Đang thực hiện</option><option value="completed">Hoàn thành</option></select></label><label className="block space-y-1.5"><span className="text-[10px] font-mono uppercase tracking-wide text-ivory-muted">Ghi chú tiến độ</span><input value={progressDraft(order).note} onChange={(event) => setProgressDrafts((current) => ({ ...current, [order.id]: { ...progressDraft(order), note: event.target.value } }))} maxLength={3000} placeholder="Ví dụ: Đã trao đổi, đang chốt lịch quay..." className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2.5 text-sm text-ivory outline-none placeholder:text-ivory-subtle focus:border-rec/60" /></label></div><button type="button" disabled={busyOrderId === order.id} onClick={() => void updateOrder(order, { progressStatus: progressDraft(order).status, progressNote: progressDraft(order).note })} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rec px-3 py-2 text-xs font-mono font-bold text-obsidian disabled:opacity-50"><Check className="h-3.5 w-3.5" />{busyOrderId === order.id ? "ĐANG LƯU" : "CẬP NHẬT TIẾN ĐỘ"}</button></>}
              </section>
            </div>
          </article>;
        })}</div>}
    </div>
  );
}
