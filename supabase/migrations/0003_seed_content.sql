-- ============================================================================
-- UNITED SPORTS / UNITEDATHLETES — CONTENT SEED  (0003_seed_content.sql)
-- ----------------------------------------------------------------------------
-- Run after 0002_rls_policies.sql in Supabase Dashboard → SQL Editor.
-- Reproduces the current public website as CMS records: media (already in
-- Storage), site settings, navigation, footer, and CMS pages + sections.
-- Idempotent: safe to run more than once.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. ADMIN PROFILE (ensure the seeded admin has a staff profile)
-- ---------------------------------------------------------------------------
insert into public.profiles (user_id, full_name, role, is_active)
values (
  '83fd085d-61e2-44e7-8f35-4d0d00777047',
  'UnitedAthletes Admin',
  'super_admin',
  true
)
on conflict (user_id) do update
  set role = 'super_admin', is_active = true, full_name = 'UnitedAthletes Admin';

-- ---------------------------------------------------------------------------
-- 1. MEDIA (metadata for files already uploaded to Storage)
-- ---------------------------------------------------------------------------
insert into public.media (file_name, storage_path, public_url, mime_type, file_size, alt_text, caption) values
  ('hero-athletes.jpg', 'website-media/heroes/hero-athletes.jpg',
   'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/heroes/hero-athletes.jpg',
   'image/jpeg', 136403, 'Indian sprinter training at dawn on a stadium track', 'Homepage hero — athletes at dawn'),
  ('programme-hero.jpg', 'website-media/heroes/programme-hero.jpg',
   'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/heroes/programme-hero.jpg',
   'image/jpeg', 147703, 'Young Indian boxer training in a gym with golden light', 'Programmes page hero'),
  ('about-athlete.jpg', 'website-media/about/about-athlete.jpg',
   'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/about/about-athlete.jpg',
   'image/jpeg', 133250, 'Indian badminton player mid-smash under a spotlight', 'About page athlete image'),
  ('support.jpg', 'website-media/about/support.jpg',
   'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/about/support.jpg',
   'image/jpeg', 111892, 'A coach and a young athlete clasping hands at sunset', 'About page hero image'),
  ('community.jpg', 'website-media/gallery/community.jpg',
   'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/community.jpg',
   'image/jpeg', 164611, 'Indian athletes in a huddle, backlit with golden light', 'Athletes community huddle'),
  ('facility.jpg', 'website-media/gallery/facility.jpg',
   'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/facility.jpg',
   'image/jpeg', 184575, 'Modern indoor sports arena lit at night', 'Indoor sports arena at night'),
  ('equipment.jpg', 'website-media/gallery/equipment.jpg',
   'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/equipment.jpg',
   'image/jpeg', 155160, 'Premium sports equipment on a dark surface', 'Sports equipment flat-lay'),
  ('para-athlete.jpg', 'website-media/gallery/para-athlete.jpg',
   'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/para-athlete.jpg',
   'image/jpeg', 171236, 'Indian para-athlete racing on a track at sunset', 'Para-athlete on track'),
  ('texture-navy.jpg', 'website-media/gallery/texture-navy.jpg',
   'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/texture-navy.jpg',
   'image/jpeg', 35720, 'Dark navy textured backdrop', 'Navy texture background'),
  ('logo-circle.png', 'website-media/logos/logo-circle.png',
   'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/logos/logo-circle.png',
   'image/png', 270938, 'UnitedAthletes for India Foundation emblem', 'Circular logo seal'),
  ('favicon.png', 'website-media/logos/favicon.png',
   'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/logos/favicon.png',
   'image/png', 270938, 'UnitedAthletes favicon', 'Browser favicon')
on conflict (storage_path) do update set public_url = excluded.public_url, alt_text = excluded.alt_text, caption = excluded.caption;

-- ---------------------------------------------------------------------------
-- 2. BLOG CATEGORIES + TAGS (starter set)
-- ---------------------------------------------------------------------------
insert into public.blog_categories (name, slug, description, sort_order) values
  ('Athlete Stories', 'athlete-stories', 'Profiles and journeys of athletes we support.', 1),
  ('Facilities & Equipment', 'facilities-equipment', 'Updates on sports infrastructure and gear access.', 2),
  ('Programmes', 'programmes', 'News from our development programmes and initiatives.', 3),
  ('Community', 'community', 'Events, partnerships and community sports initiatives.', 4)
