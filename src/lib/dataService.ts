import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import type { Listing } from './types'

export interface GetListingsFilter {
  type?: string
  platform?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
  search?: string
  page?: number
  perPage?: number
}

function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ockakkvxpbzjnokrjxrc.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

async function _fetchListings(filters: GetListingsFilter = {}): Promise<{ listings: Listing[], total: number, page: number, perPage: number }> {
  const page = filters.page || 1
  const perPage = filters.perPage || 12

  try {
    const supabase = getPublicSupabase()

    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .in('status', ['active', 'sold'])

    if (filters.type) query = query.eq('type', filters.type)
    if (filters.platform) query = query.eq('platform', filters.platform)
    if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice))
    if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice))

    if (filters.search) {
      const term = `%${filters.search.toLowerCase()}%`
      query = query.or(`title.ilike.${term},description.ilike.${term}`)
    }

    switch (filters.sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break
      case 'price_desc': query = query.order('price', { ascending: false }); break
      default: query = query.order('created_at', { ascending: false }); break
    }

    const from = (page - 1) * perPage
    query = query.range(from, from + perPage - 1)

    const { data: listingsData, count, error } = await query
    if (!error && listingsData) {
      // Fetch seller profiles for these listings
      const sellerIds = Array.from(new Set(listingsData.map((l: any) => l.seller_id).filter(Boolean)))
      let profileMap = new Map()

      if (sellerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, seller_status')
          .in('id', sellerIds)
        if (profiles) {
          profileMap = new Map(profiles.map((p: any) => [p.id, p]))
        }
      }

      const populated = listingsData.map((l: any) => ({
        ...l,
        seller: profileMap.get(l.seller_id) || null,
      }))

      return { listings: populated as Listing[], total: count || listingsData.length, page, perPage }
    }
  } catch (err) {
    console.error('Error fetching listings from Supabase:', err)
  }

  return {
    listings: [],
    total: 0,
    page,
    perPage
  }
}

export const fetchListings = unstable_cache(
  _fetchListings,
  ['listings'],
  { revalidate: 15, tags: ['listings'] }
)

async function _fetchListingById(id: string): Promise<Listing | null> {
  try {
    const supabase = getPublicSupabase()
    
    // Fetch listing
    const { data: listingData, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && listingData) {
      // Fetch seller profile
      let seller = null
      if (listingData.seller_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, seller_status, telegram_username, created_at')
          .eq('id', listingData.seller_id)
          .single()
        seller = profile
      }

      return {
        ...listingData,
        seller,
      } as Listing
    }
  } catch (err) {
    console.error('Error fetching listing by ID:', err)
  }

  return null
}

export const fetchListingById = unstable_cache(
  _fetchListingById,
  ['listing-detail'],
  { revalidate: 10, tags: ['listings'] }
)

export async function fetchStats() {
  try {
    const supabase = getPublicSupabase()
    const [listingsRes, sellersRes, ordersRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'seller'),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
    ])

    return {
      listings: listingsRes.count || 0,
      sellers: sellersRes.count || 0,
      orders: ordersRes.count || 0,
    }
  } catch {
    return { listings: 0, sellers: 0, orders: 0 }
  }
}
