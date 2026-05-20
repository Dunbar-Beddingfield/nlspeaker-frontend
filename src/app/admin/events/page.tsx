"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Calendar, MapPin, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { getAdminEvents, createEvent, updateEvent, deleteEvent, uploadImage, revalidateCache, CACHE_TAGS } from "@/lib/api";
import { compressImage, formatDate } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/constants";
import type { SpeakingEvent } from "@/types";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#0B1120] border border-[rgba(245,158,11,0.12)] text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5";

const EMPTY = { title: "", date: "", location: "", venue: "", description: "", eventType: "keynote", registrationUrl: "", coverImage: "", isPast: false, isFeatured: false, isPublished: true };

export default function AdminEventsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<SpeakingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SpeakingEvent | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    getAdminEvents(token).then((r) => setItems(r.data ?? [])).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, [token]);

  function openCreate() { setEditing(null); setForm({ ...EMPTY }); setOpen(true); }
  function openEdit(e: SpeakingEvent) {
    setEditing(e);
    setForm({ title: e.title, date: e.date ? e.date.slice(0, 10) : "", location: e.location, venue: e.venue, description: e.description, eventType: e.eventType, registrationUrl: e.registrationUrl, coverImage: e.coverImage ?? "", isPast: e.isPast, isFeatured: e.isFeatured, isPublished: e.isPublished });
    setOpen(true);
  }

  async function handleImage(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const b64 = await compressImage(file);
      const r = await uploadImage(b64, "events", token);
      setForm((f) => ({ ...f, coverImage: r.data.url }));
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!token || !form.title?.trim() || !form.date) return;
    setSaving(true);
    try {
      if (editing) {
        const r = await updateEvent(editing._id, form, token);
        setItems((prev) => prev.map((x) => x._id === editing._id ? r.data : x));
        toast.success("Event updated");
      } else {
        const r = await createEvent(form, token);
        setItems((prev) => [r.data, ...prev]);
        toast.success("Event created");
      }
      await revalidateCache(CACHE_TAGS.events);
      setOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(e: SpeakingEvent) {
    if (!token || !confirm(`Delete "${e.title}"?`)) return;
    try {
      await deleteEvent(e._id, token);
      await revalidateCache(CACHE_TAGS.events);
      setItems((prev) => prev.filter((x) => x._id !== e._id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  const typeLabel: Record<string, string> = { keynote: "Keynote", workshop: "Workshop", webinar: "Webinar", panel: "Panel" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-[#F8FAFC]">Events</h1><p className="text-sm text-[#64748B] mt-0.5">{items.length} events</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-gold text-white text-sm font-medium hover:opacity-90 transition-opacity"><Plus className="w-4 h-4" /> Add Event</button>
      </div>

      {loading ? <p className="text-center py-16 text-[#64748B]">Loading…</p> : items.length === 0 ? <p className="text-center py-16 text-[#64748B]">No events yet.</p> : (
        <div className="space-y-3">
          {items.map((e) => (
            <div key={e._id} className="flex items-center gap-4 p-4 rounded-xl bg-[#111827] border border-[rgba(245,158,11,0.08)]">
              <div className="w-12 h-12 rounded-lg gradient-gold flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white/80 leading-none">{new Date(e.date).toLocaleString("en-US", { month: "short" })}</span>
                <span className="text-lg font-bold text-white leading-none">{new Date(e.date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#F8FAFC] text-sm">{e.title}</p>
                <div className="flex items-center gap-3 text-xs text-[#475569] mt-0.5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(e.date)}</span>
                  {e.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>}
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full border border-[rgba(245,158,11,0.2)] text-[#F59E0B] shrink-0">{typeLabel[e.eventType] ?? e.eventType}</span>
              {e.isPast && <span className="text-xs text-[#475569] shrink-0">Past</span>}
              {!e.isPublished && <span className="text-xs px-2 py-0.5 rounded-full border border-[rgba(245,158,11,0.1)] text-[#64748B] shrink-0">Draft</span>}
              <button onClick={() => openEdit(e)} className="text-[#64748B] hover:text-[#F59E0B] transition-colors shrink-0"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(e)} className="text-[#64748B] hover:text-red-400 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-[#111827] border-l border-[rgba(245,158,11,0.12)] overflow-y-auto w-full sm:max-w-lg">
          <SheetHeader className="mb-6"><SheetTitle className="text-[#F8FAFC]">{editing ? "Edit Event" : "New Event"}</SheetTitle></SheetHeader>
          <div className="space-y-4">
            <div><label className={labelCls}>Title *</label><input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Date *</label><input type="date" className={inputCls} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
              <div><label className={labelCls}>Event Type</label>
                <select className={inputCls} value={form.eventType} onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}>
                  {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Location</label><input className={inputCls} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></div>
              <div><label className={labelCls}>Venue</label><input className={inputCls} value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} /></div>
            </div>
            <div><label className={labelCls}>Description</label><textarea rows={3} className={`${inputCls} resize-none`} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div><label className={labelCls}>Registration URL</label><input className={inputCls} value={form.registrationUrl} onChange={(e) => setForm((f) => ({ ...f, registrationUrl: e.target.value }))} /></div>
            {/* Cover image */}
            <div>
              <label className={labelCls}>Cover Image</label>
              {form.coverImage ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.coverImage} alt="Cover" className="w-full h-28 object-cover rounded-lg border border-[rgba(245,158,11,0.12)]" />
                  <button onClick={() => setForm((f) => ({ ...f, coverImage: "" }))} className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <button onClick={() => imgRef.current?.click()} disabled={uploading} className="w-full flex items-center justify-center gap-2 py-6 rounded-lg border border-dashed border-[rgba(245,158,11,0.2)] text-[#64748B] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors text-sm disabled:opacity-50"><ImagePlus className="w-4 h-4" />{uploading ? "Uploading…" : "Upload cover image"}</button>
              )}
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ""; }} />
            </div>
            <div className="flex flex-wrap gap-5">
              {([["isPublished", "Published"], ["isPast", "Past Event"], ["isFeatured", "Featured"]] as [keyof typeof form, string][]).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))} className="accent-[#F59E0B] w-4 h-4" /><span className="text-sm text-[#94A3B8]">{label}</span></label>
              ))}
            </div>
            <button onClick={handleSave} disabled={saving || !form.title?.trim() || !form.date} className="w-full gradient-gold text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 h-11">{saving ? "Saving…" : editing ? "Save Changes" : "Create Event"}</button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