on conflict (slug) do update set name = excluded.name, description = excluded.description;

insert into public.blog_tags (name, slug) values
  ('Athlete Development', 'athlete-development'),
  ('Sports Facilities', 'sports-facilities'),
  ('Equipment', 'equipment'),
  ('Opportunities', 'opportunities'),
  ('Community', 'community'),
  ('India', 'india')
on conflict (slug) do update set name = excluded.name;

-- ---------------------------------------------------------------------------
-- 3. NAVIGATION (main menu)
-- ---------------------------------------------------------------------------
insert into public.navigation_menus (name, slug, location, is_active) values
  ('Main Navigation', 'main', 'main', true)
on conflict (slug) do update set name = excluded.name;

with m as (select id from public.navigation_menus where slug = 'main')
insert into public.navigation_items (menu_id, label, url, is_internal, sort_order, is_visible) values
  ((select id from m), 'Home', '/', true, 1, true),
  ((select id from m), 'About', '/about', true, 2, true),
  ((select id from m), 'Programmes', '/programmes', true, 3, true),
  ((select id from m), 'Get Involved', '/get-involved', true, 4, true),
  ((select id from m), 'Contact', '/contact', true, 5, true)
on conflict (menu_id, label) do update set url = excluded.url, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- 4. FOOTER (explore + contact columns)
-- ---------------------------------------------------------------------------
insert into public.footer_sections (title, slug, sort_order, is_visible) values
  ('Explore', 'explore', 1, true),
  ('Contact', 'contact', 2, true)
on conflict (slug) do update set title = excluded.title;

with s as (select id from public.footer_sections where slug = 'explore')
insert into public.footer_items (section_id, label, url, sort_order, is_visible) values
  ((select id from s), 'Home', '/', 1, true),
  ((select id from s), 'About Us', '/about', 2, true),
  ((select id from s), 'Programmes', '/programmes', 3, true),
  ((select id from s), 'Get Involved', '/get-involved', 4, true),
  ((select id from s), 'Contact', '/contact', 5, true)
on conflict (section_id, label) do update set url = excluded.url, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- 5. SITE SETTINGS
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('general', jsonb_build_object(
    'site_name', 'UnitedAthletes',
    'legal_name', 'UnitedAthletes for India Foundation',
    'tagline', 'Empowering Athletes. Enabling Dreams.',
    'logo_id', (select id from public.media where storage_path = 'website-media/logos/logo-circle.png'),
    'logo_url', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/logos/logo-circle.png',
    'favicon_url', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/logos/favicon.png',
    'footer_blurb', 'UnitedAthletes for India Foundation — an athlete-focused organisation building a stronger sporting ecosystem across India.',
    'copyright', (jsonb_build_object('text', 'UnitedAthletes for India Foundation. A Section 8 Company.'))::jsonb
  )),
  ('contact', jsonb_build_object(
    'phone', '+91 85278 77688',
    'phone_tel', '+918527877688',
    'email', 'info@unitedathletes.in',
    'address', '384A, Nyay Khand 3, Indirapuram, Ghaziabad, Uttar Pradesh – 201014',
    'city', 'Ghaziabad',
    'country', 'India'
  )),
  ('social', jsonb_build_object(
    'instagram', '',
    'facebook', '',
    'youtube', '',
    'linkedin', '',
    'twitter', ''
  )),
  ('whatsapp', jsonb_build_object(
    'enabled', true,
    'phone_number', '918527877688',
    'default_message', 'Hello UnitedAthletes for India Foundation, I would like to get in touch!',
    'button_label', 'WhatsApp Us'
  )),
  ('seo', jsonb_build_object(
    'site_name', 'UnitedAthletes',
    'default_title', 'UnitedAthletes for India Foundation',
    'default_description', 'Empowering athletes across India with opportunities, facilities, equipment and support.',
    'og_image_url', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/heroes/hero-athletes.jpg'
  ))
