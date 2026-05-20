"use client";

import { useEffect, useRef, useState } from "react";
import { Save, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getAdminSiteSettings, upsertSiteSettings, uploadImage, revalidateCache, CACHE_TAGS } from "@/lib/api";
import { compressImage } from "@/lib/utils";
import type { SiteSettingFull } from "@/types";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#0B1120] border border-[rgba(245,158,11,0.12)] text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5";

// Default keys seeded into DB on first save
const DEFAULTS: Omit<SiteSettingFull, "_id">[] = [
  { key: "heroHeadline", value: "", label: "Hero Headline", type: "text" },
  { key: "heroSubheadline", value: "", label: "Hero Sub-headline", type: "textarea" },
  { key: "heroCtaText", value: "Book a Speaker", label: "Hero CTA Button Text", type: "text" },
  { key: "heroImage", value: "", label: "Hero Background Image", type: "image" },
  { key: "speakerName", value: "", label: "Speaker / Brand Name", type: "text" },
  { key: "speakerTitle", value: "", label: "Speaker Title / Tagline", type: "text" },
  { key: "speakerPhoto", value: "", label: "Speaker Photo", type: "image" },
  { key: "aboutSummary", value: "", label: "About / Bio Summary", type: "textarea" },
  { key: "bookingEmail", value: "", label: "Booking Email Address", type: "text" },
  { key: "phone", value: "", label: "Phone Number", type: "text" },
  { key: "linkedinUrl", value: "", label: "LinkedIn URL", type: "url" },
  { key: "instagramUrl", value: "", label: "Instagram URL", type: "url" },
  { key: "facebookUrl", value: "", label: "Facebook URL", type: "url" },
  { key: "youtubeUrl", value: "", label: "YouTube URL", type: "url" },
];

type ValuesMap = Record<string, string>;

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<SiteSettingFull[]>([]);
  const [values, setValues] = useState<ValuesMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const imgRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!token) return;
    getAdminSiteSettings(token)
      .then((r) => {
        const fetched = r.data ?? [];
        // Merge with defaults so all keys are present
        const fetchedKeys = new Set(fetched.map((s) => s.key));
        const merged = [...fetched, ...DEFAULTS.filter((d) => !fetchedKeys.has(d.key))];
        setSettings(merged as SiteSettingFull[]);
        const map: ValuesMap = {};
        merged.forEach((s) => { map[s.key] = s.value; });
        setValues(map);
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleImageUpload(key: string, file: File) {
    if (!token) return;
    setUploading(key);
    try {
      const b64 = await compressImage(file);
      const r = await uploadImage(b64, "site-settings", token);
      setValues((v) => ({ ...v, [key]: r.data.url }));
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(null); }
  }

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    try {
      const payload = Object.entries(values).map(([key, value]) => ({ key, value }));
      await upsertSiteSettings(payload, token);
      await revalidateCache(CACHE_TAGS.siteSettings);
      toast.success("Settings saved");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  }

  // Group settings by type for display
  const groups: { label: string; keys: string[] }[] = [
    { label: "Homepage Hero", keys: ["heroHeadline", "heroSubheadline", "heroCtaText", "heroImage"] },
    { label: "Speaker Profile", keys: ["speakerName", "speakerTitle", "speakerPhoto", "aboutSummary"] },
    { label: "Contact Info", keys: ["bookingEmail", "phone"] },
    { label: "Social Links", keys: ["linkedinUrl", "instagramUrl", "facebookUrl", "youtubeUrl"] },
  ];

  const settingByKey = Object.fromEntries(settings.map((s) => [s.key, s]));

  if (loading) return <p className="text-center py-16 text-[#64748B]">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-[#F8FAFC]">Site Settings</h1><p className="text-sm text-[#64748B] mt-0.5">Edit all site-wide content without a code deployment</p></div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-gold text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
          <Save className="w-4 h-4" />{saving ? "Saving…" : "Save All"}
        </button>
      </div>

      <div className="space-y-10">
        {groups.map((group) => (
          <div key={group.label}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B] mb-4">{group.label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {group.keys.map((key) => {
                const meta = settingByKey[key] ?? DEFAULTS.find((d) => d.key === key);
                if (!meta) return null;
                const val = values[key] ?? "";

                if (meta.type === "image") {
                  return (
                    <div key={key} className="md:col-span-2">
                      <label className={labelCls}>{meta.label}</label>
                      {val ? (
                        <div className="relative inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={val} alt={meta.label} className="w-full max-h-48 object-cover rounded-xl border border-[rgba(245,158,11,0.12)]" />
                          <button onClick={() => setValues((v) => ({ ...v, [key]: "" }))} className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button onClick={() => imgRefs.current[key]?.click()} disabled={uploading === key}
                          className="w-full flex items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-[rgba(245,158,11,0.2)] text-[#64748B] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors text-sm disabled:opacity-50">
                          <ImagePlus className="w-5 h-5" />{uploading === key ? "Uploading…" : "Upload image"}
                        </button>
                      )}
                      <input ref={(el) => { imgRefs.current[key] = el; }} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(key, f); e.target.value = ""; }} />
                    </div>
                  );
                }

                if (meta.type === "textarea") {
                  return (
                    <div key={key} className="md:col-span-2">
                      <label className={labelCls}>{meta.label}</label>
                      <textarea rows={3} className={`${inputCls} resize-none`} value={val} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    <label className={labelCls}>{meta.label}</label>
                    <input className={inputCls} type={meta.type === "url" ? "url" : "text"} value={val} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-[rgba(245,158,11,0.1)] flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg gradient-gold text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
          <Save className="w-4 h-4" />{saving ? "Saving…" : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}
