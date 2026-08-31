export type PageStatus = "draft" | "published" | "scheduled" | "archived";
export type BlogStatus = "draft" | "published" | "scheduled" | "archived";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "super_admin" | "editor";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: PageStatus;
  template: string | null;
  featured_image_id: string | null;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageSection {
  id: string;
  page_id: string;
  section_type: string;
  sort_order: number;
  is_visible: boolean;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_id: string | null;
  author_id: string | null;
  category_id: string | null;
  status: BlogStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface Media {
  id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  folder_id: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NavigationMenu {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface NavigationItem {
  id: string;
  menu_id: string;
  label: string;
  url: string;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
  open_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsapp_phone: string | null;
  whatsapp_message: string | null;
  whatsapp_enabled: boolean;
  social_instagram: string | null;
  social_facebook: string | null;
  social_youtube: string | null;
  social_linkedin: string | null;
  social_x: string | null;
  header_cta_label: string | null;
  header_cta_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeoMetadata {
  id: string;
  entity_type: string; // 'global' | 'page' | 'blog'
  entity_id: string | null;
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface FooterData {
  logo_url: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  copyright: string | null;
  columns: { title: string; links: { label: string; url: string }[] }[];
  social: Record<string, string>;
}
