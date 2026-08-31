/**
 * Graceful fallback defaults that reproduce the CURRENT public website.
 *
 * The public site renders from these when:
 *  1. Supabase env vars are missing, OR
 *  2. The CMS schema hasn't been applied yet (table lookup fails), OR
 *  3. A record is missing / unpublished.
 *
 * This guarantees the site never white-screens before the migrations run.
 * The values mirror supabase/migrations/0003_seed_content.sql exactly so the
 * CMS-rendered site looks identical to today's site.
 */

import type {
  BlogCategory,
  BlogTag,
  FooterItem,
  FooterSection,
  Media,
  NavItem,
  Page,
  PageSection,
  SiteSetting,
} from "./types";

const STORAGE =
  "https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media";

export const DEFAULT_MEDIA_URLS = {
  hero: `${STORAGE}/heroes/hero-athletes.jpg`,
  programmeHero: `${STORAGE}/heroes/programme-hero.jpg`,
  aboutAthlete: `${STORAGE}/about/about-athlete.jpg`,
  support: `${STORAGE}/about/support.jpg`,
  community: `${STORAGE}/gallery/community.jpg`,
  facility: `${STORAGE}/gallery/facility.jpg`,
  equipment: `${STORAGE}/gallery/equipment.jpg`,
  paraAthlete: `${STORAGE}/gallery/para-athlete.jpg`,
  textureNavy: `${STORAGE}/gallery/texture-navy.jpg`,
  logoCircle: `${STORAGE}/logos/logo-circle.png`,
  favicon: `${STORAGE}/logos/favicon.png`,
} as const;

/* ----------------------------- Site settings ----------------------------- */

export const DEFAULT_SETTINGS: SiteSetting[] = [
  {
    id: "default-general",
    key: "general",
    value: {
      site_name: "UnitedAthletes",
      legal_name: "UnitedAthletes for India Foundation",
      tagline: "Empowering Athletes. Enabling Dreams.",
      description:
        "An athlete-focused organisation building a stronger sporting ecosystem across India.",
    },
    created_at: "",
    updated_at: "",
  },
  {
    id: "default-contact",
    key: "contact",
    value: {
      phone_display: "+91 85278 77688",
      phone_tel: "+918527877688",
      whatsapp_number: "918527877688",
      email: "hello@unitedathletes.in",
      address:
        "384A, Nyay Khand 3, Indirapuram, Ghaziabad, Uttar Pradesh – 201014",
    },
    created_at: "",
    updated_at: "",
  },
  {
    id: "default-social",
    key: "social",
    value: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      linkedin: "",
    },
    created_at: "",
    updated_at: "",
  },
  {
    id: "default-whatsapp",
    key: "whatsapp",
    value: {
      number: "918527877688",
      default_message:
        "Hello UnitedAthletes for India Foundation, I would like to get in touch!",
    },
    created_at: "",
    updated_at: "",
  },
  {
    id: "default-seo",
    key: "seo",
    value: {
      site_name: "UnitedAthletes for India Foundation",
      default_title: "UnitedAthletes | Empowering Athletes. Enabling Dreams.",
      default_description:
        "UnitedAthletes for India Foundation bridges talent and opportunity with sports facilities, equipment, guidance and support for athletes across India.",
      og_image: `${STORAGE}/heroes/hero-athletes.jpg`,
      twitter_card: "summary_large_image",
    },
    created_at: "",
    updated_at: "",
  },
];

export function getDefaultSetting(key: string): SiteSetting | undefined {
  return DEFAULT_SETTINGS.find((s) => s.key === key);
}

