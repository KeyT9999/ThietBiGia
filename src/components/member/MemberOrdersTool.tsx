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
  project_ref: string | null;
  brief: string;
  acceptance_status: "pending" | "accepted" | "declined";
  contact_status: "not_contacted" | "contacted";
};

function dateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function MemberOrdersTool() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState("");
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

  async function updateOrder(order: Order, patch: { acceptanceStatus?: "accepted" | "declined"; contactStatus?: "contacted" }) {
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
      setOrders((current) => current.map((item) => item.id === order.id ? result.order as Order : item));
      setNotice(patch.acceptanceStatus === "accepted" ? "Bạn đã đồng ý nhận đơn. Hãy liên hệ khách và cập nhật trạng thái sau khi trao đổi." : patch.acceptanceStatus === "declined" ? "Bạn đã từ chối đơn. Admin có thể phân công cho member khác." : "Đã ghi nhận bạn liên hệ khách hàng.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được trạng thái đơn.");
    } finally {
      setBusyOrderId("");
    }
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
          <div className="rounded-xl border border-white/10 bg-black/15 p-3"><span className="text-xs text-ivory-subtle">Được phân công</span><strong className="mt-1 block font-display text-2xl">{orders.length}</strong></div>
          <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.035] p-3"><span className="text-xs text-ivory-subtle">Chờ bạn xác nhận</span><strong className="mt-1 block font-display text-2xl text-amber-200">{orders.filter((order) => order.acceptance_status === "pending").length}</strong></div>
        </div>
      </header>

      {error ? <p role="alert" className="rounded-xl border border-red-400/25 bg-red-400/[0.06] p-4 text-sm text-red-200">{error}</p> : null}
      {notice ? <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4 text-sm text-emerald-100"><Check className="h-4 w-4" />{notice}</p> : null}

      {loading ? <div className="rounded-2xl border border-white/10 bg-obsidian-surface p-8 text-center text-sm text-ivory-muted">Đang tải đơn được phân công...</div>
        : error && orders.length === 0 ? null
        : orders.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-surface p-8 text-center"><ShoppingBag className="mx-auto h-7 w-7 text-ivory-subtle" /><p className="mt-3 font-semibold">Chưa có đơn được giao</p><p className="mt-1 text-sm text-ivory-muted">Khi admin phân công, thông tin đơn sẽ xuất hiện ở đây.</p></div>
        : <div className="grid gap-4 2xl:grid-cols-2">{orders.map((order) => {
          const accepted = order.acceptance_status === "accepted";
          const declined = order.acceptance_status === "declined";
          const contacted = order.contact_status === "contacted";
          return <article key={order.id} className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-obsidian-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
              <div className="min-w-0"><p className="font-mono text-[10px] tracking-[0.14em] text-rec">MÃ ĐƠN</p><h3 className="mt-1 break-all font-display text-lg font-bold sm:text-xl">{order.order_code}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-ivory-muted"><Clock3 className="h-3.5 w-3.5" />Đặt lúc {dateTime(order.created_at)}</p></div>
              <div className="flex flex-wrap gap-1.5"><span className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${accepted ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200" : declined ? "border-red-400/25 bg-red-400/[0.08] text-red-200" : "border-amber-300/25 bg-amber-300/[0.08] text-amber-200"}`}>{accepted ? "Đã đồng ý nhận" : declined ? "Đã từ chối" : "Chờ bạn xác nhận"}</span><span className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${contacted ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200" : "border-white/10 bg-white/[0.04] text-ivory-muted"}`}>{contacted ? "Đã liên hệ khách" : "Chưa liên hệ khách"}</span></div>
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
              <section className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 sm:col-span-2">
                {order.acceptance_status === "pending" ? <><p className="max-w-md text-xs leading-relaxed text-ivory-subtle">Chọn một trạng thái để admin biết bạn có thể nhận xử lý đơn này không.</p><div className="flex flex-wrap gap-2"><button type="button" disabled={busyOrderId === order.id} onClick={() => void updateOrder(order, { acceptanceStatus: "declined" })} className="min-h-10 rounded-xl border border-white/15 px-3 py-2 text-xs font-mono text-ivory-muted hover:border-red-400/40 hover:text-red-200 disabled:opacity-50">TỪ CHỐI</button><button type="button" disabled={busyOrderId === order.id} onClick={() => void updateOrder(order, { acceptanceStatus: "accepted" })} className="min-h-10 rounded-xl bg-rec px-3 py-2 text-xs font-mono font-bold text-obsidian disabled:opacity-50">ĐỒNG Ý NHẬN</button></div></>
                  : accepted && !contacted ? <><p className="max-w-md text-xs leading-relaxed text-ivory-subtle">Sau khi đã trao đổi với khách, hãy bấm xác nhận liên hệ.</p><button type="button" disabled={busyOrderId === order.id} onClick={() => void updateOrder(order, { contactStatus: "contacted" })} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rec px-3 py-2 text-xs font-mono font-bold text-obsidian disabled:opacity-50"><Check className="h-3.5 w-3.5" />ĐÃ LIÊN HỆ KHÁCH</button></>
                  : <p className="flex items-center gap-2 text-xs text-ivory-subtle"><ShieldCheck className="h-4 w-4 text-emerald-300" />{declined ? "Admin có thể phân công lại đơn cho thành viên khác." : "Trạng thái đã cập nhật cho admin."}</p>}
              </section>
            </div>
          </article>;
        })}</div>}
    </div>
  );
}
