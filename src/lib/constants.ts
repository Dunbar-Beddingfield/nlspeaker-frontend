export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nlspeaker.com";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/v1";

export const COMPANY = {
  name: "Next Level Speaking Services",
  shortName: "NL Speaker",
  email: "info@nlspeaker.com",
  tagline: "Building a Better Future for Our Speakers",
  description:
    "Next Level Speaking Services is a professional speaking coaching and booking agency dedicated to helping speakers reach new audiences, refine their message, and deliver transformational talks.",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Topics", href: "/topics" },
  { label: "Events", href: "/events" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Media", href: "/media" },
] as const;

export const STATS = [
  { value: "500+", label: "Talks Delivered" },
  { value: "50K+", label: "Audience Members Reached" },
  { value: "10+", label: "Years of Experience" },
  { value: "98%", label: "Client Satisfaction" },
] as const;

export const EVENT_TYPES = [
  { value: "keynote", label: "Keynote" },
  { value: "workshop", label: "Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "panel", label: "Panel" },
] as const;

export const AUDIENCE_SIZES = [
  { value: "under-50", label: "Under 50" },
  { value: "50-200", label: "50–200" },
  { value: "200-500", label: "200–500" },
  { value: "500-1000", label: "500–1,000" },
  { value: "1000+", label: "1,000+" },
] as const;

export const BUDGET_RANGES = [
  { value: "under-5k", label: "Under $5,000" },
  { value: "5k-15k", label: "$5,000–$15,000" },
  { value: "15k-30k", label: "$15,000–$30,000" },
  { value: "30k+", label: "$30,000+" },
  { value: "flexible", label: "Flexible / Let's talk" },
] as const;

export const SOCIAL_LINKS = {
  linkedin: "",
  instagram: "",
  facebook: "",
  youtube: "",
} as const;