/* ------------------------------- Navigation ------------------------------ */

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: "nav-1",
    menu_id: "nav-main",
    parent_id: null,
    label: "Home",
    url: "/",
    is_internal: true,
    is_external: false,
    open_in_new_tab: false,
    sort_order: 1,
    is_visible: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "nav-2",
    menu_id: "nav-main",
    parent_id: null,
    label: "About",
    url: "/about",
    is_internal: true,
    is_external: false,
    open_in_new_tab: false,
    sort_order: 2,
    is_visible: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "nav-3",
    menu_id: "nav-main",
    parent_id: null,
    label: "Programmes",
    url: "/programmes",
    is_internal: true,
    is_external: false,
    open_in_new_tab: false,
    sort_order: 3,
    is_visible: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "nav-4",
    menu_id: "nav-main",
    parent_id: null,
    label: "Get Involved",
    url: "/get-involved",
    is_internal: true,
    is_external: false,
    open_in_new_tab: false,
    sort_order: 4,
    is_visible: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "nav-5",
    menu_id: "nav-main",
    parent_id: null,
    label: "Contact",
    url: "/contact",
    is_internal: true,
    is_external: false,
    open_in_new_tab: false,
    sort_order: 5,
    is_visible: true,
    created_at: "",
    updated_at: "",
  },
];

/* -------------------------------- Footer --------------------------------- */

export const DEFAULT_FOOTER_SECTIONS: FooterSection[] = [
  {
    id: "footer-explore",
    title: "Explore",
    slug: "explore",
    sort_order: 1,
    is_visible: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "footer-contact",
    title: "Contact",
    slug: "contact",
    sort_order: 2,
    is_visible: true,
    created_at: "",
    updated_at: "",
  },
];

export const DEFAULT_FOOTER_ITEMS: FooterItem[] = [
  { id: "fi-1", section_id: "footer-explore", label: "Home", url: "/", icon: null, sort_order: 1, is_visible: true, created_at: "", updated_at: "" },
  { id: "fi-2", section_id: "footer-explore", label: "About Us", url: "/about", icon: null, sort_order: 2, is_visible: true, created_at: "", updated_at: "" },
  { id: "fi-3", section_id: "footer-explore", label: "Programmes", url: "/programmes", icon: null, sort_order: 3, is_visible: true, created_at: "", updated_at: "" },
  { id: "fi-4", section_id: "footer-explore", label: "Get Involved", url: "/get-involved", icon: null, sort_order: 4, is_visible: true, created_at: "", updated_at: "" },
  { id: "fi-5", section_id: "footer-explore", label: "Contact", url: "/contact", icon: null, sort_order: 5, is_visible: true, created_at: "", updated_at: "" },
  { id: "fi-6", section_id: "footer-contact", label: "+91 85278 77688", url: "tel:+918527877688", icon: "Phone", sort_order: 1, is_visible: true, created_at: "", updated_at: "" },
  { id: "fi-7", section_id: "footer-contact", label: "384A, Nyay Khand 3, Indirapuram, Ghaziabad, Uttar Pradesh – 201014", url: null, icon: "MapPin", sort_order: 2, is_visible: true, created_at: "", updated_at: "" },
];

/* --------------------------- Media (fallbacks) --------------------------- */

