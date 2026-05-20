"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { getAdminTopics, createTopic, updateTopic, deleteTopic, revalidateCache, CACHE_TAGS } from "@/lib/api";
import { cleanPayload } from "@/lib/utils";
import type { Topic } from "@/types";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#0B1120] border border-[rgba(245,158,11,0.12)] text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5";
const EMPTY: Partial<Topic> = { slug: "", title: "", description: "", icon: "", order: 0, isActive: true };

export default function AdminTopicsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [form, setForm] = useState<Partial<Topic>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    getAdminTopics(token).then((r) => setItems(r.data ?? [])).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, [token]);

  function openCreate() { setEditing(null); setForm({ ...EMPTY }); setOpen(true); }
  function openEdit(t: Topic) { setEditing(t); setForm({ ...t }); setOpen(true); }

  async function handleSave() {
    if (!token || !form.title?.trim() || !form.slug?.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const r = await updateTopic(editing._id, cleanPayload(form), token);
        setItems((prev) => prev.map((x) => x._id === editing._id ? r.data : x));
        toast.success("Topic updated");
      } else {
        const r = await createTopic(form, token);
        setItems((prev) => [r.data, ...prev]);
        toast.success("Topic created");
      }
      await revalidateCache(CACHE_TAGS.topics);
      setOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(t: Topic) {
    if (!token || !confirm(`Delete "${t.title}"?`)) return;
    try {
      await deleteTopic(t._id, token);
      await revalidateCache(CACHE_TAGS.topics);
      setItems((prev) => prev.filter((x) => x._id !== t._id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  async function toggleActive(t: Topic) {
    if (!token) return;
    try {
      const r = await updateTopic(t._id, { isActive: !t.isActive }, token);
      await revalidateCache(CACHE_TAGS.topics);
      setItems((prev) => prev.map((x) => x._id === t._id ? r.data : x));
    } catch { toast.error("Update failed"); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-[#F8FAFC]">Topics</h1><p className="text-sm text-[#64748B] mt-0.5">{items.length} speaking topics</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-gold text-white text-sm font-medium hover:opacity-90 transition-opacity"><Plus className="w-4 h-4" /> Add Topic</button>
      </div>

      {loading ? <p className="text-center py-16 text-[#64748B]">Loading…</p> : items.length === 0 ? <p className="text-center py-16 text-[#64748B]">No topics yet.</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <div key={t._id} className="p-5 rounded-xl bg-[#111827] border border-[rgba(245,158,11,0.08)] flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {t.icon && <span className="text-2xl">{t.icon}</span>}
                  <p className="font-medium text-[#F8FAFC] text-sm">{t.title}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleActive(t)} className={`text-xs px-2 py-0.5 rounded-full border ${t.isActive ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-[rgba(245,158,11,0.15)] text-[#64748B]"}`}>{t.isActive ? "On" : "Off"}</button>
                  <button onClick={() => openEdit(t)} className="text-[#64748B] hover:text-[#F59E0B] transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(t)} className="text-[#64748B] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {t.description && <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">{t.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-[#111827] border-l border-[rgba(245,158,11,0.12)] overflow-y-auto w-full sm:max-w-md">
          <SheetHeader className="mb-6"><SheetTitle className="text-[#F8FAFC]">{editing ? "Edit Topic" : "New Topic"}</SheetTitle></SheetHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Title *</label><input className={inputCls} value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
              <div><label className={labelCls}>Slug *</label><input className={inputCls} value={form.slug ?? ""} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
            </div>
            <div><label className={labelCls}>Description</label><textarea rows={3} className={`${inputCls} resize-none`} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Icon (emoji)</label><input className={inputCls} value={form.icon ?? ""} placeholder="🎤" onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} /></div>
              <div><label className={labelCls}>Order</label><input type="number" className={inputCls} value={form.order ?? 0} onChange={(e) => setForm((f) => ({ ...f, order: +e.target.value }))} /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-[#F59E0B] w-4 h-4" /><span className="text-sm text-[#94A3B8]">Active</span></label>
            <button onClick={handleSave} disabled={saving || !form.title?.trim() || !form.slug?.trim()} className="w-full gradient-gold text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 h-11">{saving ? "Saving…" : editing ? "Save Changes" : "Create Topic"}</button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
