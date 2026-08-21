# EFZone — Ma'lumotlar Modeli va RLS Sxemasi (03-data-model)

## 1. Profiles Table
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  full_name TEXT,
  avatar_url TEXT,
  seller_status TEXT CHECK (seller_status IN ('pending', 'approved', 'rejected')),
  telegram_username TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 2. Listings Table
```sql
CREATE TABLE public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('account', 'coins')),
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('ps', 'xbox', 'pc', 'mobile')),
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('active', 'pending_review', 'rejected', 'removed', 'sold')),
  reject_reason TEXT,
  team_rating INTEGER,
  gp_balance BIGINT,
  key_players TEXT[],
  coin_amount BIGINT,
  delivery_time TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 3. Moderatsiya Logikasi
- **E'lon yuborilganda:** `status = 'pending_review'`, profile roli o'zgarmaydi.
- **Admin Approve qilganda:**
  - `listings.status = 'active'`
  - `profiles.seller_status = 'approved'`
  - `profiles.role = 'seller'` (agar buyer bo'lsa)
- **Admin Reject qilganda:**
  - `listings.status = 'rejected'`
  - `listings.reject_reason = 'Sabab...'`
  - Foydalanuvchi roli `buyer`ligicha qoladi.