export const DEFAULT_MEDIA: Media[] = [
  { id: "m-hero", file_name: "hero-athletes.jpg", storage_path: "website-media/heroes/hero-athletes.jpg", public_url: DEFAULT_MEDIA_URLS.hero, mime_type: "image/jpeg", file_size: 0, width: null, height: null, alt_text: "Indian sprinter training at dawn on a stadium track", caption: "Homepage hero — athletes at dawn", folder_id: null, uploaded_by: null, created_at: "", updated_at: "" },
  { id: "m-programme", file_name: "programme-hero.jpg", storage_path: "website-media/heroes/programme-hero.jpg", public_url: DEFAULT_MEDIA_URLS.programmeHero, mime_type: "image/jpeg", file_size: 0, width: null, height: null, alt_text: "Young Indian boxer training in a gym with golden light", caption: "Programmes page hero", folder_id: null, uploaded_by: null, created_at: "", updated_at: "" },
  { id: "m-about", file_name: "about-athlete.jpg", storage_path: "website-media/about/about-athlete.jpg", public_url: DEFAULT_MEDIA_URLS.aboutAthlete, mime_type: "image/jpeg", file_size: 0, width: null, height: null, alt_text: "Indian badminton player mid-smash under a spotlight", caption: "About page athlete image", folder_id: null, uploaded_by: null, created_at: "", updated_at: "" },
  { id: "m-support", file_name: "support.jpg", storage_path: "website-media/about/support.jpg", public_url: DEFAULT_MEDIA_URLS.support, mime_type: "image/jpeg", file_size: 0, width: null, height: null, alt_text: "A coach and a young athlete clasping hands at sunset", caption: "About page hero image", folder_id: null, uploaded_by: null, created_at: "", updated_at: "" },
  { id: "m-community", file_name: "community.jpg", storage_path: "website-media/gallery/community.jpg", public_url: DEFAULT_MEDIA_URLS.community, mime_type: "image/jpeg", file_size: 0, width: null, height: null, alt_text: "Indian athletes in a huddle, backlit with golden light", caption: "Athletes community huddle", folder_id: null, uploaded_by: null, created_at: "", updated_at: "" },
  { id: "m-facility", file_name: "facility.jpg", storage_path: "website-media/gallery/facility.jpg", public_url: DEFAULT_MEDIA_URLS.facility, mime_type: "image/jpeg", file_size: 0, width: null, height: null, alt_text: "Modern indoor sports arena lit at night", caption: "Indoor sports arena at night", folder_id: null, uploaded_by: null, created_at: "", updated_at: "" },
  { id: "m-equipment", file_name: "equipment.jpg", storage_path: "website-media/gallery/equipment.jpg", public_url: DEFAULT_MEDIA_URLS.equipment, mime_type: "image/jpeg", file_size: 0, width: null, height: null, alt_text: "Premium sports equipment on a dark surface", caption: "Sports equipment flat-lay", folder_id: null, uploaded_by: null, created_at: "", updated_at: "" },
  { id: "m-para", file_name: "para-athlete.jpg", storage_path: "website-media/gallery/para-athlete.jpg", public_url: DEFAULT_MEDIA_URLS.paraAthlete, mime_type: "image/jpeg", file_size: 0, width: null, height: null, alt_text: "Indian para-athlete racing on a track at sunset", caption: "Para-athlete on track", folder_id: null, uploaded_by: null, created_at: "", updated_at: "" },
  { id: "m-texture", file_name: "texture-navy.jpg", storage_path: "website-media/gallery/texture-navy.jpg", public_url: DEFAULT_MEDIA_URLS.textureNavy, mime_type: "image/jpeg", file_size: 0, width: null, height: null, alt_text: "Dark navy textured backdrop", caption: "Navy texture background", folder_id: null, uploaded_by: null, created_at: "", updated_at: "" },
  { id: "m-logo", file_name: "logo-circle.png", storage_path: "website-media/logos/logo-circle.png", public_url: DEFAULT_MEDIA_URLS.logoCircle, mime_type: "image/png", file_size: 0, width: null, height: null, alt_text: "UnitedAthletes for India Foundation emblem", caption: "Circular logo seal", folder_id: null, uploaded_by: null, created_at: "", updated_at: "" },
];

/* ------------------------- Pages sections (seed) ------------------------- */

