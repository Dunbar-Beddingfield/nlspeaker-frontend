"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import {
  getAdminServices, createService, updateService, deleteService,
  uploadImage, revalidateCache, CACHE_TAGS,
} from "@/lib/api";
import { compressImage, cleanPayload } from "@/lib/utils";
import type { Service } from "@/types";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#0B1120] border border-[rgba(245,158,11,0.12)] text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5";

const EMPTY: Partial<Service> = {
  slug: "", title: "", shortDescription: "", fullDescription: "",
  outcomes: [], idealAudience: "", duration: "", coverImage: "", order: 0, isActive: true,
};

export default function AdminServicesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<Partial<Service>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [outcomesText, setOutcomesText] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    getAdminServices(token)
      .then((r) => setItems(r.data ?? []))
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setLoading(false));
  }, [token]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setOutcomesText("");
    setOpen(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setForm({ ...s });
    setOutcomesText(s.outcomes?.join("\n") ?? "");
    setOpen(true);
  }

  async function handleImage(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const b64 = await compressImage(file);
      const r = await uploadImage(b64, "services", token);
      setForm((f) => ({ ...f, coverImage: r.data.url }));
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!token || !form.title?.trim() || !form.slug?.trim()) return;
    setSaving(true);
    try {
      const payload = { ...cleanPayload(form), outcomes: outcomesText.split("\n").map((s) => s.trim()).filter(Boolean) };
      if (editing) {
        const r = await updateService(editing._id, payload, token);
        setItems((prev) => prev.map((x) => x._id === editing._id ? r.data : x));
        toast.success("Service updated");
      } else {
        const r = await createService(payload, token);
        setItems((prev) => [r.data, ...prev]);
        toast.success("Service created");
      }
      await revalidateCache(CACHE_TAGS.services);
      setOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(s: Service) {
    if (!token || !confirm(`Delete "${s.title}"?`)) return;
    try {
      await deleteService(s._id, token);
      await revalidateCache(CACHE_TAGS.services);
      setItems((prev) => prev.filter((x) => x._id !== s._id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  async function toggleActive(s: Service) {
    if (!token) return;
    try {
      const r = await updateService(s._id, { isActive: !s.isActive }, token);
      await revalidateCache(CACHE_TAGS.services);
      setItems((prev) => prev.map((x) => x._id === s._id ? r.data : x));
    } catch { toast.error("Update failed"); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Services</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{items.length} speaking programs</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-gold text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {loading ? (
        <p className="text-center py-16 text-[#64748B]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-center py-16 text-[#64748B]">No services yet. Add your first one.</p>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s._id} className="flex items-center gap-4 p-4 rounded-xl bg-[#111827] border border-[rgba(245,158,11,0.08)]">
              <GripVertical className="w-4 h-4 text-[#334155] shrink-0" />
              {s.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.coverImage} alt={s.title} className="w-14 h-10 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#F8FAFC] text-sm truncate">{s.title}</p>
                <p className="text-xs text-[#475569] truncate">{s.shortDescription}</p>
              </div>
              {s.duration && <span className="text-xs text-[#64748B] shrink-0">{s.duration}</span>}
              <button onClick={() => toggleActive(s)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all shrink-0 ${s.isActive ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-[rgba(245,158,11,0.15)] text-[#64748B]"}`}>
                {s.isActive ? "Active" : "Inactive"}
              </button>
              <button onClick={() => openEdit(s)} className="text-[#64748B] hover:text-[#F59E0B] transition-colors shrink-0"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(s)} className="text-[#64748B] hover:text-red-400 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-[#111827] border-l border-[rgba(245,158,11,0.12)] overflow-y-auto w-full sm:max-w-lg">
          <SheetHeader className="mb-6"><SheetTitle className="text-[#F8FAFC]">{editing ? "Edit Service" : "New Service"}</SheetTitle></SheetHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Title *</label><input className={inputCls} value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
              <div><label className={labelCls}>Slug *</label><input className={inputCls} value={form.slug ?? ""} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
            </div>
            <div><label className={labelCls}>Short Description</label><input className={inputCls} value={form.shortDescription ?? ""} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} /></div>
            <div><label className={labelCls}>Full Description</label><textarea rows={4} className={`${inputCls} resize-none`} value={form.fullDescription ?? ""} onChange={(e) => setForm((f) => ({ ...f, fullDescription: e.target.value }))} /></div>
            <div><label className={labelCls}>Outcomes (one per line)</label><textarea rows={4} className={`${inputCls} resize-none`} value={outcomesText} onChange={(e) => setOutcomesText(e.target.value)} placeholder="Audience leaves with X&#10;Speakers gain Y" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Ideal Audience</label><input className={inputCls} value={form.idealAudience ?? ""} onChange={(e) => setForm((f) => ({ ...f, idealAudience: e.target.value }))} /></div>
              <div><label className={labelCls}>Duration</label><input className={inputCls} value={form.duration ?? ""} placeholder="60 min" onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Order</label><input type="number" className={inputCls} value={form.order ?? 0} onChange={(e) => setForm((f) => ({ ...f, order: +e.target.value }))} /></div>
              <div className="flex items-end pb-1"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-[#F59E0B] w-4 h-4" /><span className="text-sm text-[#94A3B8]">Active</span></label></div>
            </div>
            {/* Cover image */}
            <div>
              <label className={labelCls}>Cover Image</label>
              {form.coverImage ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.coverImage} alt="Cover" className="w-full h-32 object-cover rounded-lg border border-[rgba(245,158,11,0.12)]" />
                  <button onClick={() => setForm((f) => ({ ...f, coverImage: "" }))} className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <button onClick={() => imgRef.current?.click()} disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 py-7 rounded-lg border border-dashed border-[rgba(245,158,11,0.2)] text-[#64748B] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors text-sm disabled:opacity-50">
                  <ImagePlus className="w-4 h-4" /> {uploading ? "Uploading…" : "Upload cover image"}
                </button>
              )}
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ""; }} />
            </div>
            <button onClick={handleSave} disabled={saving || !form.title?.trim() || !form.slug?.trim()}
              className="w-full gradient-gold text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 h-11">
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Service"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
