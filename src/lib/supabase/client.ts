import { createBrowserClient } from '@supabase/ssr'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Real config bo'lsa true qaytaradi
export const isSupabaseConfigured =
  rawUrl.startsWith('https://') && rawKey.length > 20

// Safe client — faqat real keys bilan ishlaydi
export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase sozlanmagan. .env.local faylida NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY ni to\'liq kiriting.'
    )
  }
  return createBrowserClient(rawUrl, rawKey)
}
