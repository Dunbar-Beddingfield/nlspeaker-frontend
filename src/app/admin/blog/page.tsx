"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { getAdminBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, uploadImage, revalidateCache, CACHE_TAGS } from "@/lib/api";
import { compressImage, formatDateShort } from "@/lib/utils";
import type { BlogPost } from "@/types";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#0B1120] border border-[rgba(245,158,11,0.12)] text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5";
const EMPTY = { slug: "", title: "", excerpt: "", body: "", coverImage: "", tags: [] as string[], author: "", isPublished: false, isFeatured: false, readingTimeMinutes: 0 };

export default function AdminBlogPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [tagsText, setTagsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    getAdminBlogPosts(token).then((r) => setItems(r.data ?? [])).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, [token]);

  function openCreate() { setEditing(null); setForm({ ...EMPTY }); setTagsText(""); setOpen(true); }
  function openEdit(p: BlogPost) {
    setEditing(p);
    setForm({ slug: p.slug, title: p.title, excerpt: p.excerpt, body: p.body, coverImage: p.coverImage ?? "", tags: p.tags, author: p.author, isPublished: p.isPublished, isFeatured: p.isFeatured, readingTimeMinutes: p.readingTimeMinutes });
    setTagsText(p.tags.join(", "));
    setOpen(true);
  }

  async function handleImage(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const b64 = await compressImage(file);
      const r = await uploadImage(b64, "blog", token);
      setForm((f) => ({ ...f, coverImage: r.data.url }));
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!token || !form.title?.trim() || !form.slug?.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean) };
      if (editing) {
        const r = await updateBlogPost(editing._id, payload, token);
        setItems((prev) => prev.map((x) => x._id === editing._id ? r.data : x));
        toast.success("Post updated");
      } else {
        const r = await createBlogPost(payload, token);
        setItems((prev) => [r.data, ...prev]);
        toast.success("Post created");
      }
      await revalidateCache(CACHE_TAGS.blog);
      setOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(p: BlogPost) {
    if (!token || !confirm(`Delete "${p.title}"?`)) return;
    try {
      await deleteBlogPost(p._id, token);
      await revalidateCache(CACHE_TAGS.blog);
      setItems((prev) => prev.filter((x) => x._id !== p._id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  async function togglePublish(p: BlogPost) {
    if (!token) return;
    try {
      const r = await updateBlogPost(p._id, { isPublished: !p.isPublished }, token);
      await revalidateCache(CACHE_TAGS.blog);
      setItems((prev) => prev.map((x) => x._id === p._id ? r.data : x));
    } catch { toast.error("Update failed"); }
  }

  const published = items.filter((p) => p.isPublished).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-[#F8FAFC]">Blog</h1><p className="text-sm text-[#64748B] mt-0.5">{items.length} posts · {published} published</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-gold text-white text-sm font-medium hover:opacity-90 transition-opacity"><Plus className="w-4 h-4" /> New Post</button>
      </div>

      {loading ? <p className="text-center py-16 text-[#64748B]">Loading…</p> : items.length === 0 ? <p className="text-center py-16 text-[#64748B]">No posts yet.</p> : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p._id} className="flex items-center gap-4 p-4 rounded-xl bg-[#111827] border border-[rgba(245,158,11,0.08)]">
              {p.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverImage} alt={p.title} className="w-16 h-10 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#F8FAFC] text-sm truncate">{p.title}</p>
                <div className="flex items-center gap-3 text-xs text-[#475569] mt-0.5">
                  {p.publishedAt && <span>{formatDateShort(p.publishedAt)}</span>}
                  {p.readingTimeMinutes > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.readingTimeMinutes} min</span>}
                  {p.tags.length > 0 && <span>{p.tags.slice(0, 2).join(", ")}</span>}
                </div>
              </div>
              {p.isFeatured && <span className="text-xs px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-400 bg-amber-500/10 shrink-0">Featured</span>}
              <button onClick={() => togglePublish(p)} className={`text-xs px-2.5 py-1 rounded-full border transition-all shrink-0 ${p.isPublished ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-[rgba(245,158,11,0.15)] text-[#64748B]"}`}>{p.isPublished ? "Published" : "Draft"}</button>
              <button onClick={() => openEdit(p)} className="text-[#64748B] hover:text-[#F59E0B] transition-colors shrink-0"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(p)} className="text-[#64748B] hover:text-red-400 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-[#111827] border-l border-[rgba(245,158,11,0.12)] overflow-y-auto w-full sm:max-w-xl">
          <SheetHeader className="mb-6"><SheetTitle className="text-[#F8FAFC]">{editing ? "Edit Post" : "New Post"}</SheetTitle></SheetHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Title *</label><input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
              <div><label className={labelCls}>Slug *</label><input className={inputCls} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
            </div>
            <div><label className={labelCls}>Excerpt</label><textarea rows={2} className={`${inputCls} resize-none`} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} /></div>
            <div>
              <label className={labelCls}>Body (HTML)</label>
              <textarea rows={10} className={`${inputCls} resize-y font-mono text-xs`} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="<p>Your content here…</p>" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Author</label><input className={inputCls} value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} /></div>
              <div><label className={labelCls}>Reading Time (min)</label><input type="number" className={inputCls} value={form.readingTimeMinutes} onChange={(e) => setForm((f) => ({ ...f, readingTimeMinutes: +e.target.value }))} /></div>
            </div>
            <div><label className={labelCls}>Tags (comma separated)</label><input className={inputCls} value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="leadership, mindset, speaking" /></div>
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
                <button onClick={() => imgRef.current?.click()} disabled={uploading} className="w-full flex items-center justify-center gap-2 py-6 rounded-lg border border-dashed border-[rgba(245,158,11,0.2)] text-[#64748B] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors text-sm disabled:opacity-50"><ImagePlus className="w-4 h-4" />{uploading ? "Uploading…" : "Upload cover image"}</button>
              )}
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ""; }} />
            </div>
            <div className="flex flex-wrap gap-5">
              {([["isPublished", "Published"], ["isFeatured", "Featured"]] as [keyof typeof form, string][]).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))} className="accent-[#F59E0B] w-4 h-4" /><span className="text-sm text-[#94A3B8]">{label}</span></label>
              ))}
            </div>
            <button onClick={handleSave} disabled={saving || !form.title?.trim() || !form.slug?.trim()} className="w-full gradient-gold text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 h-11">{saving ? "Saving…" : editing ? "Save Changes" : "Create Post"}</button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
