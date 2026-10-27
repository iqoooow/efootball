-- ==========================================================
-- EFZone Marketplace - To'liq Supabase SQL Sxemasi
-- Ushbu kodni Supabase SQL Editor'ga qo'ying va RUN tugmasini bosing.
-- Fayl qayta ishga tushirishga xavfsiz (idempotent): eski ochiq
-- siyosatlarni o'chiradi va qat'iy RLS siyosatlarini o'rnatadi.
--
-- Birinchi adminni tayinlash (faqat SQL Editor orqali):
--   UPDATE public.profiles SET role = 'admin' WHERE email = 'siz@example.com';
-- ==========================================================

-- ==========================================================
-- 1. Profiles Table (Foydalanuvchilar profillari)
-- ==========================================================
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

-- Joriy foydalanuvchi adminmi? (RLS ichida rekursiyasiz ishlashi uchun SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- So'rov oddiy mijozdan (anon / authenticated) kelyaptimi?
-- postgres, service_role va SECURITY DEFINER funksiyalar bu tekshiruvdan o'tadi.
CREATE OR REPLACE FUNCTION public.is_client_request()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT current_user IN ('anon', 'authenticated');
$$;

-- Auto-create profile on signup trigger
-- Rol HECH QACHON user_metadata'dan olinmaydi: har bir yangi foydalanuvchi 'buyer'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'buyer',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mavjud auth userlarning profillarini sinxronlash (mavjud rollar o'zgarmaydi)
INSERT INTO public.profiles (id, full_name, email, role)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), email, 'buyer'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Profil himoyasi: oddiy foydalanuvchi o'z rolini, emailini va
-- tasdiqlangan sotuvchi statusini o'zgartira olmaydi.
CREATE OR REPLACE FUNCTION public.guard_profile_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_client_request() OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := 'buyer';
    NEW.email := auth.jwt() ->> 'email';
    NEW.seller_status := CASE WHEN NEW.seller_status = 'pending' THEN 'pending' ELSE NULL END;
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Rolni faqat admin o''zgartira oladi' USING ERRCODE = '42501';
  END IF;

  NEW.email := OLD.email;
  NEW.created_at := OLD.created_at;

  -- Faqat "ariza yuborish" (NULL/rejected -> pending) ruxsat etiladi
  IF NEW.seller_status IS DISTINCT FROM OLD.seller_status
     AND NOT (NEW.seller_status = 'pending' AND OLD.seller_status IS DISTINCT FROM 'approved') THEN
    NEW.seller_status := OLD.seller_status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_write ON public.profiles;
CREATE TRIGGER guard_profile_write
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_write();

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- "Profilni ko'rish" (SELECT) siyosati orders jadvaliga bog'liq,
-- shuning uchun u 3-bo'limdan keyin yaratiladi.
DROP POLICY IF EXISTS "Profil hamma ko'ra oladi" ON public.profiles;

