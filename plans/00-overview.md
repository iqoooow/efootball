# EFZone Marketplace — Loyiha Haqida Umumiy Ma'lumot (00-overview)

## 1. Mahsulot Maqsadi
EFZone — eFootball (va boshqa gaming akkauntlar/tangalar) uchun xavfsiz, tezkor va professional escrow marketplace platformasi.

## 2. Asosiy Rollar Arxitekturasi
Platformada 3 ta qat'iy ajratilgan rol mavjud:

1. **Buyer (Xaridor / Oddiy foydalanuvchi)**
   - Standart holatda yangi ro'yxatdan o'tgan har bir foydalanuvchiga beriladi.
   - Imkoniyatlari: E'lonlarni ko'rish, filtrlash, xarid qilish, xaridlar tarixini kuzatish, o'z profilini tahrirlash, o'z akkauntini sotish uchun e'lon (ariza) yuborish.
   - Cheklov: Sotuvchi boshqaruv paneliga to'g'ridan-to'g'ri kirish taqiqlangan; o'rniga "Sotuvchi bo'lish / E'lon joylash" yo'naltiriladi.

2. **Seller (Tasdiqlangan Sotuvchi)**
   - O'z akkauntini sotish uchun e'lon yuborgan va Admin tomonidan tasdiqlangan (Approve qilingan) foydalanuvchilar.
   - Imkoniyatlari: Sotuvchi Kabineti (`/seller/dashboard`), yangi e'lonlar joylash, sotuvlar va tushgan mablag'larni kuzatish, pul yechish (payout) so'rovlari.

3. **Admin (Boshqaruvchi)**
   - To'liq vakolatga ega bo'lgan platforma ma'murlari.
   - Imkoniyatlari: Kutilayotgan e'lonlarni moderatsiya qilish (Approve / Reject sababi bilan), foydalanuvchilar rollarini boshqarish (Buyer ↔ Seller ↔ Admin), barcha e'lonlar va tranzaksiyalarni nazorat qilish, platforma statistikasini ko'rish.

## 3. Muvaffaqiyat Mezonlari
- Ro'yxatdan o'tgan foydalanuvchi hech qachon avtomatik sotuvchi kabinetiga kirmaydi; faqat `buyer` profilini ko'radi.
- Akkaunt sotish e'loni yuborilganda `pending_review` holatida tushadi va admin tasdiqlagachgina ommaviy marketplacega chiqadi hamda foydalanuvchi roli `seller`ga o'zgaradi.
- Admin panel ultra-zamonaviy, premium, "border-maniya" va "box-maniya"siz, qulay va tezkor ishlaydi.
- Navbar va Profil tugmalari yetakchi xalqaro startaplar (Stripe, Linear, Vercel darajasida) silliq va professional ko'rinadi.
