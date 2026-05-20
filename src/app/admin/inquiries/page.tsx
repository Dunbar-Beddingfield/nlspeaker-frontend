"use client";

import { useEffect, useState } from "react";
import { Calendar, Mail, Phone, Building2, MapPin, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getAdminInquiries, updateInquiryStatus } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Inquiry, InquiryStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUSES: { value: InquiryStatus; label: string; cls: string }[] = [
  { value: "new", label: "New", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { value: "read", label: "Read", cls: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  { value: "replied", label: "Replied", cls: "text-green-400 bg-green-500/10 border-green-500/30" },
  { value: "archived", label: "Archived", cls: "text-[#475569] bg-[#1A2540] border-[rgba(71,85,105,0.3)]" },
];

type TabType = "all" | "booking" | "contact";

export default function AdminInquiriesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getAdminInquiries(token).then((r) => setItems(r.data ?? [])).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, [token]);

  async function changeStatus(id: string, status: InquiryStatus) {
    if (!token) return;
    try {
      await updateInquiryStatus(id, status, token);
      setItems((prev) => prev.map((x) => x._id === id ? { ...x, status } : x));
    } catch { toast.error("Update failed"); }
  }

  const filtered = tab === "all" ? items : items.filter((i) => i.type === tab);
  const newCount = items.filter((i) => i.status === "new").length;

  const statusMeta = (s: InquiryStatus) => STATUSES.find((x) => x.value === s) ?? STATUSES[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Inquiries</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{items.length} total{newCount > 0 ? ` · ${newCount} new` : ""}</p>
        </div>
      </div>

      {/* Tab filter */}
      <div className="flex gap-1 p-1 mb-6 rounded-xl bg-[#0B1120] border border-[rgba(245,158,11,0.08)] w-fit">
        {(["all", "booking", "contact"] as TabType[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
              tab === t ? "bg-[#111827] text-[#F8FAFC] border border-[rgba(245,158,11,0.12)]" : "text-[#64748B] hover:text-[#94A3B8]"
            )}>
            {t === "all" ? `All (${items.length})` : `${t.charAt(0).toUpperCase() + t.slice(1)} (${items.filter((i) => i.type === t).length})`}
          </button>
        ))}
      </div>

      {loading ? <p className="text-center py-16 text-[#64748B]">Loading…</p> : filtered.length === 0 ? <p className="text-center py-16 text-[#64748B]">No inquiries yet.</p> : (
        <div className="space-y-3">
          {filtered.map((inq) => {
            const sm = statusMeta(inq.status);
            const isOpen = expanded === inq._id;
            return (
              <div key={inq._id} className="rounded-xl bg-[#111827] border border-[rgba(245,158,11,0.08)] overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded(isOpen ? null : inq._id)}>
                  <div className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border ${inq.type === "booking" ? "text-[#F59E0B] bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]" : "text-[#94A3B8] bg-[#1A2540] border-[rgba(148,163,184,0.2)]"}`}>{inq.type}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#F8FAFC] text-sm">{inq.name}</p>
                    <p className="text-xs text-[#475569] truncate">{inq.email} · {formatDate(inq.createdAt)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${sm.cls}`}>{sm.label}</span>
                  {inq.status === "new" && (
                    <button onClick={(e) => { e.stopPropagation(); changeStatus(inq._id, "read"); }}
                      className="text-xs px-2.5 py-1 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10 shrink-0 hover:opacity-80">
                      Mark Read
                    </button>
                  )}
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-[rgba(245,158,11,0.08)] p-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-[#94A3B8]"><Mail className="w-4 h-4 text-[#F59E0B] shrink-0" /><a href={`mailto:${inq.email}`} className="hover:text-[#F59E0B] truncate">{inq.email}</a></div>
                      {inq.phone && <div className="flex items-center gap-2 text-[#94A3B8]"><Phone className="w-4 h-4 text-[#F59E0B] shrink-0" />{inq.phone}</div>}
                      {inq.organization && <div className="flex items-center gap-2 text-[#94A3B8]"><Building2 className="w-4 h-4 text-[#F59E0B] shrink-0" />{inq.organization}</div>}
                      {inq.eventDate && <div className="flex items-center gap-2 text-[#94A3B8]"><Calendar className="w-4 h-4 text-[#F59E0B] shrink-0" />{formatDate(inq.eventDate)}</div>}
                      {inq.eventLocation && <div className="flex items-center gap-2 text-[#94A3B8]"><MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />{inq.eventLocation}</div>}
                      {inq.audienceSize && <div className="flex items-center gap-2 text-[#94A3B8]"><Users className="w-4 h-4 text-[#F59E0B] shrink-0" />{inq.audienceSize}</div>}
                      {inq.budget && <div className="flex items-center gap-2 text-[#94A3B8]"><DollarSign className="w-4 h-4 text-[#F59E0B] shrink-0" />{inq.budget}</div>}
                    </div>
                    <div className="bg-[#0B1120] rounded-lg p-4">
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Message</p>
                      <p className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-wrap">{inq.message}</p>
                    </div>
                    {/* Status workflow */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-[#64748B] self-center">Move to:</span>
                      {STATUSES.filter((s) => s.value !== inq.status).map((s) => (
                        <button key={s.value} onClick={() => changeStatus(inq._id, s.value)}
                          className={`text-xs px-3 py-1 rounded-full border transition-all hover:opacity-80 ${s.cls}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
