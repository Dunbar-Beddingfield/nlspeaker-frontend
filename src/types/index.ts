export type EventType = "keynote" | "workshop" | "webinar" | "panel";
export type MediaType = "photo" | "logo" | "press-logo" | "video-clip" | "document";
export type InquiryType = "booking" | "contact";
export type InquiryStatus = "new" | "read" | "replied" | "archived";

export interface Service {
  _id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  outcomes: string[];
  idealAudience: string;
  duration: string;
  coverImage?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  _id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface SpeakingEvent {
  _id: string;
  title: string;
  date: string;
  location: string;
  venue: string;
  description: string;
  eventType: EventType;
  registrationUrl: string;
  coverImage?: string;
  isPast: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  _id: string;
  authorName: string;
  authorTitle: string;
  authorOrganization: string;
  authorPhoto?: string;
  text: string;
  rating: number;
  serviceSlug?: string;
  videoUrl?: string;
  isApproved: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  _id: string;
  type: MediaType;
  title: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  category?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage?: string;
  tags: string[];
  author: string;
  publishedAt?: string;
  isPublished: boolean;
  isFeatured: boolean;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  _id: string;
  type: InquiryType;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  eventDate?: string;
  eventType?: string;
  eventLocation?: string;
  audienceSize?: string;
  budget?: string;
  topics?: string[];
  message: string;
  status: InquiryStatus;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  [key: string]: string;
}

export interface SiteSettingFull {
  _id: string;
  key: string;
  value: string;
  label: string;
  type: "text" | "textarea" | "url" | "image";
}

export interface InquiryFormData {
  type: InquiryType;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  eventDate?: string;
  eventType?: string;
  eventLocation?: string;
  audienceSize?: string;
  budget?: string;
  topics?: string[];
  message: string;
  consentGiven?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
