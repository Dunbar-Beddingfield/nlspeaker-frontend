"use client";

import { Mic, BookOpen, Calendar, Star, MessageSquare, Image, FileText } from "lucide-react";
import Link from "next/link";

const SECTIONS = [
  { href: "/admin/services", label: "Services", desc: "Manage speaking programs", Icon: Mic, color: "text-amber-400" },
  { href: "/admin/topics", label: "Topics", desc: "Speaking topic areas", Icon: BookOpen, color: "text-yellow-400" },
  { href: "/admin/events", label: "Events", desc: "Upcoming & past events", Icon: Calendar, color: "text-orange-400" },
  { href: "/admin/testimonials", label: "Testimonials", desc: "Client testimonials", Icon: Star, color: "text-amber-300" },
  { href: "/admin/media", label: "Media", desc: "Photos, logos & press kit", Icon: Image, color: "text-yellow-300" },
  { href: "/admin/blog", label: "Blog", desc: "Articles & thought leadership", Icon: FileText, color: "text-amber-400" },
  { href: "/admin/inquiries", label: "Inquiries", desc: "Booking & contact requests", Icon: MessageSquare, color: "text-orange-300" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Dashboard</h1>
        <p className="text-sm text-[#64748B] mt-1">Manage all content for NL Speaker</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {SECTIONS.map(({ href, label, desc, Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="group p-5 rounded-xl bg-[#111827] border border-[rgba(245,158,11,0.08)] hover:border-[rgba(245,158,11,0.25)] hover:bg-[#1A2540] transition-all"
          >
            <Icon className={`w-6 h-6 ${color} mb-3`} />
            <p className="font-semibold text-[#F8FAFC] text-sm mb-1">{label}</p>
            <p className="text-xs text-[#475569]">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
