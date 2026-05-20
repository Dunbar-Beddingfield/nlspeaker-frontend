"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Mic,
  Users,
  BookOpen,
  Calendar,
  Star,
  MessageSquare,
  Image,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/services", label: "Services", Icon: Mic },
  { href: "/admin/speakers", label: "Speakers", Icon: Users },
  { href: "/admin/topics", label: "Topics", Icon: BookOpen },
  { href: "/admin/events", label: "Events", Icon: Calendar },
  { href: "/admin/testimonials", label: "Testimonials", Icon: Star },
  { href: "/admin/media", label: "Media", Icon: Image },
  { href: "/admin/blog", label: "Blog", Icon: FileText },
  { href: "/admin/inquiries", label: "Inquiries", Icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0B1120] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#111827] border-r border-[rgba(245,158,11,0.1)] flex flex-col shrink-0">
        <div className="p-5 border-b border-[rgba(245,158,11,0.08)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg gradient-gold flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="font-bold text-[#F8FAFC] text-sm">NL Speaker</p>
          </div>
          <p className="text-xs text-[#475569] truncate pl-9">{user?.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-[rgba(245,158,11,0.12)] text-[#F59E0B]"
                    : "text-[#64748B] hover:text-[#F8FAFC] hover:bg-[rgba(245,158,11,0.06)]",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[rgba(245,158,11,0.08)]">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#64748B] hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content area */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>

      <Toaster position="bottom-right" richColors theme="dark" />
    </div>
  );
}
