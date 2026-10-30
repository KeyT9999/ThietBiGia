"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Clock3, Mail, Phone, RefreshCw, Search, ShoppingBag, UserRound, Users } from "lucide-react";

type OrderStatus = "pending" | "accepted" | "declined";
type ContactStatus = "not_contacted" | "contacted";
type OrderMember = { id: string; slug: string; name: string; nickname: string; badgeNumber: string; avatar: string; username: string | null; enabled: boolean };
type BookingOrder = {
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
  selected_crew: Pick<OrderMember, "slug" | "name" | "nickname" | "badgeNumber" | "avatar">[];
  project_ref: string | null;
  brief: string;
  assigned_member_id: string | null;
  assigned_member: OrderMember | null;
  acceptance_status: OrderStatus;
  contact_status: ContactStatus;
};
type FilterKey = "all" | "unassigned" | "pending" | "active" | "contacted" | "declined";

const filters: { id: FilterKey; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "unassigned", label: "Chưa phân công" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "active", label: "Đang xử lý" },
  { id: "contacted", label: "Đã liên hệ" },
  { id: "declined", label: "Từ chối" },
];

function dateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function acceptanceLabel(status: OrderStatus) {
  if (status === "accepted") return { text: "Đã đồng ý nhận", className: "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200" };
  if (status === "declined") return { text: "Đã từ chối", className: "border-red-400/25 bg-red-400/[0.08] text-red-200" };
  return { text: "Chờ xác nhận", className: "border-amber-300/25 bg-amber-300/[0.08] text-amber-200" };
}

function contactLabel(status: ContactStatus) {
  return status === "contacted"
    ? { text: "Đã liên hệ khách", className: "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200" }
    : { text: "Chưa liên hệ khách", className: "border-white/10 bg-white/[0.04] text-ivory-muted" };
}

