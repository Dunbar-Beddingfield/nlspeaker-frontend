"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, COMPANY } from "@/lib/constants";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-glass border-b border-[rgba(245,158,11,0.15)] shadow-lg shadow-black/30"
          : "bg-transparent",
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-[#F8FAFC] hidden sm:block">
            {COMPANY.shortName}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-[#F59E0B] bg-[rgba(245,158,11,0.1)]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[rgba(245,158,11,0.06)]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/contact"
            className="px-5 py-2 rounded-lg text-sm font-semibold gradient-gold text-white hover:opacity-90 transition-opacity glow-gold-sm"
          >
            Book a Speaker
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-[#111827] border-b border-[rgba(245,158,11,0.12)] px-4 pb-5 pt-2">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-[#F59E0B] bg-[rgba(245,158,11,0.1)]"
                    : "text-[#94A3B8] hover:text-[#F8FAFC]",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-3 px-4 py-3 rounded-lg text-sm font-semibold text-center gradient-gold text-white"
            >
              Book a Speaker
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
