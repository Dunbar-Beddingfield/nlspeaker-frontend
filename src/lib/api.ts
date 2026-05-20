import { API_URL } from "./constants";
import type {
  ApiResponse,
  Service,
  Topic,
  SpeakingEvent,
  Testimonial,
  MediaItem,
  BlogPost,
  Inquiry,
  SiteSettings,
  SiteSettingFull,
} from "@/types";

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const method = options?.method ?? "GET";
  const url = `${API_URL}${path}`;

  const { headers: extraHeaders, ...rest } = options ?? {};
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...extraHeaders },
      ...rest,
    });
  } catch (err) {
    console.error(`[API ✗] ${method} ${url} — network error:`, err);
    throw err;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `API error ${res.status}`);
  }

  return res.json() as Promise<ApiResponse<T>>;
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

export const CACHE_TAGS = {
  services: "services",
  topics: "topics",
  events: "events",
  testimonials: "testimonials",
  media: "media",
  blog: "blog",
  siteSettings: "site-settings",
} as const;

const IS_DEV = process.env.NODE_ENV === "development";

function publicCache(...tags: string[]): RequestInit {
  return IS_DEV
    ? { cache: "no-store" }
    : { next: { revalidate: 3600, tags } };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings> {
  const res = await apiFetch<SiteSettings>("/site-settings", publicCache(CACHE_TAGS.siteSettings));
  return res.data;
}

export async function getServices(): Promise<Service[]> {
  const res = await apiFetch<Service[]>("/services", publicCache(CACHE_TAGS.services));
  return res.data;
}

export async function getServiceBySlug(slug: string): Promise<Service> {
  const res = await apiFetch<Service>(`/services/${slug}`, publicCache(CACHE_TAGS.services));
  return res.data;
}

export async function getTopics(): Promise<Topic[]> {
  const res = await apiFetch<Topic[]>("/topics", publicCache(CACHE_TAGS.topics));
  return res.data;
}

export async function getEvents(past?: boolean): Promise<SpeakingEvent[]> {
  const query = past !== undefined ? `?past=${past}` : "";
  const res = await apiFetch<SpeakingEvent[]>(`/events${query}`, publicCache(CACHE_TAGS.events));
  return res.data;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const res = await apiFetch<Testimonial[]>("/testimonials", publicCache(CACHE_TAGS.testimonials));
  return res.data;
}

export async function getMedia(type?: string): Promise<MediaItem[]> {
  const query = type ? `?type=${type}` : "";
  const res = await apiFetch<MediaItem[]>(`/media${query}`, publicCache(CACHE_TAGS.media));
  return res.data;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const res = await apiFetch<BlogPost[]>("/blog", publicCache(CACHE_TAGS.blog));
  return res.data;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  const res = await apiFetch<BlogPost>(`/blog/${slug}`, publicCache(CACHE_TAGS.blog));
  return res.data;
}

// ── Forms ─────────────────────────────────────────────────────────────────────

export async function submitInquiry(data: unknown) {
  return apiFetch<{ submitted: boolean; id: string }>("/inquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Cache revalidation ────────────────────────────────────────────────────────

export async function revalidateCache(...tags: string[]) {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
  } catch {
    // Non-critical — cache expires naturally within an hour
  }
}

// ── Admin API ─────────────────────────────────────────────────────────────────

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function adminLogin(email: string, password: string) {
  return apiFetch<{ accessToken: string; admin: { id: string; email: string; name: string; role: string } }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
  );
}

// Services
export async function getAdminServices(token: string) {
  return apiFetch<Service[]>("/services/admin/all", { headers: authHeaders(token), cache: "no-store" });
}
export async function createService(data: unknown, token: string) {
  return apiFetch<Service>("/services", { method: "POST", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function updateService(id: string, data: unknown, token: string) {
  return apiFetch<Service>(`/services/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function deleteService(id: string, token: string) {
  return apiFetch<{ deleted: boolean }>(`/services/${id}`, { method: "DELETE", headers: authHeaders(token) });
}

// Topics
export async function getAdminTopics(token: string) {
  return apiFetch<Topic[]>("/topics/admin/all", { headers: authHeaders(token), cache: "no-store" });
}
export async function createTopic(data: unknown, token: string) {
  return apiFetch<Topic>("/topics", { method: "POST", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function updateTopic(id: string, data: unknown, token: string) {
  return apiFetch<Topic>(`/topics/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function deleteTopic(id: string, token: string) {
  return apiFetch<{ deleted: boolean }>(`/topics/${id}`, { method: "DELETE", headers: authHeaders(token) });
}

// Events
export async function getAdminEvents(token: string) {
  return apiFetch<SpeakingEvent[]>("/events/admin/all", { headers: authHeaders(token), cache: "no-store" });
}
export async function createEvent(data: unknown, token: string) {
  return apiFetch<SpeakingEvent>("/events", { method: "POST", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function updateEvent(id: string, data: unknown, token: string) {
  return apiFetch<SpeakingEvent>(`/events/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function deleteEvent(id: string, token: string) {
  return apiFetch<{ deleted: boolean }>(`/events/${id}`, { method: "DELETE", headers: authHeaders(token) });
}

// Testimonials
export async function getAdminTestimonials(token: string) {
  return apiFetch<Testimonial[]>("/testimonials/admin/all", { headers: authHeaders(token), cache: "no-store" });
}
export async function createTestimonial(data: unknown, token: string) {
  return apiFetch<Testimonial>("/testimonials", { method: "POST", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function updateTestimonial(id: string, data: unknown, token: string) {
  return apiFetch<Testimonial>(`/testimonials/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function deleteTestimonial(id: string, token: string) {
  return apiFetch<{ deleted: boolean }>(`/testimonials/${id}`, { method: "DELETE", headers: authHeaders(token) });
}

// Media
export async function getAdminMedia(token: string) {
  return apiFetch<MediaItem[]>("/media/admin/all", { headers: authHeaders(token), cache: "no-store" });
}
export async function createMediaItem(data: unknown, token: string) {
  return apiFetch<MediaItem>("/media", { method: "POST", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function updateMediaItem(id: string, data: unknown, token: string) {
  return apiFetch<MediaItem>(`/media/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function deleteMediaItem(id: string, token: string) {
  return apiFetch<{ deleted: boolean }>(`/media/${id}`, { method: "DELETE", headers: authHeaders(token) });
}

// Blog
export async function getAdminBlogPosts(token: string) {
  return apiFetch<BlogPost[]>("/blog/admin/all", { headers: authHeaders(token), cache: "no-store" });
}
export async function createBlogPost(data: unknown, token: string) {
  return apiFetch<BlogPost>("/blog", { method: "POST", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function updateBlogPost(id: string, data: unknown, token: string) {
  return apiFetch<BlogPost>(`/blog/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: authHeaders(token) });
}
export async function deleteBlogPost(id: string, token: string) {
  return apiFetch<{ deleted: boolean }>(`/blog/${id}`, { method: "DELETE", headers: authHeaders(token) });
}

// Inquiries
export async function getAdminInquiries(token: string, type?: string) {
  const query = type ? `?type=${type}` : "";
  return apiFetch<Inquiry[]>(`/inquiries${query}`, { headers: authHeaders(token), cache: "no-store" });
}
export async function updateInquiryStatus(id: string, status: string, token: string) {
  return apiFetch<Inquiry>(`/inquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    headers: authHeaders(token),
  });
}

// Site Settings
export async function getAdminSiteSettings(token: string) {
  return apiFetch<SiteSettingFull[]>("/site-settings?full=true", { headers: authHeaders(token), cache: "no-store" });
}
export async function upsertSiteSettings(settings: { key: string; value: string }[], token: string) {
  return apiFetch<SiteSettings>("/site-settings", {
    method: "PATCH",
    body: JSON.stringify({ settings }),
    headers: authHeaders(token),
  });
}

// Upload
export async function uploadImage(base64: string, folder: string, token: string) {
  return apiFetch<{ url: string }>("/upload/image", {
    method: "POST",
    body: JSON.stringify({ base64, folder }),
    headers: authHeaders(token),
  });
}
export async function uploadDocument(base64: string, folder: string, token: string) {
  return apiFetch<{ url: string }>("/upload/document", {
    method: "POST",
    body: JSON.stringify({ base64, folder }),
    headers: authHeaders(token),
  });
}
