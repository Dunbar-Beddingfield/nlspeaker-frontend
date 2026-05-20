import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { COMPANY, SITE_URL } from "@/lib/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${COMPANY.name} | ${COMPANY.tagline}`,
    template: `%s | ${COMPANY.shortName}`,
  },
  description:
    "Next Level Speaking Services — professional speaking coaching and booking. We help speakers reach new audiences, refine their message, and deliver transformational talks.",
  keywords: [
    "professional speaker",
    "keynote speaker",
    "speaking coach",
    "public speaking",
    "motivational speaker",
    "speaker booking",
    "leadership speaker",
    "conference speaker",
    "Next Level Speaking Services",
  ],
  authors: [{ name: COMPANY.name }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: COMPANY.name,
    title: `${COMPANY.name} | ${COMPANY.tagline}`,
    description:
      "Professional speaking coaching and booking agency. Helping speakers reach new audiences and deliver transformational talks.",
  },
  twitter: {
    card: "summary_large_image",
    title: COMPANY.name,
    description: COMPANY.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} antialiased bg-[#0B1120] text-[#F8FAFC]`}>
        <PublicShell>
          <main>{children}</main>
        </PublicShell>
      </body>
    </html>
  );
}
