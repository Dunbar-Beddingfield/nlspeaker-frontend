"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { getAdminMedia, createMediaItem, updateMediaItem, deleteMediaItem, uploadImage, uploadDocument, revalidateCache, CACHE_TAGS } from "@/lib/api";
import { compressImage } from "@/lib/utils";
import type { MediaItem, MediaType } from "@/types";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#0B1120] border border-[rgba(245,158,11,0.12)] text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5";

const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: "photo", label: "Photo" }, { value: "logo", label: "Logo" },
  { value: "press-logo", label: "Press Logo" }, { value: "video-clip", label: "Video Clip" },
  { value: "document", label: "Document" },
];

const EMPTY = { type: "photo" as MediaType, title: "", url: "", thumbnailUrl: "", description: "", category: "", isPublic: true };

export default function AdminMediaPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    getAdminMedia(token).then((r) => setItems(r.data ?? [])).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, [token]);

  function openCreate() { setEditing(null); setForm({ ...EMPTY }); setOpen(true); }
  function openEdit(m: MediaItem) { setEditing(m); setForm({ type: m.type, title: m.title, url: m.url, thumbnailUrl: m.thumbnailUrl ?? "", description: m.description ?? "", category: m.category ?? "", isPublic: m.isPublic }); setOpen(true); }

  async function handleFile(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      let url = "";
      if (form.type === "document") {
        const reader = new FileReader();
        const b64 = await new Promise<string>((res) => { reader.onload = (e) => res(e.target!.result as string); reader.readAsDataURL(file); });
        const r = await uploadDocument(b64, "media-documents", token);
        url = r.data.url;
      } else {
        const b64 = await compressImage(file);
        const r = await uploadImage(b64, "media", token);
        url = r.data.url;
      }
      setForm((f) => ({ ...f, url }));
      toast.success("Uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!token || !form.title?.trim() || !form.url?.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const r = await updateMediaItem(editing._id, form, token);
        setItems((prev) => prev.map((x) => x._id === editing._id ? r.data : x));
        toast.success("Updated");
      } else {
        const r = await createMediaItem(form, token);
        setItems((prev) => [r.data, ...prev]);
        toast.success("Added");
      }
      await revalidateCache(CACHE_TAGS.media);
      setOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(m: MediaItem) {
    if (!token || !confirm(`Delete "${m.title}"?`)) return;
    try {
      await deleteMediaItem(m._id, token);
      await revalidateCache(CACHE_TAGS.media);
      setItems((prev) => prev.filter((x) => x._id !== m._id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  const filtered = filterType === "all" ? items : items.filter((m) => m.type === filterType);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#F8FAFC]">Media</h1><p className="text-sm text-[#64748B] mt-0.5">{items.length} items</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-gold text-white text-sm font-medium hover:opacity-90 transition-opacity"><Plus className="w-4 h-4" /> Add Media</button>
      </div>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ value: "all", label: "All" }, ...MEDIA_TYPES].map((t) => (
          <button key={t.value} onClick={() => setFilterType(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterType === t.value ? "border-[#F59E0B] bg-[rgba(245,158,11,0.1)] text-[#F59E0B]" : "border-[rgba(245,158,11,0.12)] text-[#64748B] hover:border-[rgba(245,158,11,0.3)]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-center py-16 text-[#64748B]">Loading…</p> : filtered.length === 0 ? <p className="text-center py-16 text-[#64748B]">No media yet.</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((m) => (
            <div key={m._id} className="group relative rounded-xl overflow-hidden bg-[#111827] border border-[rgba(245,158,11,0.08)]">
              <div className="aspect-square bg-[#1A2540] flex items-center justify-center overflow-hidden">
                {(m.type !== "document" && m.type !== "video-clip") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.thumbnailUrl || m.url} alt={m.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[#64748B] text-xs text-center p-3">
                    <div className="text-2xl mb-1">{m.type === "video-clip" ? "▶" : "📄"}</div>
                    {m.type}
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-[#F8FAFC] truncate">{m.title}</p>
                <p className="text-xs text-[#475569]">{m.type}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={m.url} target="_blank" rel="noreferrer" className="w-7 h-7 bg-black/70 rounded-lg flex items-center justify-center text-white hover:bg-[rgba(245,158,11,0.8)] transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
                <button onClick={() => openEdit(m)} className="w-7 h-7 bg-black/70 rounded-lg flex items-center justify-center text-white hover:bg-[rgba(245,158,11,0.8)] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(m)} className="w-7 h-7 bg-black/70 rounded-lg flex items-center justify-center text-white hover:bg-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-[#111827] border-l border-[rgba(245,158,11,0.12)] overflow-y-auto w-full sm:max-w-md">
          <SheetHeader className="mb-6"><SheetTitle className="text-[#F8FAFC]">{editing ? "Edit Media Item" : "Add Media Item"}</SheetTitle></SheetHeader>
          <div className="space-y-4">
            <div><label className={labelCls}>Type</label>
              <select className={inputCls} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as MediaType }))}>
                {MEDIA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Title *</label><input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            {/* File upload or manual URL */}
            <div>
              <label className={labelCls}>File / URL *</label>
              {form.url ? (
                <div className="flex items-center gap-2">
                  <input className={`${inputCls} flex-1`} value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} readOnly />
                  <button onClick={() => setForm((f) => ({ ...f, url: "" }))} className="text-red-400 hover:text-red-300 shrink-0"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full flex items-center justify-center gap-2 py-5 rounded-lg border border-dashed border-[rgba(245,158,11,0.2)] text-[#64748B] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors text-sm disabled:opacity-50"><ImagePlus className="w-4 h-4" />{uploading ? "Uploading…" : "Upload file"}</button>
                  <input className={inputCls} placeholder="Or paste URL directly" onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
                </div>
              )}
              <input ref={fileRef} type="file" accept={form.type === "document" ? ".pdf,.doc,.docx" : "image/*"} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
            </div>
            <div><label className={labelCls}>Thumbnail URL (optional)</label><input className={inputCls} value={form.thumbnailUrl} onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Category</label><input className={inputCls} value={form.category} placeholder="e.g. headshots" onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} /></div>
            </div>
            <div><label className={labelCls}>Description</label><input className={inputCls} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isPublic} onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} className="accent-[#F59E0B] w-4 h-4" /><span className="text-sm text-[#94A3B8]">Publicly visible</span></label>
            <button onClick={handleSave} disabled={saving || !form.title?.trim() || !form.url?.trim()} className="w-full gradient-gold text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 h-11">{saving ? "Saving…" : editing ? "Save Changes" : "Add Media"}</button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
