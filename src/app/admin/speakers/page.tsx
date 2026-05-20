"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import {
  getAdminSpeakers, createSpeaker, updateSpeaker, deleteSpeaker,
  uploadImage, revalidateCache, CACHE_TAGS,
} from "@/lib/api";
import { compressImage, cleanPayload } from "@/lib/utils";
import type { Speaker } from "@/types";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#0B1120] border border-[rgba(245,158,11,0.12)] text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5";

const EMPTY: Partial<Speaker> = {
  slug: "", name: "", designation: "", shortBio: "", bio: "",
  photo: "", portfolioImages: [], pastClients: [], order: 0, isActive: true,
  socialLinks: { linkedin: "", website: "", twitter: "", instagram: "" },
};

export default function AdminSpeakersPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Speaker | null>(null);
  const [form, setForm] = useState<Partial<Speaker>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [pastClientsText, setPastClientsText] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);
  const portfolioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    getAdminSpeakers(token)
      .then((r) => setItems(r.data ?? []))
      .catch(() => toast.error("Failed to load speakers"))
      .finally(() => setLoading(false));
  }, [token]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, socialLinks: { linkedin: "", website: "", twitter: "", instagram: "" } });
    setPastClientsText("");
    setOpen(true);
  }

  function openEdit(s: Speaker) {
    setEditing(s);
    setForm({ ...s, socialLinks: { ...s.socialLinks } });
    setPastClientsText(s.pastClients?.join("\n") ?? "");
    setOpen(true);
  }

  function setSocial(key: keyof Speaker["socialLinks"], value: string) {
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }));
  }

  async function handlePhoto(file: File) {
    if (!token) return;
    setUploadingPhoto(true);
    try {
      const b64 = await compressImage(file);
      const r = await uploadImage(b64, "speakers", token);
      setForm((f) => ({ ...f, photo: r.data.url }));
      toast.success("Photo uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploadingPhoto(false); }
  }

  async function handlePortfolioImage(file: File) {
    if (!token) return;
    setUploadingPortfolio(true);
    try {
      const b64 = await compressImage(file);
      const r = await uploadImage(b64, "speakers/portfolio", token);
      setForm((f) => ({ ...f, portfolioImages: [...(f.portfolioImages ?? []), r.data.url] }));
      toast.success("Image added");
    } catch { toast.error("Upload failed"); }
    finally { setUploadingPortfolio(false); }
  }

  function removePortfolioImage(url: string) {
    setForm((f) => ({ ...f, portfolioImages: (f.portfolioImages ?? []).filter((i) => i !== url) }));
  }

  async function handleSave() {
    if (!token || !form.name?.trim() || !form.slug?.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...cleanPayload(form),
        pastClients: pastClientsText.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      if (editing) {
        const r = await updateSpeaker(editing._id, payload, token);
        setItems((prev) => prev.map((x) => x._id === editing._id ? r.data : x));
        toast.success("Speaker updated");
      } else {
        const r = await createSpeaker(payload, token);
        setItems((prev) => [r.data, ...prev]);
        toast.success("Speaker created");
      }
      await revalidateCache(CACHE_TAGS.speakers);
      setOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(s: Speaker) {
    if (!token || !confirm(`Delete "${s.name}"?`)) return;
    try {
      await deleteSpeaker(s._id, token);
      await revalidateCache(CACHE_TAGS.speakers);
      setItems((prev) => prev.filter((x) => x._id !== s._id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  async function toggleActive(s: Speaker) {
    if (!token) return;
    try {
      const r = await updateSpeaker(s._id, { isActive: !s.isActive }, token);
      await revalidateCache(CACHE_TAGS.speakers);
      setItems((prev) => prev.map((x) => x._id === s._id ? r.data : x));
    } catch { toast.error("Update failed"); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Speakers</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{items.length} speaker{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-gold text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Speaker
        </button>
      </div>

      {loading ? (
        <p className="text-center py-16 text-[#64748B]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-center py-16 text-[#64748B]">No speakers yet. Add your first one.</p>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s._id} className="flex items-center gap-4 p-4 rounded-xl bg-[#111827] border border-[rgba(245,158,11,0.08)]">
              <GripVertical className="w-4 h-4 text-[#334155] shrink-0" />
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#0B1120] border border-[rgba(245,158,11,0.1)] flex items-center justify-center">
                {s.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-[rgba(245,158,11,0.4)]">{s.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#F8FAFC] text-sm truncate">{s.name}</p>
                <p className="text-xs text-[#475569] truncate">{s.designation || s.shortBio}</p>
              </div>
              {s.pastClients?.length > 0 && (
                <span className="text-xs text-[#64748B] shrink-0 hidden sm:block">
                  {s.pastClients.length} client{s.pastClients.length !== 1 ? "s" : ""}
                </span>
              )}
              <button
                onClick={() => toggleActive(s)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all shrink-0 ${s.isActive ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-[rgba(245,158,11,0.15)] text-[#64748B]"}`}
              >
                {s.isActive ? "Active" : "Inactive"}
              </button>
              <button onClick={() => openEdit(s)} className="text-[#64748B] hover:text-[#F59E0B] transition-colors shrink-0">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(s)} className="text-[#64748B] hover:text-red-400 transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-[#111827] border-l border-[rgba(245,158,11,0.12)] overflow-y-auto w-full sm:max-w-lg">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-[#F8FAFC]">{editing ? "Edit Speaker" : "New Speaker"}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            {/* Name + Slug */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Name *</label>
                <input className={inputCls} value={form.name ?? ""} placeholder="Garrison Wynn" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Slug *</label>
                <input className={inputCls} value={form.slug ?? ""} placeholder="garrison-wynn" onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className={labelCls}>Designation / Title</label>
              <input className={inputCls} value={form.designation ?? ""} placeholder="CSP, Fortune 500 Speaker, Author" onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} />
            </div>

            {/* Short Bio */}
            <div>
              <label className={labelCls}>Short Bio</label>
              <textarea rows={3} className={`${inputCls} resize-none`} value={form.shortBio ?? ""} placeholder="A brief intro shown on the listing page…" onChange={(e) => setForm((f) => ({ ...f, shortBio: e.target.value }))} />
            </div>

            {/* Full Bio */}
            <div>
              <label className={labelCls}>Full Bio</label>
              <textarea rows={6} className={`${inputCls} resize-none`} value={form.bio ?? ""} placeholder="Detailed biography shown on the speaker's profile page…" onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </div>

            {/* Past Clients */}
            <div>
              <label className={labelCls}>Past &amp; Present Clients (one per line)</label>
              <textarea rows={4} className={`${inputCls} resize-none`} value={pastClientsText} placeholder={"American Express\nWells Fargo\nOracle\nNASA"} onChange={(e) => setPastClientsText(e.target.value)} />
            </div>

            {/* Order + Active */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Order</label>
                <input type="number" className={inputCls} value={form.order ?? 0} onChange={(e) => setForm((f) => ({ ...f, order: +e.target.value }))} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-[#F59E0B] w-4 h-4" />
                  <span className="text-sm text-[#94A3B8]">Active</span>
                </label>
              </div>
            </div>

            {/* Social links */}
            <div>
              <label className={labelCls}>Social Links</label>
              <div className="space-y-2">
                <input className={inputCls} value={form.socialLinks?.linkedin ?? ""} placeholder="LinkedIn URL" onChange={(e) => setSocial("linkedin", e.target.value)} />
                <input className={inputCls} value={form.socialLinks?.website ?? ""} placeholder="Website URL" onChange={(e) => setSocial("website", e.target.value)} />
                <input className={inputCls} value={form.socialLinks?.twitter ?? ""} placeholder="Twitter/X URL" onChange={(e) => setSocial("twitter", e.target.value)} />
                <input className={inputCls} value={form.socialLinks?.instagram ?? ""} placeholder="Instagram URL" onChange={(e) => setSocial("instagram", e.target.value)} />
              </div>
            </div>

            {/* Photo */}
            <div>
              <label className={labelCls}>Profile Photo</label>
              {form.photo ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.photo} alt="Photo" className="w-full h-48 object-cover object-top rounded-lg border border-[rgba(245,158,11,0.12)]" />
                  <button onClick={() => setForm((f) => ({ ...f, photo: "" }))} className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}
                  className="w-full flex items-center justify-center gap-2 py-7 rounded-lg border border-dashed border-[rgba(245,158,11,0.2)] text-[#64748B] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors text-sm disabled:opacity-50">
                  <ImagePlus className="w-4 h-4" /> {uploadingPhoto ? "Uploading…" : "Upload profile photo"}
                </button>
              )}
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value = ""; }} />
            </div>

            {/* Portfolio images */}
            <div>
              <label className={labelCls}>Portfolio Images</label>
              {(form.portfolioImages ?? []).length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {(form.portfolioImages ?? []).map((img) => (
                    <div key={img} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Portfolio" className="w-full aspect-video object-cover rounded-lg border border-[rgba(245,158,11,0.08)]" />
                      <button onClick={() => removePortfolioImage(img)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full items-center justify-center text-white hover:bg-red-600 transition-colors hidden group-hover:flex">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => portfolioRef.current?.click()} disabled={uploadingPortfolio}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border border-dashed border-[rgba(245,158,11,0.2)] text-[#64748B] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors text-sm disabled:opacity-50">
                <ImagePlus className="w-4 h-4" /> {uploadingPortfolio ? "Uploading…" : "Add portfolio image"}
              </button>
              <input ref={portfolioRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePortfolioImage(f); e.target.value = ""; }} />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !form.name?.trim() || !form.slug?.trim()}
              className="w-full gradient-gold text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 h-11"
            >
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Speaker"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
