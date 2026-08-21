-- ==========================================================
-- EFZone Marketplace - To'liq Supabase SQL Sxemasi
-- Ushbu kodni Supabase SQL Editor'ga qo'ying va RUN tugmasini bosing
-- ==========================================================

-- 1. Profiles Table (Foydalanuvchilar profillari)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  seller_status TEXT CHECK (seller_status IN ('pending', 'approved', 'rejected')),
  telegram_username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agar profiles jadvali allaqachon mavjud bo'lsa, ustunlarni qo'shamiz
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seller_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profil hamma ko'ra oladi" ON public.profiles;
CREATE POLICY "Profil hamma ko'ra oladi" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profil yaratish" ON public.profiles;
CREATE POLICY "Profil yaratish" ON public.profiles
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Profilni yangilash" ON public.profiles;
CREATE POLICY "Profilni yangilash" ON public.profiles
  FOR UPDATE USING (true);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mavjud auth userlarning email va profillarini sinxronlash
INSERT INTO public.profiles (id, full_name, email, role)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), email, COALESCE(raw_user_meta_data->>'role', 'buyer')
FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- ==========================================================
-- 2. Listings Table (Akkaunt va Coin e'lonlari)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'account' CHECK (type IN ('account', 'coins')),
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('ps', 'xbox', 'pc', 'mobile')),
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('active', 'pending_review', 'rejected', 'removed', 'sold')),
  reject_reason TEXT,
  -- Account specific
  team_rating INTEGER,
  gp_balance BIGINT,
  key_players TEXT[],
  -- Coins specific
  coin_amount BIGINT,
  -- Common
  delivery_time TEXT DEFAULT '15 daqiqa',
  images TEXT[] DEFAULT ARRAY['/hero-bg.jpg'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agar listings jadvali mavjud bo'lsa, ustunlarni tekshiramiz
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS reject_reason TEXT;
ALTER TABLE public.listings ALTER COLUMN status SET DEFAULT 'pending_review';

-- Listings RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active listinglar hamma ko'ra oladi" ON public.listings;
DROP POLICY IF EXISTS "Listinglarni ko'rish" ON public.listings;
CREATE POLICY "Listinglarni ko'rish" ON public.listings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tasdiqlangan seller listing yaratadi" ON public.listings;
DROP POLICY IF EXISTS "Foydalanuvchi listing yuboradi" ON public.listings;
CREATE POLICY "Foydalanuvchi listing yuboradi" ON public.listings
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Seller o'z listingini yangilaydi" ON public.listings;
DROP POLICY IF EXISTS "Seller yoki admin listingni yangilaydi" ON public.listings;
CREATE POLICY "Seller yoki admin listingni yangilaydi" ON public.listings
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Listingni o'chirish" ON public.listings;
CREATE POLICY "Listingni o'chirish" ON public.listings
  FOR DELETE USING (true);

-- ==========================================================
-- 3. Orders Table (Buyurtmalar & Escrow)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE RESTRICT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'awaiting_delivery', 'delivered', 'confirmed', 'completed', 'disputed', 'refunded')),
  delivery_confirmed_at TIMESTAMPTZ,
  dispute_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Order ko'rish" ON public.orders;
CREATE POLICY "Order ko'rish" ON public.orders
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Order yaratish" ON public.orders;
CREATE POLICY "Order yaratish" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Order yangilash" ON public.orders;
CREATE POLICY "Order yangilash" ON public.orders
  FOR UPDATE USING (true);

-- ==========================================================
-- 4. Reviews Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviewlar ko'rish" ON public.reviews;
CREATE POLICY "Reviewlar ko'rish" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Review yaratish" ON public.reviews;
CREATE POLICY "Review yaratish" ON public.reviews
  FOR INSERT WITH CHECK (true);

-- ==========================================================
-- 5. Storage Buckets (Agar kerak bo'lsa)
-- ==========================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;
