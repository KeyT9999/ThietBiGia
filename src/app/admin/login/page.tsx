"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const client = createSupabaseBrowserClient();
    if (!client) {
      setError("Chưa cấu hình Supabase URL và anon key.");
      return;
    }
    setBusy(true);
    const result = await client.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) {
      setError("Đăng nhập thất bại. Kiểm tra email, mật khẩu và trạng thái tài khoản.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-obsidian px-4 py-20 text-ivory">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-obsidian-surface p-6 shadow-2xl sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono text-ivory-muted hover:text-rec"><ArrowLeft className="h-4 w-4" /> VỀ WEBSITE</Link>
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-rec text-obsidian"><LockKeyhole className="h-5 w-5" /></div>
        <p className="mt-5 font-mono text-[11px] tracking-[0.2em] text-rec">THIẾT BỊ GIA / ADMIN</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Đăng nhập quản trị</h1>
        <p className="mt-2 text-sm leading-relaxed text-ivory-muted">Chỉ tài khoản được cấp quyền admin mới có thể chỉnh sửa website.</p>
        {!configured ? (
          <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-100">Supabase chưa được cấu hình. Hãy điền biến môi trường trong .env.local rồi khởi động lại website.</div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block space-y-1.5"><span className="text-xs font-mono text-ivory-muted">EMAIL ADMIN</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm outline-none focus:border-rec" /></label>
            <label className="block space-y-1.5"><span className="text-xs font-mono text-ivory-muted">MẬT KHẨU</span><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm outline-none focus:border-rec" /></label>
            {error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
            <button disabled={busy} className="w-full rounded-xl bg-rec px-4 py-3 text-xs font-mono font-bold text-obsidian disabled:opacity-60">{busy ? "ĐANG KIỂM TRA..." : "ĐĂNG NHẬP"}</button>
            <p className="text-xs leading-relaxed text-ivory-subtle">Tạo tài khoản trong Supabase Auth và khai báo email đó trong ADMIN_EMAILS.</p>
          </form>
        )}
      </div>
    </main>
  );
}