export const DEFAULT_PAGES: Record<string, { page: Page; sections: PageSection[] }> = {
  home: {
    page: {
      id: "page-home", title: "Home", slug: "home", excerpt: "UnitedAthletes — Empowering Athletes. Enabling Dreams.",
      content: {}, status: "published", template: "home", featured_image_id: "m-hero", author_id: null,
      published_at: "2026-01-01T00:00:00.000Z", seo_title: "UnitedAthletes | Empowering Athletes. Enabling Dreams.",
      seo_description: "UnitedAthletes for India Foundation bridges talent and opportunity with sports facilities, equipment, guidance and support for athletes across India.",
      canonical_url: null, og_image_id: "m-hero", robots_index: true, robots_follow: true, created_at: "", updated_at: "",
    },
    sections: [
      {
        id: "s-home-hero", page_id: "page-home", section_type: "hero", sort_order: 1, is_visible: true,
        content: {
          eyebrow: "UnitedAthletes for India Foundation",
          heading: "Empowering Athletes.",
          highlight: "Enabling Dreams.",
          description: "We bridge the gap between talent and opportunity — providing the facilities, equipment, guidance and support systems athletes across India need to reach their full potential.",
          background_image: DEFAULT_MEDIA_URLS.hero,
          background_image_id: "m-hero",
          primary_cta: { label: "Get Involved", url: "/get-involved" },
          secondary_cta: { label: "Explore Opportunities", url: "/programmes" },
          statistics: [
            { number: "14+", label: "Sporting disciplines" },
            { number: "6", label: "Core programmes" },
            { number: "1", label: "Athlete-first promise" },
          ],
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-home-mission", page_id: "page-home", section_type: "rich_text", sort_order: 2, is_visible: true,
        content: {
          eyebrow: "Our Mission",
          heading: "To empower athletes by providing the right opportunities, facilities, equipment, guidance and support they need to achieve their goals and reach their full potential.",
          highlight_phrase: "opportunities, facilities, equipment, guidance and support",
          style: "large",
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-home-about", page_id: "page-home", section_type: "image_content", sort_order: 3, is_visible: true,
        content: {
          eyebrow: "About UnitedAthletes",
          heading: "A platform built around the athlete",
          image: DEFAULT_MEDIA_URLS.community,
          image_id: "m-community",
          image_alt: "Indian athletes in a huddle, backlit with golden light",
          badge_title: "Talent is everywhere.",
          badge_text: "Opportunity should be too.",
          paragraphs: [
            "UnitedAthletes is dedicated to supporting athletes across India by creating opportunities for them to pursue their sporting ambitions. We work to bridge the gap between talent and opportunity by providing access to sports facilities, equipment, resources and a supportive ecosystem that enables athletes to grow.",
            "Our goal is to help athletes focus on what matters most — training, competing, improving and achieving their dreams.",
          ],
          cta: { label: "Read our story", url: "/about" },
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-home-whatwedo", page_id: "page-home", section_type: "cards", sort_order: 4, is_visible: true,
        content: {
          eyebrow: "What We Do",
          heading: "Everything an athlete needs to keep going",
          items: [
            { icon: "Trophy", title: "Athlete Development", text: "Structured support for athletes moving from potential to performance." },
            { icon: "Landmark", title: "Sports Facilities", text: "Access to quality infrastructure and training environments." },
            { icon: "Dumbbell", title: "Equipment & Resources", text: "Essential gear and resources for daily training and competition." },
            { icon: "Award", title: "Training Opportunities", text: "Development pathways that sharpen skill and raise standards." },
            { icon: "HeartHandshake", title: "Athlete Support", text: "Guidance and support systems around every athlete's journey." },
            { icon: "Users", title: "Community & Networking", text: "A connected ecosystem of athletes, coaches and organisations." },
            { icon: "Sparkles", title: "Emerging Athletes", text: "Opportunities for talent that has been waiting to be seen." },
          ],
          cta_card: { label: "See all programmes", url: "/programmes" },
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-home-focus", page_id: "page-home", section_type: "cards", sort_order: 5, is_visible: true,
        content: {
          eyebrow: "Our Focus",
          heading: "Four pillars, one athlete",
          variant: "image_top",
          items: [
            { number: "01", title: "Athletes", text: "Supporting athletes in their journey from potential to performance.", image: DEFAULT_MEDIA_URLS.paraAthlete, image_id: "m-para" },
            { number: "02", title: "Facilities", text: "Helping athletes access quality sports infrastructure and training environments.", image: DEFAULT_MEDIA_URLS.facility, image_id: "m-facility" },
            { number: "03", title: "Equipment", text: "Providing access to essential sports equipment and resources.", image: DEFAULT_MEDIA_URLS.equipment, image_id: "m-equipment" },
            { number: "04", title: "Opportunities", text: "Creating pathways for athletes to showcase talent and pursue their goals.", image: DEFAULT_MEDIA_URLS.community, image_id: "m-community" },
          ],
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-home-sports", page_id: "page-home", section_type: "rich_text", sort_order: 6, is_visible: true,
        content: {
          eyebrow: "Sports",
          heading: "UnitedAthletes supports athletes across multiple sporting disciplines and aims to create opportunities for athletes from diverse sporting backgrounds.",
          marquee_items: ["Cricket", "Football", "Badminton", "Tennis", "Athletics", "Swimming", "Archery", "Basketball", "Hockey", "Wrestling", "Boxing", "Volleyball", "Para-Sports", "And More"],
          style: "marquee",
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-home-cta", page_id: "page-home", section_type: "cta", sort_order: 7, is_visible: true,
        content: {
          eyebrow: "Call to Action",
          heading: "Your talent deserves an opportunity.",
          highlight: "an opportunity.",
          description: "Join the UnitedAthletes community and take the next step toward achieving your sporting goals.",
          background_image: DEFAULT_MEDIA_URLS.facility,
          background_image_id: "m-facility",
          primary_cta: { label: "Get Involved", url: "/get-involved" },
          secondary_cta: { label: "Explore Opportunities", url: "/programmes" },
        },
        created_at: "", updated_at: "",
      },
    ],
  },

  about: {
    page: {
      id: "page-about", title: "About Us", slug: "about", excerpt: "An athlete-focused organisation committed to creating a stronger ecosystem for athletes across India.",
      content: {}, status: "published", template: "default", featured_image_id: "m-support", author_id: null,
      published_at: "2026-01-01T00:00:00.000Z", seo_title: "About Us | UnitedAthletes for India Foundation",
      seo_description: "Our mission, vision and values — creating opportunity, access and support for India's sporting talent.",
      canonical_url: null, og_image_id: "m-support", robots_index: true, robots_follow: true, created_at: "", updated_at: "",
    },
    sections: [
      {
        id: "s-about-hero", page_id: "page-about", section_type: "hero", sort_order: 1, is_visible: true,
        content: {
          eyebrow: "About Us", heading: "Who", highlight: "We Are",
          description: "An athlete-focused organisation committed to creating a stronger ecosystem for athletes across India.",
          background_image: DEFAULT_MEDIA_URLS.support, background_image_id: "m-support", compact: true,
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-about-talent", page_id: "page-about", section_type: "image_content", sort_order: 2, is_visible: true,
        content: {
          eyebrow: null, heading: "Talent can come from anywhere",
          image: DEFAULT_MEDIA_URLS.aboutAthlete, image_id: "m-about",
          image_alt: "Indian badminton player mid-smash under a spotlight",
          paragraphs: [
            "UnitedAthletes for India Foundation is an athlete-focused organisation committed to creating a stronger ecosystem for athletes across India.",
            "We believe that talent can come from anywhere, but access to opportunities, facilities, equipment and support can determine how far that talent goes. UnitedAthletes works to provide athletes with the resources and opportunities they need to pursue excellence in sport.",
          ],
          flip: true,
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-about-mv", page_id: "page-about", section_type: "cards", sort_order: 3, is_visible: true,
        content: {
          eyebrow: null, heading: null, variant: "split",
          items: [
            { label: "Our Mission", text: "To empower athletes by creating opportunities, providing resources, and building an ecosystem where sporting talent can thrive." },
            { label: "Our Vision", text: "A stronger India where every talented athlete has the opportunity, facilities, equipment and support needed to achieve their goals." },
          ],
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-about-values", page_id: "page-about", section_type: "cards", sort_order: 4, is_visible: true,
        content: {
          eyebrow: "Our Values", heading: "What we stand on",
          items: [
            { title: "Athlete First", text: "Every initiative begins with the needs, aspirations and development of athletes." },
            { title: "Opportunity", text: "We believe talent deserves access to opportunities regardless of background." },
            { title: "Excellence", text: "We encourage athletes to continuously improve and pursue higher levels of performance." },
            { title: "Accessibility", text: "We work toward making sports facilities, equipment and resources more accessible." },
            { title: "Community", text: "Athletes become stronger when supported by a connected sporting community." },
          ],
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-about-provide", page_id: "page-about", section_type: "image_content", sort_order: 5, is_visible: true,
        content: {
          eyebrow: "What We Provide", heading: "Support that is practical",
          description: "Real resources, delivered where they make the biggest difference to an athlete's week.",
          bullet_list: [
            "Sports facilities and infrastructure",
            "Sports equipment",
            "Athlete development opportunities",
            "Training and support resources",
            "Platforms for athlete engagement",
            "Sports community initiatives",
            "Opportunities to pursue sporting goals",
          ],
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-about-cta", page_id: "page-about", section_type: "cta", sort_order: 6, is_visible: true,
        content: {
          eyebrow: "Our Commitment",
          heading: "We don't just support athletes.",
          highlight: "We create opportunities for them to move forward.",
          description: "UnitedAthletes is committed to building an ecosystem where athletes can focus on their passion, develop their abilities and move closer to achieving their dreams.",
          primary_cta: { label: "Get Involved", url: "/get-involved" },
        },
        created_at: "", updated_at: "",
      },
    ],
  },

  programmes: {
    page: {
      id: "page-programmes", title: "Programmes", slug: "programmes", excerpt: "Six athlete-first programmes: development, facility access, equipment support, emerging athletes, community initiatives and the opportunity platform.",
      content: {}, status: "published", template: "default", featured_image_id: "m-programme", author_id: null,
      published_at: "2026-01-01T00:00:00.000Z", seo_title: "Programmes | UnitedAthletes for India Foundation",
      seo_description: "Initiatives focused on athlete development and access to resources, facilities, equipment and opportunities.",
      canonical_url: null, og_image_id: "m-programme", robots_index: true, robots_follow: true, created_at: "", updated_at: "",
    },
    sections: [
      {
        id: "s-prog-hero", page_id: "page-programmes", section_type: "hero", sort_order: 1, is_visible: true,
        content: {
          eyebrow: "Programmes", heading: "Our", highlight: "Programmes",
          description: "Initiatives focused on athlete development and access to sports resources, facilities, equipment and opportunities.",
          background_image: DEFAULT_MEDIA_URLS.programmeHero, background_image_id: "m-programme", compact: true,
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-prog-list", page_id: "page-programmes", section_type: "cards", sort_order: 2, is_visible: true,
        content: {
          eyebrow: null, heading: null, variant: "numbered_list",
          items: [
            { number: "01", title: "Athlete Development Programme", text: "Supporting athletes with resources, guidance and opportunities designed to help them progress in their sporting journey." },
            { number: "02", title: "Sports Facility Access", text: "Helping athletes gain access to suitable sports facilities and training environments." },
            { number: "03", title: "Sports Equipment Support", text: "Providing access to essential sports equipment and resources that athletes require for training and development." },
            { number: "04", title: "Emerging Athlete Support", text: "Identifying and supporting promising athletes who need greater access to opportunities and resources." },
            { number: "05", title: "Community Sports Initiatives", text: "Building stronger sporting communities by connecting athletes, coaches, organisations, supporters and sports enthusiasts." },
            { number: "06", title: "Athlete Opportunity Platform", text: "Creating a platform where athletes can discover opportunities, connect with the sporting ecosystem and work toward their goals." },
          ],
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-prog-approach", page_id: "page-programmes", section_type: "cards", sort_order: 3, is_visible: true,
        content: {
          eyebrow: "Our Approach", heading: "An athlete-first path from ambition to achievement", variant: "steps",
          items: [
            { title: "Discover" }, { title: "Support" }, { title: "Equip" }, { title: "Develop" }, { title: "Connect" }, { title: "Empower" },
          ],
          footnote: "Our objective is to make the journey from sporting ambition to achievement more accessible.",
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-prog-cta", page_id: "page-programmes", section_type: "cta", sort_order: 4, is_visible: true,
        content: {
          eyebrow: null, heading: "Ready to take the", highlight: "next step?",
          primary_cta: { label: "Get Involved", url: "/get-involved" },
          secondary_cta: { label: "Contact Us", url: "/contact" },
          center: true,
        },
        created_at: "", updated_at: "",
      },
    ],
  },

  "get-involved": {
    page: {
      id: "page-gi", title: "Get Involved", slug: "get-involved", excerpt: "Support athlete development, provide sports equipment, back facilities, partner with us, or support an athlete directly.",
      content: {}, status: "published", template: "default", featured_image_id: "m-community", author_id: null,
      published_at: "2026-01-01T00:00:00.000Z", seo_title: "Get Involved | UnitedAthletes for India Foundation",
      seo_description: "Join athletes, supporters and organisations creating better opportunities for India's sporting talent.",
      canonical_url: null, og_image_id: "m-community", robots_index: true, robots_follow: true, created_at: "", updated_at: "",
    },
    sections: [
      {
        id: "s-gi-hero", page_id: "page-gi", section_type: "hero", sort_order: 1, is_visible: true,
        content: {
          eyebrow: "Get Involved", heading: "Be part of the", highlight: "UnitedAthletes movement",
          description: "Sport has the power to transform lives. UnitedAthletes brings together athletes, supporters, organisations, institutions and sports enthusiasts to create better opportunities for India's sporting talent.",
          background_image: DEFAULT_MEDIA_URLS.community, background_image_id: "m-community", compact: true,
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-gi-support", page_id: "page-gi", section_type: "cards", sort_order: 2, is_visible: true,
        content: {
          eyebrow: "Ways to Support", heading: "Choose how you want to make a difference",
          items: [
            { icon: "HeartHandshake", title: "Support Athlete Development", text: "Help athletes access the resources, opportunities and support they need to continue their sporting journey." },
            { icon: "Dumbbell", title: "Provide Sports Equipment", text: "Contribute sports equipment and resources that can directly support athletes and sporting initiatives." },
            { icon: "Landmark", title: "Support Sports Facilities", text: "Help create better access to quality sports facilities and training environments." },
            { icon: "Building2", title: "Partner With Us", text: "Organisations and businesses can collaborate with UnitedAthletes to support athlete-focused initiatives and sports development programmes." },
            { icon: "Users", title: "Support an Athlete", text: "Help talented athletes overcome resource limitations and continue working toward their sporting goals." },
          ],
          cta_card: { label: "Talk to us today", url: "/contact" },
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-gi-cta", page_id: "page-gi", section_type: "cta", sort_order: 3, is_visible: true,
        content: {
          eyebrow: null, heading: "Every contribution becomes", highlight: "training time, gear, and a chance to compete.",
          background_image: DEFAULT_MEDIA_URLS.equipment, background_image_id: "m-equipment",
          primary_cta: { label: "Start a conversation", url: "/contact" },
          align: "left",
        },
        created_at: "", updated_at: "",
      },
    ],
  },

  contact: {
    page: {
      id: "page-contact", title: "Contact", slug: "contact", excerpt: "Reach UnitedAthletes for India Foundation — call +91 8527877688 or visit us in Indirapuram, Ghaziabad, Uttar Pradesh.",
      content: {}, status: "published", template: "default", featured_image_id: "m-facility", author_id: null,
      published_at: "2026-01-01T00:00:00.000Z", seo_title: "Contact | UnitedAthletes for India Foundation",
      seo_description: "Get in touch with UnitedAthletes for India Foundation about athletes, facilities, equipment and partnerships.",
      canonical_url: null, og_image_id: "m-facility", robots_index: true, robots_follow: true, created_at: "", updated_at: "",
    },
    sections: [
      {
        id: "s-contact-hero", page_id: "page-contact", section_type: "hero", sort_order: 1, is_visible: true,
        content: {
          eyebrow: "Contact", heading: "Let's", highlight: "talk sport",
          description: "Athletes, coaches, organisations and supporters — we'd love to hear from you.",
          background_image: DEFAULT_MEDIA_URLS.facility, background_image_id: "m-facility", compact: true,
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-contact-info", page_id: "page-contact", section_type: "rich_text", sort_order: 2, is_visible: true,
        content: {
          eyebrow: "Contact Us", heading: "UnitedAthletes for India Foundation",
          contact_blocks: [
            { icon: "Phone", label: "Phone & WhatsApp", value: "+91 85278 77688", href: "tel:+918527877688" },
            { icon: "MapPin", label: "Address", value: "384A, Nyay Khand 3, Indirapuram, Ghaziabad, Uttar Pradesh – 201014" },
          ],
          show_form: true,
          style: "contact",
        },
        created_at: "", updated_at: "",
      },
      {
        id: "s-contact-cta", page_id: "page-contact", section_type: "cta", sort_order: 3, is_visible: true,
        content: {
          eyebrow: null, heading: "Together, we can build a", highlight: "stronger sporting India.",
          subtitle: "UnitedAthletes — Empowering Athletes. Enabling Dreams.",
          center: true,
        },
        created_at: "", updated_at: "",
      },
    ],
  },
};

export function getDefaultPageBySlug(slug: string): { page: Page; sections: PageSection[] } | undefined {
  return DEFAULT_PAGES[slug];
}

export function getDefaultPages(): Record<string, { page: Page; sections: PageSection[] }> {
  return DEFAULT_PAGES;
}

/* ------------------------- Blog fallback catalogs ------------------------ */

export const DEFAULT_BLOG_CATEGORIES: BlogCategory[] = [
  { id: "cat-1", name: "Athlete Stories", slug: "athlete-stories", description: "Profiles and journeys of athletes we support.", image_id: null, sort_order: 1, created_at: "", updated_at: "" },
  { id: "cat-2", name: "Facilities & Equipment", slug: "facilities-equipment", description: "Updates on sports infrastructure and gear access.", image_id: null, sort_order: 2, created_at: "", updated_at: "" },
  { id: "cat-3", name: "Programmes", slug: "programmes", description: "News from our development programmes and initiatives.", image_id: null, sort_order: 3, created_at: "", updated_at: "" },
  { id: "cat-4", name: "Community", slug: "community", description: "Events, partnerships and community sports initiatives.", image_id: null, sort_order: 4, created_at: "", updated_at: "" },
];

export const DEFAULT_BLOG_TAGS: BlogTag[] = [
  { id: "tag-1", name: "Athlete Development", slug: "athlete-development", created_at: "", updated_at: "" },
  { id: "tag-2", name: "Sports Facilities", slug: "sports-facilities", created_at: "", updated_at: "" },
  { id: "tag-3", name: "Equipment", slug: "equipment", created_at: "", updated_at: "" },
  { id: "tag-4", name: "Opportunities", slug: "opportunities", created_at: "", updated_at: "" },
  { id: "tag-5", name: "Community", slug: "community", created_at: "", updated_at: "" },
  { id: "tag-6", name: "India", slug: "india", created_at: "", updated_at: "" },
];
