"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";

class CloudinaryFileSizeError extends Error {
  constructor(message: string, readonly maximumBytes?: number) {
    super(message);
    this.name = "CloudinaryFileSizeError";
  }
}

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(0)} MiB`;
}

async function optimizeImageForCloudinary(file: File, maximumBytes: number) {
  if (!["image/jpeg", "image/png", "image/bmp"].includes(file.type)) {
    throw new Error(
      `Cloudinary hiện chỉ nhận tệp tối đa ${formatBytes(maximumBytes)}. Trình duyệt không thể nén an toàn định dạng ${file.type || "này"}; hãy dùng ảnh JPEG, PNG hoặc BMP, hoặc tăng hạn mức tài khoản Cloudinary.`
    );
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Không thể đọc ảnh để tự tối ưu. Hãy thử lưu ảnh dưới dạng JPEG hoặc PNG rồi tải lại.");
  }

  try {
    const targetBytes = Math.floor(maximumBytes * 0.9);
    let width = bitmap.width;
    let height = bitmap.height;
    const qualities = [0.9, 0.82, 0.74];

    for (let pass = 0; pass < 10; pass += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Trình duyệt không thể xử lý ảnh này.");
      context.drawImage(bitmap, 0, 0, width, height);

      let smallestBlob: Blob | null = null;
      for (const quality of qualities) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", quality)
        );
        if (!blob || blob.type !== "image/webp") {
          throw new Error("Trình duyệt này không hỗ trợ tự tối ưu ảnh. Hãy thử Chrome hoặc Edge mới nhất.");
        }
        if (!smallestBlob || blob.size < smallestBlob.size) smallestBlob = blob;
        if (blob.size <= targetBytes) {
          const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
          return new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });
        }
      }

      if (!smallestBlob) break;
      const scale = Math.min(0.88, Math.sqrt(targetBytes / smallestBlob.size) * 0.92);
      const nextWidth = Math.max(1, Math.floor(width * scale));
      const nextHeight = Math.max(1, Math.floor(height * scale));
      if (nextWidth === width && nextHeight === height) break;
      width = nextWidth;
      height = nextHeight;
    }

    throw new Error(
      `Ảnh vẫn vượt hạn mức Cloudinary (${formatBytes(maximumBytes)}) sau khi tự tối ưu. Hãy chọn ảnh nhỏ hơn hoặc tăng hạn mức tài khoản Cloudinary.`
    );
  } finally {
    bitmap.close();
  }
}

async function uploadImageToCloudinary(
  file: File,
  folder: string,
  onStatus?: (status: string) => void,
  signatureEndpoint = "/api/admin/cloudinary-signature"
) {
  const signedResponse = await fetch(signatureEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  const signed = await signedResponse.json();
  if (!signedResponse.ok) throw new Error(signed.error || "Không thể bắt đầu upload.");

  async function sendToCloudinary(image: File) {
    const form = new FormData();
    form.append("file", image);
    form.append("api_key", signed.apiKey);
    form.append("timestamp", String(signed.timestamp));
    form.append("folder", signed.folder);
    form.append("signature", signed.signature);
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/" + signed.cloudName + "/image/upload",
      { method: "POST", body: form }
    );
    const result = await response.json();
    if (!response.ok || !result.secure_url) {
      const message = result.error?.message || "Cloudinary từ chối ảnh.";
      const maximumMatch = message.match(/maximum\s+is\s+([\d,]+)/i);
      const maximumBytes = maximumMatch
        ? Number(maximumMatch[1].replaceAll(",", ""))
        : undefined;
      if (response.status === 413 || /file size too large/i.test(message)) {
        throw new CloudinaryFileSizeError(message, maximumBytes);
      }
      throw new Error(message);
    }
    return result.secure_url as string;
  }

  try {
    return { url: await sendToCloudinary(file), optimized: false };
  } catch (cause) {
    if (!(cause instanceof CloudinaryFileSizeError)) throw cause;
    onStatus?.("ẢNH VƯỢT HẠN MỨC CLOUDINARY — ĐANG TỰ TỐI ƯU...");
    const maximumBytes = cause.maximumBytes || 10 * 1024 * 1024;
    const optimized = await optimizeImageForCloudinary(file, maximumBytes);
    onStatus?.("ĐANG TẢI ẢNH ĐÃ TỐI ƯU...");
    return { url: await sendToCloudinary(optimized), optimized: true };
  }
}

export function AdminStringListField({
  label,
  value,
  onChange,
  placeholder = "Nhập nội dung",
  addLabel = "THÊM MỤC",
  reorderable = false,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  reorderable?: boolean;
}) {
  function updateItem(index: number, text: string) {
    onChange(value.map((item, itemIndex) => itemIndex === index ? text : item));
  }

  function removeItem(index: number) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveItem(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">{label}</span>
      {value.map((item, index) => (
        <div key={`${label}-${index}`} className="flex items-center gap-2">
          <span className="w-7 shrink-0 text-center font-mono text-[10px] text-rec">{String(index + 1).padStart(2, "0")}</span>
          <input
            value={item}
            onChange={(event) => updateItem(index, event.target.value)}
            onBlur={() => {
              const cleaned = value.map((entry) => entry.trim()).filter(Boolean);
              if (cleaned.length !== value.length || cleaned.some((entry, itemIndex) => entry !== value[itemIndex])) onChange(cleaned);
            }}
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm text-ivory outline-none focus:border-rec"
          />
          {reorderable ? <div className="flex shrink-0 flex-col gap-1"><button type="button" disabled={index === 0} onClick={() => moveItem(index, index - 1)} aria-label={`Đưa ${label} ${index + 1} lên`} className="rounded border border-white/10 p-1.5 text-ivory-muted disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button><button type="button" disabled={index === value.length - 1} onClick={() => moveItem(index, index + 1)} aria-label={`Đưa ${label} ${index + 1} xuống`} className="rounded border border-white/10 p-1.5 text-ivory-muted disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button></div> : null}
          <button type="button" onClick={() => removeItem(index)} aria-label={`Gỡ ${label} ${index + 1}`} className="rounded-lg border border-red-400/20 p-2.5 text-red-300 hover:bg-red-400/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ""])} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-mono text-ivory hover:border-rec">
        <Plus className="h-3.5 w-3.5 text-rec" /> {addLabel}
      </button>
    </div>
  );
}

export function AdminField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full resize-y rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm leading-relaxed text-ivory outline-none focus:border-rec"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-obsidian px-3.5 py-3 text-sm text-ivory outline-none focus:border-rec"
        />
      )}
      {hint ? <span className="block text-xs text-ivory-subtle">{hint}</span> : null}
    </label>
  );
}

export function AdminListField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
}) {
  return (
    <AdminField
      label={label}
      multiline
      rows={4}
      value={value.join("\n")}
      onChange={(text) => onChange(text.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))}
      hint={hint || "Mỗi dòng là một mục."}
    />
  );
}

export function AdminImageField({
  label,
  value,
  folder,
  onChange,
  signatureEndpoint,
}: {
  label: string;
  value: string;
  folder: string;
  onChange: (value: string) => void;
  signatureEndpoint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setStatus("ĐANG GỬI ẢNH...");
    setError("");
    try {
      const result = await uploadImageToCloudinary(file, folder, setStatus, signatureEndpoint);
      onChange(result.url);
      if (result.optimized) setStatus("Ảnh đã được tự tối ưu và tải lên thành công.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload ảnh thất bại.");
    } finally {
      setBusy(false);
      setStatus((current) => current.startsWith("Ảnh đã được") ? current : "");
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {value ? <img src={value} alt="" className="h-16 w-24 rounded-lg border border-white/10 object-cover" /> : null}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-3.5 py-2.5 text-xs font-mono text-ivory hover:border-rec">
          <ImagePlus className="h-4 w-4 text-rec" />
          {busy ? "ĐANG TẢI..." : "TẢI ẢNH LÊN CLOUDINARY"}
          <input type="file" accept="image/*" disabled={busy} className="hidden" onChange={(event) => { void upload(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} />
        </label>
      </div>
      <p className="text-xs text-ivory-subtle">Ảnh JPEG, PNG hoặc BMP vượt hạn mức Cloudinary sẽ tự tối ưu trước khi tải lại.</p>
      <AdminField label="URL ảnh" value={value} onChange={onChange} />
      {status ? <p className="text-xs text-emerald-300">{status}</p> : null}
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

export function AdminMultiImageField({
  label,
  folder,
  onUploaded,
  signatureEndpoint,
}: {
  label: string;
  folder: string;
  onUploaded: (urls: string[]) => void;
  signatureEndpoint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function upload(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    setError("");
    setStatus("");
    const uploaded: string[] = [];
    const failures: string[] = [];

    for (const [index, file] of files.entries()) {
      setStatus(`ĐANG TẢI ${index + 1}/${files.length}: ${file.name}`);
      try {
        const result = await uploadImageToCloudinary(
          file,
          folder,
          (message) => setStatus(`${index + 1}/${files.length} · ${message}`),
          signatureEndpoint
        );
        uploaded.push(result.url);
      } catch (cause) {
        failures.push(`${file.name}: ${cause instanceof Error ? cause.message : "Upload thất bại."}`);
      }
    }

    if (uploaded.length) onUploaded(uploaded);
    setBusy(false);
    if (failures.length) {
      const summary = failures.slice(0, 3).join(" · ");
      const remaining = failures.length > 3 ? ` · và ${failures.length - 3} ảnh khác` : "";
      setError(`Tải được ${uploaded.length}/${files.length} ảnh. ${summary}${remaining}`);
      setStatus("");
    } else {
      setStatus(`Đã tải xong ${uploaded.length} ảnh vào album.`);
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-obsidian/40 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="block text-xs font-mono font-semibold uppercase tracking-wide text-ivory-muted">{label}</span>
          <span className="mt-1 block text-xs text-ivory-subtle">Chọn nhiều ảnh trong cùng một lần. Ảnh sẽ được thêm vào cuối album.</span>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-3.5 py-2.5 text-xs font-mono text-ivory hover:border-rec">
          <ImagePlus className="h-4 w-4 text-rec" />
          {busy ? "ĐANG TẢI..." : "CHỌN NHIỀU ẢNH"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            className="hidden"
            onChange={(event) => {
              void upload(Array.from(event.currentTarget.files ?? []));
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
      {status ? <p className="text-xs text-emerald-300">{status}</p> : null}
      {error ? <p className="break-words text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

export function JsonArrayField<T>({
  label,
  value,
  onChange,
}: {
  label: string;
  value: T[];
  onChange: (value: T[]) => void;
}) {
  const [draft, setDraft] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState("");

  useEffect(() => setDraft(JSON.stringify(value, null, 2)), [value]);

  function apply() {
    try {
      const parsed: unknown = JSON.parse(draft);
      if (!Array.isArray(parsed)) throw new Error("Nội dung phải là một danh sách JSON.");
      onChange(parsed as T[]);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "JSON không hợp lệ.");
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div>
        <h3 className="font-display text-lg font-bold text-ivory">{label}</h3>
        <p className="mt-1 text-xs text-ivory-subtle">Danh sách nâng cao dạng JSON; dữ liệu cần đúng cấu trúc trước khi lưu.</p>
      </div>
      <textarea rows={15} value={draft} onChange={(event) => setDraft(event.target.value)} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-3 font-mono text-xs leading-relaxed text-ivory outline-none focus:border-rec" />
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <button type="button" onClick={apply} className="rounded-xl border border-white/15 px-4 py-2 text-xs font-mono text-ivory hover:border-rec">ÁP DỤNG DANH SÁCH</button>
    </section>
  );
}
