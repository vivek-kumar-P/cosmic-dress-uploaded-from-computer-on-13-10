-- =============================================================
-- SCHEMA SNAPSHOT
-- Source: docs/database-schema.sql (project repository)
-- WARNING: This is a context-only snapshot. DO NOT run this
--          directly — table order and constraints may not be
--          valid for sequential execution.
--          Use scripts/00-complete-database-setup.sql instead.
-- =============================================================

-- Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- CATALOG TABLES (publicly readable)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  parent_id uuid,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);

CREATE TABLE public.colors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  hex_code text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT colors_pkey PRIMARY KEY (id)
);

CREATE TABLE public.sizes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  code text NOT NULL,
  measurements jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sizes_pkey PRIMARY KEY (id)
);

CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['tops'::text, 'bottoms'::text, 'accessories'::text, 'shoes'::text])),
  style text NOT NULL CHECK (style = ANY (ARRAY['casual'::text, 'formal'::text, 'streetwear'::text, 'activewear'::text])),
  image_url text,
  model_url text,
  is_new boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  size_id uuid,
  color_id uuid,
  price numeric,
  sku text,
  stock_quantity integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_variants_size_id_fkey FOREIGN KEY (size_id) REFERENCES public.sizes(id),
  CONSTRAINT product_variants_color_id_fkey FOREIGN KEY (color_id) REFERENCES public.colors(id)
);

CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

CREATE TABLE public.product_models (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  model_url text NOT NULL,
  format text,
  version text,
  model_metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_models_pkey PRIMARY KEY (id),
  CONSTRAINT product_models_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

CREATE TABLE public.product_tags (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_tags_pkey PRIMARY KEY (id)
);

CREATE TABLE public.product_tag_relations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_tag_relations_pkey PRIMARY KEY (id),
  CONSTRAINT product_tag_relations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_tag_relations_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.product_tags(id)
);

-- ─────────────────────────────────────────────────────────────
-- USER-SCOPED TABLES (RLS enforced)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id uuid NOT NULL UNIQUE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text,
  email text,
  phone text,
  website text,
  street_address text,
  city text,
  state text,
  postal_code text,
  country text,
  address text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.avatars (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])),
  height numeric,
  build text CHECK (build = ANY (ARRAY['slim'::text, 'average'::text, 'athletic'::text])),
  skin_tone text,
  model_data jsonb,
  body_measurements jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT avatars_pkey PRIMARY KEY (id),
  CONSTRAINT avatars_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.avatar_measurements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  avatar_id uuid NOT NULL,
  measurement_type text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT avatar_measurements_pkey PRIMARY KEY (id),
  CONSTRAINT avatar_measurements_avatar_id_fkey FOREIGN KEY (avatar_id) REFERENCES public.avatars(id)
);

CREATE TABLE public.saved_outfits (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  avatar_id uuid,
  name text NOT NULL,
  description text,
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_outfits_pkey PRIMARY KEY (id),
  CONSTRAINT saved_outfits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT saved_outfits_avatar_id_fkey FOREIGN KEY (avatar_id) REFERENCES public.avatars(id)
);

CREATE TABLE public.outfit_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  outfit_id uuid NOT NULL,
  product_id uuid NOT NULL,
  position_data text,
  customization_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT outfit_items_pkey PRIMARY KEY (id),
  CONSTRAINT outfit_items_outfit_id_fkey FOREIGN KEY (outfit_id) REFERENCES public.saved_outfits(id),
  CONSTRAINT outfit_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

CREATE TABLE public.favorites (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])),
  total_amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  product_id uuid,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
