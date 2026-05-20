import Link from "next/link";
import { Mail, Mic, Linkedin, Instagram, Youtube, Facebook } from "lucide-react";
import { NAV_LINKS, COMPANY, SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1120] border-t border-[rgba(245,158,11,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-[#F8FAFC]">{COMPANY.shortName}</span>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed mb-5">
              {COMPANY.description}
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.linkedin && (
                <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer"
                  className="text-[#64748B] hover:text-[#F59E0B] transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {SOCIAL_LINKS.instagram && (
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer"
                  className="text-[#64748B] hover:text-[#F59E0B] transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {SOCIAL_LINKS.youtube && (
                <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer"
                  className="text-[#64748B] hover:text-[#F59E0B] transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {SOCIAL_LINKS.facebook && (
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer"
                  className="text-[#64748B] hover:text-[#F59E0B] transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-widest mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.slice(0, 5).map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-[#64748B] hover:text-[#F59E0B] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More links */}
          <div>
            <h3 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-widest mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.slice(5).map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-[#64748B] hover:text-[#F59E0B] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact"
                  className="text-sm text-[#F59E0B] hover:text-[#D97706] transition-colors font-medium">
                  Book a Speaker →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-widest mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3">
              <li>
                <a href={`mailto:${COMPANY.email}`}
                  className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#F59E0B] transition-colors">
                  <Mail className="w-4 h-4 shrink-0" />
                  {COMPANY.email}
                </a>
              </li>
              <li className="pt-3">
                <Link href="/contact"
                  className="inline-flex px-4 py-2.5 rounded-lg text-sm font-semibold gradient-gold text-white hover:opacity-90 transition-opacity">
                  Book a Speaker
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[rgba(245,158,11,0.08)] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#475569]">
            © {year} {COMPANY.name}. All rights reserved.
          </p>
          <p className="text-xs text-[#475569]">
            Transforming audiences, one talk at a time.
          </p>
        </div>
      </div>
    </footer>
  );
}
