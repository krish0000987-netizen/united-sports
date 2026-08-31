/**
 * CMS TypeScript types — mirror the Supabase schema in
 * supabase/migrations/0001_cms_schema.sql. Section `content` blobs are typed
 * per section_type so renderers and the admin editors share one shape.
 */

export type StaffRole = "super_admin" | "editor";

/** Serializable JSON value (used for jsonb content blobs so TanStack Start's
 * serialization checker accepts server-function return types). */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonRecord = Record<string, JsonValue>;

export type ContentStatus = "draft" | "published" | "scheduled" | "archived";

export type PageTemplate = "default" | "home" | "landing" | "full-width";

export type SectionType =
  | "hero"
  | "rich_text"
  | "image_content"
  | "cards"
  | "statistics"
  | "testimonials"
  | "gallery"
  | "faq"
  | "cta"
  | "video"
  | "logo_grid"
  | "featured_blogs";

/* ----------------------------- Core rows -------------------------------- */

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string; // sanitized rich HTML
  featured_image_id: string | null;
  author_id: string | null;
  category_id: string | null;
  status: ContentStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image_id: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

/** Blog joined with its category + tags for list/detail rendering. */
export interface BlogWithRelations extends Blog {
  category: BlogCategory | null;
  tags: BlogTag[];
  author: { id: string; full_name: string; avatar_url: string | null } | null;
  featured_image: Media | null;
  og_image: Media | null;
}

export interface NavItem {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  url: string;
  is_internal: boolean;
  is_external: boolean;
  open_in_new_tab: boolean;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface NavMenu {
  id: string;
  name: string;
  slug: string;
  location: "main" | "footer" | "mobile" | "other";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FooterSection {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface FooterItem {
  id: string;
  section_id: string;
  label: string;
  url: string | null;
  icon: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: Record<string, never>; // structured content per page (unused blob)
  status: ContentStatus;
  template: PageTemplate;
  featured_image_id: string | null;
  author_id: string | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image_id: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageSection {
  id: string;
  page_id: string;
  section_type: SectionType;
  sort_order: number;
  is_visible: boolean;
  content: JsonRecord;
  created_at: string;
  updated_at: string;
}

/** Page with its ordered, visible sections. */
export interface PageWithSections extends Page {
  sections: PageSection[];
}

export interface SiteSetting {
  id: string;
  key: string;
  value: JsonRecord;
  created_at: string;
  updated_at: string;
}

export interface SeoMetadata {
  id: string;
  entity_type: "page" | "blog";
  entity_id: string;
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_id: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageRevision {
  id: string;
  page_id: string;
  title: string;
  slug: string;
  content: JsonRecord;
  status: string;
  author_id: string | null;
  revision_note: string | null;
  created_at: string;
}

export interface BlogRevision {
  id: string;
  blog_id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  author_id: string | null;
  revision_note: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: JsonRecord;
  created_at: string;
}

/* ------------------------- Section content shapes ------------------------ */

export interface CtaLink {
  label?: string;
  url?: string;
}

export interface SectionCount {
  number: string;
  label: string;
}

export interface SectionCard {
  icon?: string;
  number?: string;
  title?: string;
  text?: string;
  label?: string;
  image?: string;
  image_id?: string;
  url?: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role?: string;
  avatar?: string;
  avatar_id?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SectionContentMap {
  hero: {
    eyebrow?: string | null;
    heading?: string | null;
    highlight?: string | null;
    description?: string | null;
    background_image?: string | null;
    background_image_id?: string | null;
    compact?: boolean;
    primary_cta?: CtaLink | null;
    secondary_cta?: CtaLink | null;
    statistics?: SectionCount[];
  };
  rich_text: {
    eyebrow?: string | null;
    heading?: string | null;
    body?: string;
    html?: string;
    highlight_phrase?: string | null;
    style?: "large" | "marquee" | "contact" | "default" | null;
    marquee_items?: string[];
    contact_blocks?: { icon?: string; label?: string; value?: string; href?: string }[];
    show_form?: boolean;
  };
  image_content: {
    eyebrow?: string | null;
    heading?: string | null;
    description?: string | null;
    image?: string | null;
    image_id?: string | null;
    image_alt?: string | null;
    badge_title?: string | null;
    badge_text?: string | null;
    paragraphs?: string[];
    bullet_list?: string[];
    cta?: CtaLink | null;
    flip?: boolean;
  };
  cards: {
    eyebrow?: string | null;
    heading?: string | null;
    variant?: "default" | "image_top" | "split" | "numbered_list" | "steps" | null;
    items?: SectionCard[];
    cta_card?: CtaLink | null;
    footnote?: string | null;
  };
  statistics: {
    eyebrow?: string | null;
    heading?: string | null;
    items?: SectionCount[];
  };
  testimonials: {
    eyebrow?: string | null;
    heading?: string | null;
    items?: Testimonial[];
  };
  gallery: {
    eyebrow?: string | null;
    heading?: string | null;
    images?: { image?: string; image_id?: string; alt?: string; caption?: string }[];
  };
  faq: {
    eyebrow?: string | null;
    heading?: string | null;
    items?: FaqItem[];
  };
  cta: {
    eyebrow?: string | null;
    heading?: string | null;
    highlight?: string | null;
    subtitle?: string | null;
    description?: string | null;
    background_image?: string | null;
    background_image_id?: string | null;
    primary_cta?: CtaLink | null;
    secondary_cta?: CtaLink | null;
    align?: "left" | "center" | null;
    center?: boolean;
  };
  video: {
    eyebrow?: string | null;
    heading?: string | null;
    url?: string | null;
    poster?: string | null;
    caption?: string | null;
  };
  logo_grid: {
    eyebrow?: string | null;
    heading?: string | null;
    logos?: { image?: string; image_id?: string; alt?: string; url?: string }[];
  };
  featured_blogs: {
    eyebrow?: string | null;
    heading?: string | null;
    limit?: number;
    category_id?: string | null;
  };
}

export type SectionContent = JsonRecord;

/** Auth user + their staff profile (used by admin session guard). */
export interface StaffSession {
  userId: string;
  email: string;
  profile: Profile | null;
  isSuperAdmin: boolean;
}
