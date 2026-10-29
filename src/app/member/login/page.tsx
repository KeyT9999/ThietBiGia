"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, UserRound } from "lucide-react";

export default function MemberLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/member/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Đăng nhập chưa thành công.");
      router.replace("/member/profile");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể đăng nhập. Hãy thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-obsidian px-4 py-16 text-ivory">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-obsidian-surface p-6 shadow-2xl sm:p-8">
        <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-xs font-mono text-ivory-muted hover:text-rec"><ArrowLeft className="h-4 w-4" /> VỀ WEBSITE</Link>
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-rec text-obsidian"><UserRound className="h-5 w-5" /></div>
        <p className="mt-5 font-mono text-[11px] tracking-[0.2em] text-rec">THIẾT BỊ GIA / MEMBER</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Đăng nhập thành viên</h1>
        <p className="mt-2 text-sm leading-relaxed text-ivory-muted">Dùng tên đăng nhập và mật khẩu do quản trị viên cấp. Không cần tài khoản email Supabase.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block space-y-1.5"><span className="text-xs font-mono text-ivory-muted">TÊN ĐĂNG NHẬP</span><input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm outline-none focus:border-rec" /></label>
          <label className="block space-y-1.5"><span className="text-xs font-mono text-ivory-muted">MẬT KHẨU</span><input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm outline-none focus:border-rec" /></label>
          {error ? <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm leading-relaxed text-red-200">{error}</p> : null}
          <button disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-rec px-4 py-3 text-xs font-mono font-bold text-obsidian disabled:opacity-60"><KeyRound className="h-4 w-4" />{busy ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}</button>
        </form>
        <p className="mt-5 text-xs leading-relaxed text-ivory-subtle">Chưa có tài khoản hoặc quên mật khẩu? Liên hệ quản trị viên để được cấp hoặc đặt lại.</p>
      </div>
    </main>
  );
}
