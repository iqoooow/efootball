# EFZone Marketplace — Arxitektura va Texnik Stack (01-architecture)

## 1. Texnik Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Vanilla CSS + Modern CSS Variables (Tailwind PostCSS utilities where needed, no rigid boxes/borders)
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
- **Icons:** Lucide React (yagona, professional ikonka tizimi)
- **Data Caching & ISR:** Next.js `unstable_cache` & Supabase Server Client

## 2. Papka Tuzilishi
```
src/
├── app/
│   ├── admin/             → Ultra-premium Admin Panel (Overview, Moderation, Users, Listings, Orders)
│   ├── auth/              → Login & Register (Buyer sifatida ro'yxatdan o'tish)
│   ├── checkout/          → Escrow to'lov va buyurtma tasdiqlash
│   ├── listings/          → Marketplace e'lonlari, qidiruv va filtrlash
│   ├── profile/           → Foydalanuvchi profili, xaridlar tarixi va status
│   ├── seller/
│   │   ├── apply/         → Akkaunt sotish / E'lon joylash arizasi
│   │   └── dashboard/     → Tasdiqlangan Seller kabineti (Listinglar, daromad, savdolar)
│   └── page.tsx           → Asosiy Landing sahifa
├── components/
│   ├── layout/            → Navbar (Modern premium pill), Footer, Logo
│   ├── listings/          → E'lon kartalari, filtrlash
│   └── admin/             → Admin boshqaruv komponentlari
└── lib/
    ├── supabase/          → Server & Client Supabase integratsiyasi
    ├── dataService.ts     → Ma'lumotlarni xavfsiz va tezkor yuklash servisi
    ├── types.ts           → TypeScript tiplari
    └── utils.ts           → Yordamchi formatlash funksiyalari
```

## 3. Xavfsizlik va Ruxsatlar (RBAC)
- **Role Guard:** Har bir maxsus sahifada (Admin, Seller Dashboard) foydalanuvchi roli tekshiriladi.
- **Admin Access:** Login/parol (`admin` / `admin123`) yoki Supabase `profiles.role === 'admin'`.
- **Seller Guard:** Faqat `profiles.role === 'seller'` yoki `profiles.role === 'admin'` bo'lganlar dashboardga kirishi mumkin; oddiy xaridorlar "Sotuvchi bo'lish / E'lon yuborish" arizasiga yo'naltiriladi.
