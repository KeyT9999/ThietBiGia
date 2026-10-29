"use client";

import { useEffect, useState } from "react";
import { Check, Copy, KeyRound, LockKeyhole, RefreshCw, ShieldCheck, ShieldOff } from "lucide-react";

type MemberAccount = {
  member_id: string;
  username: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export function MemberAccountTools({ memberId, slug, canManage }: { memberId: string; slug: string; canManage: boolean }) {
  const [account, setAccount] = useState<MemberAccount | null>(null);
  const [username, setUsername] = useState(slug);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAccount(null);
    setUsername(slug);
    setTemporaryPassword("");
    setError("");
    setNotice("");
    if (!canManage) return;
    let alive = true;
    setLoading(true);
    fetch(`/api/admin/member-accounts?memberId=${encodeURIComponent(memberId)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Không tải được tài khoản.");
        if (alive) setAccount(result.account as MemberAccount | null);
      })
      .catch((cause) => { if (alive) setError(cause instanceof Error ? cause.message : "Không tải được tài khoản."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [memberId, slug, canManage]);

  async function rotatePassword(action: "create" | "reset") {
    setBusy(true);
    setError("");
    setNotice("");
    setTemporaryPassword("");
    try {
      const response = await fetch("/api/admin/member-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, username, action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Không cập nhật được tài khoản.");
      setAccount(result.account as MemberAccount);
      setTemporaryPassword(result.temporaryPassword as string);
      setNotice(action === "create" ? "Đã tạo tài khoản member." : "Đã đặt lại mật khẩu. Mật khẩu cũ đã bị vô hiệu hóa.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được tài khoản.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleAccount() {
    if (!account) return;
    setBusy(true);
    setError("");
    setTemporaryPassword("");
    try {
      const response = await fetch("/api/admin/member-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, enabled: !account.is_enabled }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Không đổi được trạng thái.");
      setAccount(result.account as MemberAccount);
      setNotice(account.is_enabled ? "Đã khóa tài khoản và kết thúc các phiên đăng nhập." : "Đã mở lại tài khoản member.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không đổi được trạng thái.");
    } finally {
      setBusy(false);
    }
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Không truy cập được clipboard. Hãy chọn và sao chép mật khẩu đang hiển thị.");
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0a0b0e]/70 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-rec/25 bg-rec/10 p-2 text-rec"><KeyRound className="h-4 w-4" /></div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold">Tài khoản đăng nhập member</h3>
          <p className="mt-1 text-xs leading-relaxed text-ivory-muted">Member đăng nhập riêng tại /member/login. Khi tạo hoặc đặt lại tài khoản, mật khẩu được cấp là 123. Member có thể đổi sau khi đăng nhập; admin không xem mật khẩu member tự đặt.</p>
        </div>
      </div>

      {!canManage ? <p className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">Lưu hồ sơ thành viên trước, sau đó tạo tài khoản đăng nhập cho họ.</p> : loading ? <p className="text-sm text-ivory-subtle">Đang kiểm tra tài khoản...</p> : null}

      {canManage && !loading && !account ? <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="block space-y-1.5"><span className="block text-xs font-mono uppercase text-ivory-muted">Tên đăng nhập</span><input autoComplete="off" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm text-ivory outline-none focus:border-rec" /><span className="block text-xs text-ivory-subtle">Mặc định lấy từ slug profile, member không cần email.</span></label>
        <button type="button" disabled={busy || !username.trim()} onClick={() => void rotatePassword("create")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rec px-4 py-3 text-xs font-mono font-bold text-obsidian disabled:opacity-50"><KeyRound className="h-4 w-4" />{busy ? "ĐANG TẠO..." : "TẠO TÀI KHOẢN"}</button>
      </div> : null}

      {canManage && !loading && account ? <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[180px] flex-1 rounded-xl border border-white/10 bg-obsidian px-3.5 py-3"><span className="block text-[10px] font-mono text-ivory-subtle">TÊN ĐĂNG NHẬP</span><span className="mt-1 block break-all text-sm font-semibold text-ivory">{account.username}</span></div>
        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs ${account.is_enabled ? "border-emerald-400/20 text-emerald-200" : "border-amber-300/20 text-amber-100"}`}>{account.is_enabled ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}{account.is_enabled ? "Đang hoạt động" : "Đang khóa"}</span>
        <button type="button" disabled={busy} onClick={() => void rotatePassword("reset")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-mono text-ivory hover:border-rec disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" />ĐẶT LẠI MẬT KHẨU</button>
        <button type="button" disabled={busy} onClick={() => void toggleAccount()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-mono text-ivory-muted hover:text-ivory disabled:opacity-50"><LockKeyhole className="h-3.5 w-3.5" />{account.is_enabled ? "KHÓA" : "MỞ KHÓA"}</button>
      </div> : null}

      {temporaryPassword ? <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
        <p className="text-xs font-mono text-emerald-200">MẬT KHẨU TẠM — HIỂN THỊ MỘT LẦN</p>
        <p className="mt-1 text-xs text-ivory-muted">Gửi mật khẩu 123 cho member. Họ có thể tự đổi mật khẩu sau khi đăng nhập.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2"><code className="min-w-0 flex-1 break-all rounded-lg bg-black/40 px-3 py-2.5 font-mono text-sm text-ivory">{temporaryPassword}</code><button type="button" onClick={() => void copyPassword()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-ivory">{copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}{copied ? "ĐÃ SAO CHÉP" : "SAO CHÉP"}</button></div>
      </div> : null}
      {notice ? <p className="text-sm text-emerald-200">{notice}</p> : null}
      {error ? <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</p> : null}
    </section>
  );
}
