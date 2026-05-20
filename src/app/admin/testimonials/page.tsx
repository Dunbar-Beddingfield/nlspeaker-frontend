"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Star, CheckCircle2, XCircle, Sparkles, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import {
  getAdminTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  uploadImage, revalidateCache, CACHE_TAGS,
} from "@/lib/api";
import { compressImage } from "@/lib/utils";
import type { Testimonial } from "@/types";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#0B1120] border border-[rgba(245,158,11,0.12)] text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5";
const EMPTY = { authorName: "", authorTitle: "", authorOrganization: "", authorPhoto: "", text: "", rating: 5, serviceSlug: "", videoUrl: "", isApproved: false, isFeatured: false, order: 0 };

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={`w-6 h-6 transition-colors ${n <= value ? "fill-amber-400 text-amber-400" : "text-[#334155] hover:text-amber-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    getAdminTestimonials(token).then((r) => setItems(r.data ?? [])).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, [token]);

  function openCreate() { setEditing(null); setForm({ ...EMPTY }); setOpen(true); }
  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm({ authorName: t.authorName, authorTitle: t.authorTitle, authorOrganization: t.authorOrganization, authorPhoto: t.authorPhoto ?? "", text: t.text, rating: t.rating, serviceSlug: t.serviceSlug ?? "", videoUrl: t.videoUrl ?? "", isApproved: t.isApproved, isFeatured: t.isFeatured, order: t.order });
    setOpen(true);
  }

  async function handlePhoto(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const b64 = await compressImage(file);
      const r = await uploadImage(b64, "testimonials", token);
      setForm((f) => ({ ...f, authorPhoto: r.data.url }));
      toast.success("Photo uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!token || !form.authorName.trim() || !form.text.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const r = await updateTestimonial(editing._id, form, token);
        setItems((prev) => prev.map((x) => x._id === editing._id ? r.data : x));
        toast.success("Updated");
      } else {
        const r = await createTestimonial(form, token);
        setItems((prev) => [r.data, ...prev]);
        toast.success("Added");
      }
      await revalidateCache(CACHE_TAGS.testimonials);
      setOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(t: Testimonial) {
    if (!token || !confirm(`Delete testimonial from "${t.authorName}"?`)) return;
    try {
      await deleteTestimonial(t._id, token);
      await revalidateCache(CACHE_TAGS.testimonials);
      setItems((prev) => prev.filter((x) => x._id !== t._id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  async function toggle(t: Testimonial, field: "isApproved" | "isFeatured") {
    if (!token) return;
    try {
      const r = await updateTestimonial(t._id, { [field]: !t[field] }, token);
      await revalidateCache(CACHE_TAGS.testimonials);
      setItems((prev) => prev.map((x) => x._id === t._id ? r.data : x));
    } catch { toast.error("Update failed"); }
  }

  const approved = items.filter((t) => t.isApproved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-[#F8FAFC]">Testimonials</h1><p className="text-sm text-[#64748B] mt-0.5">{items.length} total · {approved} approved</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-gold text-white text-sm font-medium hover:opacity-90 transition-opacity"><Plus className="w-4 h-4" /> Add Testimonial</button>
      </div>

      {loading ? <p className="text-center py-16 text-[#64748B]">Loading…</p> : items.length === 0 ? <p className="text-center py-16 text-[#64748B]">No testimonials yet.</p> : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t._id} className="flex items-start gap-4 p-4 rounded-xl bg-[#111827] border border-[rgba(245,158,11,0.08)]">
              {t.authorPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.authorPhoto} alt={t.authorName} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[rgba(245,158,11,0.1)] flex items-center justify-center shrink-0"><span className="text-[#F59E0B] font-bold">{t.authorName[0]}</span></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-[#F8FAFC] text-sm">{t.authorName}</span>
                  {t.authorTitle && <span className="text-xs text-[#475569]">{t.authorTitle}</span>}
                  <div className="flex gap-0.5">{[1,2,3,4,5].map((n) => <Star key={n} className={`w-3.5 h-3.5 ${n <= t.rating ? "fill-amber-400 text-amber-400" : "text-[#334155]"}`} />)}</div>
                </div>
                <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-2">{t.text}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button onClick={() => toggle(t, "isApproved")} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${t.isApproved ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-[rgba(245,158,11,0.15)] text-[#64748B]"}`}>{t.isApproved ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{t.isApproved ? "Approved" : "Approve"}</button>
                <button onClick={() => toggle(t, "isFeatured")} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${t.isFeatured ? "border-amber-500/30 text-amber-400 bg-amber-500/10" : "border-[rgba(245,158,11,0.15)] text-[#64748B]"}`}><Sparkles className="w-3 h-3" />{t.isFeatured ? "Featured" : "Feature"}</button>
                <button onClick={() => openEdit(t)} className="text-[#64748B] hover:text-[#F59E0B] transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t)} className="text-[#64748B] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-[#111827] border-l border-[rgba(245,158,11,0.12)] overflow-y-auto w-full sm:max-w-lg">
          <SheetHeader className="mb-6"><SheetTitle className="text-[#F8FAFC]">{editing ? "Edit Testimonial" : "Add Testimonial"}</SheetTitle></SheetHeader>
          <div className="space-y-4">
            <div><label className={labelCls}>Author Name *</label><input className={inputCls} value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Title / Role</label><input className={inputCls} value={form.authorTitle} onChange={(e) => setForm((f) => ({ ...f, authorTitle: e.target.value }))} /></div>
              <div><label className={labelCls}>Organization</label><input className={inputCls} value={form.authorOrganization} onChange={(e) => setForm((f) => ({ ...f, authorOrganization: e.target.value }))} /></div>
            </div>
            <div><label className={labelCls}>Rating *</label><StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} /></div>
            <div><label className={labelCls}>Testimonial Text *</label><textarea rows={5} className={`${inputCls} resize-none`} value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Service Slug</label><input className={inputCls} value={form.serviceSlug} onChange={(e) => setForm((f) => ({ ...f, serviceSlug: e.target.value }))} /></div>
              <div><label className={labelCls}>Video URL</label><input className={inputCls} value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} /></div>
            </div>
            {/* Author photo */}
            <div>
              <label className={labelCls}>Author Photo</label>
              {form.authorPhoto ? (
                <div className="relative w-20 h-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.authorPhoto} alt="Author" className="w-20 h-20 rounded-full object-cover border border-[rgba(245,158,11,0.12)]" />
                  <button onClick={() => setForm((f) => ({ ...f, authorPhoto: "" }))} className="absolute top-0 right-0 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <button onClick={() => imgRef.current?.click()} disabled={uploading} className="w-full flex items-center justify-center gap-2 py-6 rounded-lg border border-dashed border-[rgba(245,158,11,0.2)] text-[#64748B] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors text-sm disabled:opacity-50"><ImagePlus className="w-4 h-4" />{uploading ? "Uploading…" : "Upload photo"}</button>
              )}
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value = ""; }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Order</label><input type="number" className={inputCls} value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: +e.target.value }))} /></div>
            </div>
            <div className="flex gap-5">
              {([["isApproved", "Approved"], ["isFeatured", "Featured"]] as [keyof typeof form, string][]).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))} className="accent-[#F59E0B] w-4 h-4" /><span className="text-sm text-[#94A3B8]">{label}</span></label>
              ))}
            </div>
            <button onClick={handleSave} disabled={saving || !form.authorName.trim() || !form.text.trim()} className="w-full gradient-gold text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 h-11">{saving ? "Saving…" : editing ? "Save Changes" : "Add Testimonial"}</button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