export function AdminOrdersTool() {
  const [orders, setOrders] = useState<BookingOrder[]>([]);
  const [members, setMembers] = useState<OrderMember[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [busyOrderId, setBusyOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401) { window.location.assign("/admin/login"); return; }
      if (!response.ok) throw new Error(result.error || "Không tải được đơn hàng.");
      setOrders(result.orders as BookingOrder[]);
      setMembers(result.members as OrderMember[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("vi");
    return orders.filter((order) => {
      const matchesFilter = filter === "all"
        || (filter === "unassigned" && !order.assigned_member_id)
        || (filter === "pending" && Boolean(order.assigned_member_id) && order.acceptance_status === "pending")
        || (filter === "active" && order.acceptance_status === "accepted" && order.contact_status !== "contacted")
        || (filter === "contacted" && order.contact_status === "contacted")
        || (filter === "declined" && order.acceptance_status === "declined");
      const searchable = [order.order_code, order.customer_name, order.contact_phone, order.contact_zalo, order.contact_email, order.project_ref, order.assigned_member?.name, ...order.services].filter(Boolean).join(" ").toLocaleLowerCase("vi");
      return matchesFilter && (!search || searchable.includes(search));
    });
  }, [filter, orders, query]);

  async function assignOrder(order: BookingOrder, assignedMemberId: string) {
    setBusyOrderId(order.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, assignedMemberId: assignedMemberId || null }),
      });
      const result = await response.json();
      if (response.status === 401) { window.location.assign("/admin/login"); return; }
      if (!response.ok) throw new Error(result.error || "Không phân công được đơn hàng.");
      await loadOrders();
      setNotice(assignedMemberId ? "Đã phân công người nhận đơn. Member sẽ thấy đơn trong không gian riêng." : "Đã gỡ phân công người nhận đơn.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được phân công.");
    } finally {
      setBusyOrderId("");
    }
  }

  const counts: Record<FilterKey, number> = {
    all: orders.length,
    unassigned: orders.filter((order) => !order.assigned_member_id).length,
    pending: orders.filter((order) => Boolean(order.assigned_member_id) && order.acceptance_status === "pending").length,
    active: orders.filter((order) => order.acceptance_status === "accepted" && order.contact_status !== "contacted").length,
    contacted: orders.filter((order) => order.contact_status === "contacted").length,
    declined: orders.filter((order) => order.acceptance_status === "declined").length,
  };

  return (
    <div className="space-y-5">
      <header className="rounded-3xl border border-white/10 bg-obsidian-surface p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-rec">CÔNG CỤ QUẢN TRỊ / CALL SHEET</p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Đơn hàng & lịch đặt</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ivory-muted">Xem thông tin khách, thời gian gửi đơn và phân công một member đang có tài khoản. Member cập nhật việc nhận đơn và liên hệ khách.</p>
          </div>
          <button type="button" onClick={() => void loadOrders()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-mono text-ivory-muted hover:border-rec/50 hover:text-ivory disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />LÀM MỚI</button>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/15 p-3"><span className="text-xs text-ivory-subtle">Tổng đơn</span><strong className="mt-1 block font-display text-2xl">{orders.length}</strong></div>
          <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.035] p-3"><span className="text-xs text-ivory-subtle">Chưa phân công</span><strong className="mt-1 block font-display text-2xl text-amber-200">{counts.unassigned}</strong></div>
          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.035] p-3"><span className="text-xs text-ivory-subtle">Đã liên hệ khách</span><strong className="mt-1 block font-display text-2xl text-emerald-200">{counts.contacted}</strong></div>
        </div>
      </header>

      {error ? <p role="alert" className="rounded-xl border border-red-400/25 bg-red-400/[0.06] p-4 text-sm text-red-200">{error}</p> : null}
      {notice ? <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4 text-sm text-emerald-100"><Check className="h-4 w-4" />{notice}</p> : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-obsidian-surface p-3 sm:p-4">
        <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-subtle" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã đơn, khách hàng, SĐT, member..." className="w-full rounded-xl border border-white/10 bg-obsidian py-3 pl-10 pr-3 text-sm text-ivory outline-none placeholder:text-ivory-subtle focus:border-rec/60" /></label>
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Lọc đơn hàng">
          {filters.map((item) => <button key={item.id} type="button" role="tab" aria-selected={filter === item.id} onClick={() => setFilter(item.id)} className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-medium transition ${filter === item.id ? "border-rec bg-rec text-obsidian" : "border-white/10 text-ivory-muted hover:border-white/25 hover:text-ivory"}`}>{item.label}<span className="font-mono text-[10px] opacity-75">{counts[item.id]}</span></button>)}
        </div>
      </div>

      {loading ? <div className="rounded-2xl border border-white/10 bg-obsidian-surface p-8 text-center text-sm text-ivory-muted">Đang tải danh sách đơn...</div>
        : error && orders.length === 0 ? null
        : filteredOrders.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-surface p-8 text-center"><ShoppingBag className="mx-auto h-7 w-7 text-ivory-subtle" /><p className="mt-3 font-semibold">{orders.length ? "Không có đơn phù hợp" : "Chưa có đơn hàng"}</p><p className="mt-1 text-sm text-ivory-muted">Đơn mới từ biểu mẫu đặt lịch trên website sẽ xuất hiện ở đây.</p></div>
        : <div className="grid gap-4 2xl:grid-cols-2">{filteredOrders.map((order) => {
          const acceptance = acceptanceLabel(order.acceptance_status);
          const contact = contactLabel(order.contact_status);
          return <article key={order.id} className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-obsidian-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
              <div className="min-w-0"><p className="font-mono text-[10px] tracking-[0.14em] text-rec">MÃ ĐƠN</p><h3 className="mt-1 break-all font-display text-lg font-bold sm:text-xl">{order.order_code}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-ivory-muted"><Clock3 className="h-3.5 w-3.5" />Đặt lúc {dateTime(order.created_at)}</p></div>
              <div className="flex flex-wrap gap-1.5"><span className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${acceptance.className}`}>{acceptance.text}</span><span className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${contact.className}`}>{contact.text}</span></div>
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
              <section className="space-y-2 rounded-xl border border-white/10 bg-black/10 p-3.5 sm:col-span-2">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ivory"><Users className="h-3.5 w-3.5 text-rec" />Ekip khách chọn</h4>
                {order.selected_crew?.length ? <div className="flex flex-wrap gap-2">{order.selected_crew.map((member) => <span key={member.slug} className="inline-flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-3 text-xs text-ivory-muted">{member.avatar ? <img src={member.avatar} alt="" className="h-6 w-6 rounded-full object-cover" /> : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[9px]">{member.badgeNumber}</span>}{member.nickname || member.name}</span>)}</div> : <p className="text-sm text-ivory-subtle">Khách chưa chọn member cụ thể.</p>}
                {order.brief ? <p className="whitespace-pre-wrap break-words border-t border-white/10 pt-2 text-sm leading-relaxed text-ivory-muted">{order.brief}</p> : null}
              </section>
              <section className="space-y-2 sm:col-span-2">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">Member nhận xử lý đơn</label>
                <select value={order.assigned_member_id ?? ""} disabled={busyOrderId === order.id} onChange={(event) => void assignOrder(order, event.target.value)} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-3 text-sm text-ivory outline-none focus:border-rec/60 disabled:opacity-60">
                  <option value="">Chưa phân công</option>
                  {members.filter((member) => member.enabled).map((member) => <option key={member.id} value={member.id}>#{member.badgeNumber} · {member.name}{member.nickname ? ` (${member.nickname})` : ""}</option>)}
                </select>
                {busyOrderId === order.id ? <p className="text-xs text-ivory-subtle">Đang lưu phân công...</p> : order.assigned_member ? <p className="text-xs text-ivory-subtle">Member sẽ tự xác nhận nhận đơn hoặc từ chối trong mục Đơn hàng của họ.</p> : <p className="text-xs text-amber-200/80">Chỉ member có tài khoản đang hoạt động mới nhận được đơn phân công.</p>}
              </section>
            </div>
          </article>;
        })}</div>}
    </div>
  );
}