on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- 6. PAGES + SECTIONS  (reproduces the current public website)
-- ---------------------------------------------------------------------------

-- 6.0 helper variable for the admin author id
do $$
declare
  v_admin uuid := '83fd085d-61e2-44e7-8f35-4d0d00777047';
  v_home uuid;
  v_about uuid;
  v_programmes uuid;
  v_get_involved uuid;
  v_contact uuid;
  v_hero uuid;
  v_programme_hero uuid;
  v_community uuid;
  v_facility uuid;
  v_equipment uuid;
  v_para uuid;
  v_about_athlete uuid;
  v_support uuid;
begin
  select id into v_hero from public.media where storage_path = 'website-media/heroes/hero-athletes.jpg';
  select id into v_programme_hero from public.media where storage_path = 'website-media/heroes/programme-hero.jpg';
  select id into v_community from public.media where storage_path = 'website-media/gallery/community.jpg';
  select id into v_facility from public.media where storage_path = 'website-media/gallery/facility.jpg';
  select id into v_equipment from public.media where storage_path = 'website-media/gallery/equipment.jpg';
  select id into v_para from public.media where storage_path = 'website-media/gallery/para-athlete.jpg';
  select id into v_about_athlete from public.media where storage_path = 'website-media/about/about-athlete.jpg';
  select id into v_support from public.media where storage_path = 'website-media/about/support.jpg';

  -- ================= HOMEPAGE =================
  insert into public.pages (title, slug, excerpt, status, template, author_id, published_at,
                            seo_title, seo_description, og_image_id)
  values (
    'Home', 'home', 'UnitedAthletes — Empowering Athletes. Enabling Dreams.',
    'published', 'home', v_admin, now(),
    'UnitedAthletes | Empowering Athletes. Enabling Dreams.',
    'UnitedAthletes for India Foundation bridges talent and opportunity with sports facilities, equipment, guidance and support for athletes across India.',
    v_hero
  )
  on conflict (slug) do update set title = excluded.title, status = 'published', template = 'home'
  returning id into v_home;

  insert into public.page_sections (page_id, section_type, sort_order, is_visible, content) values
  (v_home, 'hero', 1, true, jsonb_build_object(
    'eyebrow', 'UnitedAthletes for India Foundation',
    'heading', 'Empowering Athletes.',
    'highlight', 'Enabling Dreams.',
    'description', 'We bridge the gap between talent and opportunity — providing the facilities, equipment, guidance and support systems athletes across India need to reach their full potential.',
    'background_image_id', v_hero,
    'background_image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/heroes/hero-athletes.jpg',
    'primary_cta', jsonb_build_object('label', 'Get Involved', 'url', '/get-involved'),
    'secondary_cta', jsonb_build_object('label', 'Explore Opportunities', 'url', '/programmes'),
    'statistics', jsonb_build_array(
      jsonb_build_object('number', '14+', 'label', 'Sporting disciplines'),
      jsonb_build_object('number', '6', 'label', 'Core programmes'),
      jsonb_build_object('number', '1', 'label', 'Athlete-first promise')
    )
  )),
  (v_home, 'rich_text', 2, true, jsonb_build_object(
    'eyebrow', 'Our Mission',
    'heading', 'To empower athletes by providing the right opportunities, facilities, equipment, guidance and support they need to achieve their goals and reach their full potential.',
    'highlight_phrase', 'opportunities, facilities, equipment, guidance and support',
    'style', 'large'
  )),
  (v_home, 'image_content', 3, true, jsonb_build_object(
    'eyebrow', 'About UnitedAthletes',
    'heading', 'A platform built around the athlete',
    'image_id', v_community,
    'image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/community.jpg',
    'image_alt', 'Indian athletes in a huddle, backlit with golden light',
    'badge_title', 'Talent is everywhere.',
    'badge_text', 'Opportunity should be too.',
    'paragraphs', jsonb_build_array(
      'UnitedAthletes is dedicated to supporting athletes across India by creating opportunities for them to pursue their sporting ambitions. We work to bridge the gap between talent and opportunity by providing access to sports facilities, equipment, resources and a supportive ecosystem that enables athletes to grow.',
      'Our goal is to help athletes focus on what matters most — training, competing, improving and achieving their dreams.'
    ),
    'cta', jsonb_build_object('label', 'Read our story', 'url', '/about')
  )),
  (v_home, 'cards', 4, true, jsonb_build_object(
    'eyebrow', 'What We Do',
    'heading', 'Everything an athlete needs to keep going',
    'items', jsonb_build_array(
      jsonb_build_object('icon', 'Trophy', 'title', 'Athlete Development', 'text', 'Structured support for athletes moving from potential to performance.'),
      jsonb_build_object('icon', 'Landmark', 'title', 'Sports Facilities', 'text', 'Access to quality infrastructure and training environments.'),
      jsonb_build_object('icon', 'Dumbbell', 'title', 'Equipment & Resources', 'text', 'Essential gear and resources for daily training and competition.'),
      jsonb_build_object('icon', 'Award', 'title', 'Training Opportunities', 'text', 'Development pathways that sharpen skill and raise standards.'),
      jsonb_build_object('icon', 'HeartHandshake', 'title', 'Athlete Support', 'text', 'Guidance and support systems around every athlete''s journey.'),
      jsonb_build_object('icon', 'Users', 'title', 'Community & Networking', 'text', 'A connected ecosystem of athletes, coaches and organisations.'),
      jsonb_build_object('icon', 'Sparkles', 'title', 'Emerging Athletes', 'text', 'Opportunities for talent that has been waiting to be seen.')
    ),
    'cta_card', jsonb_build_object('label', 'See all programmes', 'url', '/programmes')
  )),
  (v_home, 'cards', 5, true, jsonb_build_object(
    'eyebrow', 'Our Focus',
    'heading', 'Four pillars, one athlete',
    'variant', 'image_top',
    'items', jsonb_build_array(
      jsonb_build_object('number', '01', 'title', 'Athletes', 'text', 'Supporting athletes in their journey from potential to performance.', 'image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/para-athlete.jpg', 'image_id', v_para),
      jsonb_build_object('number', '02', 'title', 'Facilities', 'text', 'Helping athletes access quality sports infrastructure and training environments.', 'image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/facility.jpg', 'image_id', v_facility),
      jsonb_build_object('number', '03', 'title', 'Equipment', 'text', 'Providing access to essential sports equipment and resources.', 'image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/equipment.jpg', 'image_id', v_equipment),
      jsonb_build_object('number', '04', 'title', 'Opportunities', 'text', 'Creating pathways for athletes to showcase talent and pursue their goals.', 'image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/community.jpg', 'image_id', v_community)
    )
  )),
  (v_home, 'rich_text', 6, true, jsonb_build_object(
    'eyebrow', 'Sports',
    'heading', 'UnitedAthletes supports athletes across multiple sporting disciplines and aims to create opportunities for athletes from diverse sporting backgrounds.',
    'marquee_items', jsonb_build_array('Cricket','Football','Badminton','Tennis','Athletics','Swimming','Archery','Basketball','Hockey','Wrestling','Boxing','Volleyball','Para-Sports','And More'),
    'style', 'marquee'
  )),
  (v_home, 'cta', 7, true, jsonb_build_object(
    'eyebrow', 'Call to Action',
    'heading', 'Your talent deserves an opportunity.',
    'highlight', 'an opportunity.',
    'description', 'Join the UnitedAthletes community and take the next step toward achieving your sporting goals.',
    'background_image_id', v_facility,
    'background_image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/facility.jpg',
    'primary_cta', jsonb_build_object('label', 'Get Involved', 'url', '/get-involved'),
    'secondary_cta', jsonb_build_object('label', 'Explore Opportunities', 'url', '/programmes')
  ));

  -- ================= ABOUT =================
  insert into public.pages (title, slug, excerpt, status, template, author_id, published_at,
                            seo_title, seo_description, og_image_id)
  values (
    'About Us', 'about', 'An athlete-focused organisation committed to creating a stronger ecosystem for athletes across India.',
    'published', 'default', v_admin, now(),
    'About Us | UnitedAthletes for India Foundation',
    'Our mission, vision and values — creating opportunity, access and support for India''s sporting talent.',
    v_support
  )
  on conflict (slug) do update set title = excluded.title, status = 'published'
  returning id into v_about;

  insert into public.page_sections (page_id, section_type, sort_order, is_visible, content) values
  (v_about, 'hero', 1, true, jsonb_build_object(
    'eyebrow', 'About Us',
    'heading', 'Who',
    'highlight', 'We Are',
    'description', 'An athlete-focused organisation committed to creating a stronger ecosystem for athletes across India.',
    'background_image_id', v_support,
    'background_image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/about/support.jpg',
    'compact', true
  )),
  (v_about, 'image_content', 2, true, jsonb_build_object(
    'eyebrow', null,
    'heading', 'Talent can come from anywhere',
    'image_id', v_about_athlete,
    'image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/about/about-athlete.jpg',
    'image_alt', 'Indian badminton player mid-smash under a spotlight',
    'paragraphs', jsonb_build_array(
      'UnitedAthletes for India Foundation is an athlete-focused organisation committed to creating a stronger ecosystem for athletes across India.',
      'We believe that talent can come from anywhere, but access to opportunities, facilities, equipment and support can determine how far that talent goes. UnitedAthletes works to provide athletes with the resources and opportunities they need to pursue excellence in sport.'
    ),
    'flip', true
  )),
  (v_about, 'cards', 3, true, jsonb_build_object(
    'eyebrow', null,
    'heading', null,
    'variant', 'split',
    'items', jsonb_build_array(
      jsonb_build_object('label', 'Our Mission', 'text', 'To empower athletes by creating opportunities, providing resources, and building an ecosystem where sporting talent can thrive.'),
      jsonb_build_object('label', 'Our Vision', 'text', 'A stronger India where every talented athlete has the opportunity, facilities, equipment and support needed to achieve their goals.')
    )
  )),
  (v_about, 'cards', 4, true, jsonb_build_object(
    'eyebrow', 'Our Values',
    'heading', 'What we stand on',
    'items', jsonb_build_array(
      jsonb_build_object('title', 'Athlete First', 'text', 'Every initiative begins with the needs, aspirations and development of athletes.'),
      jsonb_build_object('title', 'Opportunity', 'text', 'We believe talent deserves access to opportunities regardless of background.'),
      jsonb_build_object('title', 'Excellence', 'text', 'We encourage athletes to continuously improve and pursue higher levels of performance.'),
      jsonb_build_object('title', 'Accessibility', 'text', 'We work toward making sports facilities, equipment and resources more accessible.'),
      jsonb_build_object('title', 'Community', 'text', 'Athletes become stronger when supported by a connected sporting community.')
    )
  )),
  (v_about, 'image_content', 5, true, jsonb_build_object(
    'eyebrow', 'What We Provide',
    'heading', 'Support that is practical',
    'description', 'Real resources, delivered where they make the biggest difference to an athlete''s week.',
    'bullet_list', jsonb_build_array(
      'Sports facilities and infrastructure',
      'Sports equipment',
      'Athlete development opportunities',
      'Training and support resources',
      'Platforms for athlete engagement',
      'Sports community initiatives',
      'Opportunities to pursue sporting goals'
    )
  )),
  (v_about, 'cta', 6, true, jsonb_build_object(
    'eyebrow', 'Our Commitment',
    'heading', 'We don''t just support athletes.',
    'highlight', 'We create opportunities for them to move forward.',
    'description', 'UnitedAthletes is committed to building an ecosystem where athletes can focus on their passion, develop their abilities and move closer to achieving their dreams.',
    'primary_cta', jsonb_build_object('label', 'Get Involved', 'url', '/get-involved')
  ));

  -- ================= PROGRAMMES =================
  insert into public.pages (title, slug, excerpt, status, template, author_id, published_at,
                            seo_title, seo_description, og_image_id)
  values (
    'Programmes', 'programmes', 'Six athlete-first programmes: development, facility access, equipment support, emerging athletes, community initiatives and the opportunity platform.',
    'published', 'default', v_admin, now(),
    'Programmes | UnitedAthletes for India Foundation',
    'Initiatives focused on athlete development and access to resources, facilities, equipment and opportunities.',
    v_programme_hero
  )
  on conflict (slug) do update set title = excluded.title, status = 'published'
  returning id into v_programmes;

  insert into public.page_sections (page_id, section_type, sort_order, is_visible, content) values
  (v_programmes, 'hero', 1, true, jsonb_build_object(
    'eyebrow', 'Programmes',
    'heading', 'Our',
    'highlight', 'Programmes',
    'description', 'Initiatives focused on athlete development and access to sports resources, facilities, equipment and opportunities.',
    'background_image_id', v_programme_hero,
    'background_image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/heroes/programme-hero.jpg',
    'compact', true
  )),
  (v_programmes, 'cards', 2, true, jsonb_build_object(
    'eyebrow', null,
    'heading', null,
    'variant', 'numbered_list',
    'items', jsonb_build_array(
      jsonb_build_object('number', '01', 'title', 'Athlete Development Programme', 'text', 'Supporting athletes with resources, guidance and opportunities designed to help them progress in their sporting journey.'),
      jsonb_build_object('number', '02', 'title', 'Sports Facility Access', 'text', 'Helping athletes gain access to suitable sports facilities and training environments.'),
      jsonb_build_object('number', '03', 'title', 'Sports Equipment Support', 'text', 'Providing access to essential sports equipment and resources that athletes require for training and development.'),
      jsonb_build_object('number', '04', 'title', 'Emerging Athlete Support', 'text', 'Identifying and supporting promising athletes who need greater access to opportunities and resources.'),
      jsonb_build_object('number', '05', 'title', 'Community Sports Initiatives', 'text', 'Building stronger sporting communities by connecting athletes, coaches, organisations, supporters and sports enthusiasts.'),
      jsonb_build_object('number', '06', 'title', 'Athlete Opportunity Platform', 'text', 'Creating a platform where athletes can discover opportunities, connect with the sporting ecosystem and work toward their goals.')
    )
  )),
  (v_programmes, 'cards', 3, true, jsonb_build_object(
    'eyebrow', 'Our Approach',
    'heading', 'An athlete-first path from ambition to achievement',
    'variant', 'steps',
    'items', jsonb_build_array(
      jsonb_build_object('title', 'Discover'),
      jsonb_build_object('title', 'Support'),
      jsonb_build_object('title', 'Equip'),
      jsonb_build_object('title', 'Develop'),
      jsonb_build_object('title', 'Connect'),
      jsonb_build_object('title', 'Empower')
    ),
    'footnote', 'Our objective is to make the journey from sporting ambition to achievement more accessible.'
  )),
  (v_programmes, 'cta', 4, true, jsonb_build_object(
    'eyebrow', null,
    'heading', 'Ready to take the',
    'highlight', 'next step?',
    'primary_cta', jsonb_build_object('label', 'Get Involved', 'url', '/get-involved'),
    'secondary_cta', jsonb_build_object('label', 'Contact Us', 'url', '/contact'),
    'center', true
  ));

  -- ================= GET INVOLVED =================
  insert into public.pages (title, slug, excerpt, status, template, author_id, published_at,
                            seo_title, seo_description, og_image_id)
  values (
    'Get Involved', 'get-involved', 'Support athlete development, provide sports equipment, back facilities, partner with us, or support an athlete directly.',
    'published', 'default', v_admin, now(),
    'Get Involved | UnitedAthletes for India Foundation',
    'Join athletes, supporters and organisations creating better opportunities for India''s sporting talent.',
    v_community
  )
  on conflict (slug) do update set title = excluded.title, status = 'published'
  returning id into v_get_involved;

  insert into public.page_sections (page_id, section_type, sort_order, is_visible, content) values
  (v_get_involved, 'hero', 1, true, jsonb_build_object(
    'eyebrow', 'Get Involved',
    'heading', 'Be part of the',
    'highlight', 'UnitedAthletes movement',
    'description', 'Sport has the power to transform lives. UnitedAthletes brings together athletes, supporters, organisations, institutions and sports enthusiasts to create better opportunities for India''s sporting talent.',
    'background_image_id', v_community,
    'background_image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/community.jpg',
    'compact', true
  )),
  (v_get_involved, 'cards', 2, true, jsonb_build_object(
    'eyebrow', 'Ways to Support',
    'heading', 'Choose how you want to make a difference',
    'items', jsonb_build_array(
      jsonb_build_object('icon', 'HeartHandshake', 'title', 'Support Athlete Development', 'text', 'Help athletes access the resources, opportunities and support they need to continue their sporting journey.'),
      jsonb_build_object('icon', 'Dumbbell', 'title', 'Provide Sports Equipment', 'text', 'Contribute sports equipment and resources that can directly support athletes and sporting initiatives.'),
      jsonb_build_object('icon', 'Landmark', 'title', 'Support Sports Facilities', 'text', 'Help create better access to quality sports facilities and training environments.'),
      jsonb_build_object('icon', 'Building2', 'title', 'Partner With Us', 'text', 'Organisations and businesses can collaborate with UnitedAthletes to support athlete-focused initiatives and sports development programmes.'),
      jsonb_build_object('icon', 'Users', 'title', 'Support an Athlete', 'text', 'Help talented athletes overcome resource limitations and continue working toward their sporting goals.')
    ),
    'cta_card', jsonb_build_object('label', 'Talk to us today', 'url', '/contact')
  )),
  (v_get_involved, 'cta', 3, true, jsonb_build_object(
    'eyebrow', null,
    'heading', 'Every contribution becomes',
    'highlight', 'training time, gear, and a chance to compete.',
    'background_image_id', v_equipment,
    'background_image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/equipment.jpg',
    'primary_cta', jsonb_build_object('label', 'Start a conversation', 'url', '/contact'),
    'align', 'left'
  ));

  -- ================= CONTACT =================
  insert into public.pages (title, slug, excerpt, status, template, author_id, published_at,
                            seo_title, seo_description, og_image_id)
  values (
    'Contact', 'contact', 'Reach UnitedAthletes for India Foundation — call +91 8527877688 or visit us in Indirapuram, Ghaziabad, Uttar Pradesh.',
    'published', 'default', v_admin, now(),
    'Contact | UnitedAthletes for India Foundation',
    'Get in touch with UnitedAthletes for India Foundation about athletes, facilities, equipment and partnerships.',
    v_facility
  )
  on conflict (slug) do update set title = excluded.title, status = 'published'
  returning id into v_contact;

  insert into public.page_sections (page_id, section_type, sort_order, is_visible, content) values
  (v_contact, 'hero', 1, true, jsonb_build_object(
    'eyebrow', 'Contact',
    'heading', 'Let''s',
    'highlight', 'talk sport',
    'description', 'Athletes, coaches, organisations and supporters — we''d love to hear from you.',
    'background_image_id', v_facility,
    'background_image', 'https://ulrltmnzwemjdrcmssej.supabase.co/storage/v1/object/public/website-media/gallery/facility.jpg',
    'compact', true
  )),
  (v_contact, 'rich_text', 2, true, jsonb_build_object(
    'eyebrow', 'Contact Us',
    'heading', 'UnitedAthletes for India Foundation',
    'contact_blocks', jsonb_build_array(
      jsonb_build_object('icon', 'Phone', 'label', 'Phone & WhatsApp', 'value', '+91 85278 77688', 'href', 'tel:+918527877688'),
      jsonb_build_object('icon', 'MapPin', 'label', 'Address', 'value', '384A, Nyay Khand 3, Indirapuram, Ghaziabad, Uttar Pradesh – 201014')
    ),
    'show_form', true,
    'style', 'contact'
  )),
  (v_contact, 'cta', 3, true, jsonb_build_object(
    'eyebrow', null,
    'heading', 'Together, we can build a',
    'highlight', 'stronger sporting India.',
    'subtitle', 'UnitedAthletes — Empowering Athletes. Enabling Dreams.',
    'center', true
  ));

  -- ================= ACTIVITY LOG: seed =================
  insert into public.activity_logs (user_id, action, entity_type, entity_id, metadata) values
    (v_admin, 'CONTENT_SEEDED', 'system', 'migration', jsonb_build_object('note', 'Seeded CMS content from existing website'));
end $$;