DROP POLICY IF EXISTS "Profil yaratish" ON public.profiles;
CREATE POLICY "Profil yaratish" ON public.profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Profilni yangilash" ON public.profiles;
CREATE POLICY "Profilni yangilash" ON public.profiles
  FOR UPDATE
  USING (id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Profilni o'chirish" ON public.profiles;
CREATE POLICY "Profilni o'chirish" ON public.profiles
  FOR DELETE USING (public.is_admin());

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

-- E'lon himoyasi: sotuvchi o'z e'lonini o'zi tasdiqlay olmaydi.
CREATE OR REPLACE FUNCTION public.guard_listing_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_client_request() OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending_review';
    NEW.reject_reason := NULL;
    RETURN NEW;
  END IF;

  IF OLD.status = 'sold' THEN
    RAISE EXCEPTION 'Sotilgan e''lonni tahrirlab bo''lmaydi' USING ERRCODE = '42501';
  END IF;

  -- Sotuvchi faqat moderatsiyaga qayta yuborishi yoki e'lonni olib tashlashi mumkin
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status NOT IN ('pending_review', 'removed') THEN
    RAISE EXCEPTION 'E''lon statusini faqat admin o''zgartira oladi' USING ERRCODE = '42501';
  END IF;

  NEW.reject_reason := CASE WHEN NEW.status = 'pending_review' THEN NULL ELSE OLD.reject_reason END;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_listing_write ON public.listings;
CREATE TRIGGER guard_listing_write
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.guard_listing_write();

-- Listings RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active listinglar hamma ko'ra oladi" ON public.listings;
DROP POLICY IF EXISTS "Listinglarni ko'rish" ON public.listings;
CREATE POLICY "Listinglarni ko'rish" ON public.listings
  FOR SELECT USING (
    status IN ('active', 'sold')
    OR seller_id = (SELECT auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Tasdiqlangan seller listing yaratadi" ON public.listings;
DROP POLICY IF EXISTS "Foydalanuvchi listing yuboradi" ON public.listings;
CREATE POLICY "Foydalanuvchi listing yuboradi" ON public.listings
  FOR INSERT WITH CHECK (seller_id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Seller o'z listingini yangilaydi" ON public.listings;
DROP POLICY IF EXISTS "Seller yoki admin listingni yangilaydi" ON public.listings;
CREATE POLICY "Seller yoki admin listingni yangilaydi" ON public.listings
  FOR UPDATE
  USING (seller_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (seller_id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Listingni o'chirish" ON public.listings;
CREATE POLICY "Listingni o'chirish" ON public.listings
  FOR DELETE USING (seller_id = (SELECT auth.uid()) OR public.is_admin());

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

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS seller_joined_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Order ko'rish" ON public.orders;
CREATE POLICY "Order ko'rish" ON public.orders
  FOR SELECT USING (
    buyer_id = (SELECT auth.uid())
    OR seller_id = (SELECT auth.uid())
    OR public.is_admin()
  );

-- Mijoz buyurtmani to'g'ridan-to'g'ri yarata olmaydi: faqat public.create_order() RPC orqali
-- (u e'lonni qulflaydi va ikki marta sotilishining oldini oladi). 8-bo'limga qarang.
DROP POLICY IF EXISTS "Order yaratish" ON public.orders;

-- Xaridor/sotuvchi harakatlari 8-bo'limdagi RPC'lar orqali; to'g'ridan-to'g'ri UPDATE faqat admin
DROP POLICY IF EXISTS "Order yangilash" ON public.orders;
CREATE POLICY "Order yangilash" ON public.orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Profiles SELECT: o'zi, admin yoki bitim tomoni (xaridor <-> sotuvchi kontakti)
DROP POLICY IF EXISTS "Profilni ko'rish" ON public.profiles;
CREATE POLICY "Profilni ko'rish" ON public.profiles
  FOR SELECT USING (
    id = (SELECT auth.uid())
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE (o.buyer_id = (SELECT auth.uid()) AND o.seller_id = profiles.id)
         OR (o.seller_id = (SELECT auth.uid()) AND o.buyer_id = profiles.id)
    )
  );

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

-- Faqat yakunlangan buyurtmaning xaridori sharh qoldiradi
DROP POLICY IF EXISTS "Review yaratish" ON public.reviews;
CREATE POLICY "Review yaratish" ON public.reviews
  FOR INSERT WITH CHECK (
    reviewer_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = reviews.order_id
        AND o.buyer_id = (SELECT auth.uid())
        AND o.seller_id = reviews.seller_id
        AND o.status IN ('confirmed', 'completed')
    )
  );

-- ==========================================================
-- 5. Public Profiles View (Ommaviy sotuvchi ma'lumotlari)
-- Email va telefon kiritilmagan. View egasi huquqi bilan ishlaydi,
-- shuning uchun profiles RLS'ni chetlab, faqat xavfsiz ustunlarni ko'rsatadi.
-- ==========================================================
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_barrier = true) AS
  SELECT id, role, full_name, avatar_url, seller_status, telegram_username, created_at
  FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ==========================================================
-- 6. Storage Buckets (Agar kerak bo'lsa)
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================================
-- 7. Order Messages (Savdo xonasi chati)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.order_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'text' CHECK (kind IN ('text', 'system')),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_messages_order_id_idx
  ON public.order_messages (order_id, created_at);

ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xabarlarni ko'rish" ON public.order_messages;
CREATE POLICY "Xabarlarni ko'rish" ON public.order_messages
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_messages.order_id
        AND (o.buyer_id = (SELECT auth.uid()) OR o.seller_id = (SELECT auth.uid()))
    )
  );

-- Faqat bitim tomonlari, faqat oddiy matn, faqat bitim ochiq bo'lganda yozadi.
-- Tizim xabarlarini faqat RPC'lar (SECURITY DEFINER) qo'shadi.
DROP POLICY IF EXISTS "Xabar yuborish" ON public.order_messages;
CREATE POLICY "Xabar yuborish" ON public.order_messages
  FOR INSERT WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND kind = 'text'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_messages.order_id
        AND (o.buyer_id = (SELECT auth.uid()) OR o.seller_id = (SELECT auth.uid()))
        AND o.status IN ('paid', 'delivered', 'disputed')
    )
  );

-- Realtime (chat va status yangilanishlari uchun)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'order_messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
  END IF;
END;
$$;

-- ==========================================================
-- 8. Order RPC'lari (Escrow holat mashinasi)
--   paid --(sotuvchi kiradi)--> paid + seller_joined_at
--   paid --(sotuvchi topshirdi)--> delivered
--   paid | delivered --(xaridor tasdiqladi)--> completed
--   paid | delivered --(xaridor yoki sotuvchi)--> disputed  (admin hal qiladi)
--   paid --(sotuvchi 90 daqiqada kirmadi, xaridor so'radi)--> refunded
-- ==========================================================
CREATE OR REPLACE FUNCTION public.order_system_message(p_order_id UUID, p_content TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.order_messages (order_id, sender_id, kind, content)
  VALUES (p_order_id, NULL, 'system', p_content);
$$;

-- Ichki yordamchi: buyurtmani qulflab oladi va chaqiruvchining rolini tekshiradi
CREATE OR REPLACE FUNCTION public.lock_order_for(p_order_id UUID, p_role TEXT)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Buyurtma topilmadi' USING ERRCODE = 'P0002';
  END IF;
  IF (p_role = 'buyer' AND v_order.buyer_id IS DISTINCT FROM auth.uid())
     OR (p_role = 'seller' AND v_order.seller_id IS DISTINCT FROM auth.uid())
     OR (p_role = 'party' AND auth.uid() IS DISTINCT FROM v_order.buyer_id
                          AND auth.uid() IS DISTINCT FROM v_order.seller_id) THEN
    RAISE EXCEPTION 'Bu amalga ruxsat yo''q' USING ERRCODE = '42501';
  END IF;
  RETURN v_order;
END;
$$;

-- Buyurtma yaratish: e'lon qulflanadi va darhol 'sold' (band) bo'ladi
CREATE OR REPLACE FUNCTION public.create_order(p_listing_id UUID, p_payment_method TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_listing public.listings%ROWTYPE;
  v_order_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Xarid qilish uchun tizimga kiring' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_listing FROM public.listings WHERE id = p_listing_id FOR UPDATE;

  IF NOT FOUND OR v_listing.status <> 'active' THEN
    RAISE EXCEPTION 'Bu e''lon endi sotuvda emas' USING ERRCODE = 'P0001';
  END IF;
  IF v_listing.seller_id = v_uid THEN
    RAISE EXCEPTION 'O''z e''loningizni sotib ololmaysiz' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.orders (buyer_id, seller_id, listing_id, price, status, payment_method)
  VALUES (v_uid, v_listing.seller_id, v_listing.id, v_listing.price, 'paid',
          NULLIF(left(COALESCE(p_payment_method, ''), 20), ''))
  RETURNING id INTO v_order_id;

  UPDATE public.listings SET status = 'sold' WHERE id = v_listing.id;

  PERFORM public.order_system_message(v_order_id,
    '✅ Buyurtma yaratildi. Mablag'' Escrow hisobida muzlatildi. Sotuvchi 1 soat 30 daqiqa ichida xonaga kirishi kerak, aks holda pulni qaytarib olishingiz mumkin.');

  RETURN v_order_id;
END;
$$;

-- Sotuvchi xonaga kirdi (sotuvchi sahifani birinchi marta ochganda avtomatik chaqiriladi)
CREATE OR REPLACE FUNCTION public.order_seller_join(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order public.orders%ROWTYPE := public.lock_order_for(p_order_id, 'seller');
BEGIN
  IF v_order.status <> 'paid' OR v_order.seller_joined_at IS NOT NULL THEN
    RETURN;
  END IF;
  UPDATE public.orders SET seller_joined_at = NOW() WHERE id = p_order_id;
  PERFORM public.order_system_message(p_order_id,
    '👋 Sotuvchi xarid xonasiga qo''shildi. Akkaunt ma''lumotlarini topshirishi kutilmoqda.');
END;
$$;

-- Sotuvchi akkauntni topshirdi
CREATE OR REPLACE FUNCTION public.order_mark_delivered(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order public.orders%ROWTYPE := public.lock_order_for(p_order_id, 'seller');
BEGIN
  IF v_order.status <> 'paid' THEN
    RAISE EXCEPTION 'Buyurtma bu holatda topshirib bo''lmaydi' USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.orders
  SET status = 'delivered',
      delivered_at = NOW(),
      seller_joined_at = COALESCE(seller_joined_at, NOW())
  WHERE id = p_order_id;
  PERFORM public.order_system_message(p_order_id,
    '📦 Sotuvchi akkaunt topshirilganini belgiladi. Akkauntni tekshirib, «Tasdiqlash» yoki «Nizo ochish» tugmasini bosing.');
END;
$$;

-- Xaridor qabul qildi: escrow sotuvchiga o'tadi
CREATE OR REPLACE FUNCTION public.order_confirm(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order public.orders%ROWTYPE := public.lock_order_for(p_order_id, 'buyer');
BEGIN
  IF v_order.status NOT IN ('paid', 'delivered') THEN
    RAISE EXCEPTION 'Buyurtma bu holatda tasdiqlab bo''lmaydi' USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.orders
  SET status = 'completed', delivery_confirmed_at = NOW(), closed_at = NOW()
  WHERE id = p_order_id;
  PERFORM public.order_system_message(p_order_id,
    '🎉 Xaridor akkauntni qabul qildi. Escrow mablag''i sotuvchiga o''tkazildi. Bitim yakunlandi.');
END;
$$;

-- Nizo: mablag' muzlaydi, admin hal qiladi
CREATE OR REPLACE FUNCTION public.order_dispute(p_order_id UUID, p_reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order public.orders%ROWTYPE := public.lock_order_for(p_order_id, 'party');
  v_reason TEXT := left(btrim(COALESCE(p_reason, '')), 1000);
BEGIN
  IF v_reason = '' THEN
    RAISE EXCEPTION 'Nizo sababini yozing' USING ERRCODE = 'P0001';
  END IF;
  IF v_order.status NOT IN ('paid', 'delivered') THEN
    RAISE EXCEPTION 'Buyurtma bu holatda nizo ochib bo''lmaydi' USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.orders SET status = 'disputed', dispute_reason = v_reason WHERE id = p_order_id;
  PERFORM public.order_system_message(p_order_id,
    '⚠️ NIZO OCHILDI. Mablag'' muzlatildi, admin jamoasi 24 soat ichida ko''rib chiqadi. Sabab: «' || v_reason || '»');
END;
$$;

-- Auto-refund: sotuvchi 90 daqiqa ichida kirmagan bo'lsa, xaridor pulni qaytarib oladi
CREATE OR REPLACE FUNCTION public.order_request_refund(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order public.orders%ROWTYPE := public.lock_order_for(p_order_id, 'buyer');
BEGIN
  IF v_order.status <> 'paid' OR v_order.seller_joined_at IS NOT NULL THEN
    RAISE EXCEPTION 'Sotuvchi xonaga kirgan, avtomatik qaytarish mumkin emas' USING ERRCODE = 'P0001';
  END IF;
  IF NOW() < v_order.created_at + INTERVAL '90 minutes' THEN
    RAISE EXCEPTION 'Auto-refund muddati hali tugamagan' USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.orders SET status = 'refunded', closed_at = NOW() WHERE id = p_order_id;
  -- E'lon qayta sotuvga chiqadi
  UPDATE public.listings SET status = 'active' WHERE id = v_order.listing_id AND status = 'sold';
  PERFORM public.order_system_message(p_order_id,
    '↩️ Sotuvchi belgilangan vaqtda kirmadi. To''lov xaridorga to''liq qaytarildi.');
END;
$$;

-- Ichki funksiyalarni mijozdan yopamiz, ommaviy RPC'larni faqat tizimga kirganlarga ochamiz
REVOKE EXECUTE ON FUNCTION public.order_system_message(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lock_order_for(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_order(UUID, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.order_seller_join(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.order_mark_delivered(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.order_confirm(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.order_dispute(UUID, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.order_request_refund(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.order_seller_join(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.order_mark_delivered(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.order_confirm(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.order_dispute(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.order_request_refund(UUID) TO authenticated;

-- PostgREST sxema keshini yangilash
NOTIFY pgrst, 'reload schema';
