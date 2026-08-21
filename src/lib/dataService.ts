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
      .select(`*, seller:profiles(id, full_name, seller_status)`, { count: 'exact' })
      .eq('status', 'active')

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

    const { data, count, error } = await query
    if (!error && data) {
      return { listings: data as Listing[], total: count || data.length, page, perPage }
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
  { revalidate: 30, tags: ['listings'] }
)

async function _fetchListingById(id: string): Promise<Listing | null> {
  try {
    const supabase = getPublicSupabase()
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:profiles(id, full_name, seller_status, created_at),
        reviews(rating, comment, created_at, reviewer:profiles(full_name))
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (!error && data) return data as Listing
  } catch (err) {
    console.error('Error fetching listing by ID:', err)
  }

  return null
}

export const fetchListingById = unstable_cache(
  _fetchListingById,
  ['listing-by-id'],
  { revalidate: 30, tags: ['listings'] }
)

async function _fetchStats() {
  try {
    const supabase = getPublicSupabase()
    const [listingsRes, ordersRes, sellersRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('seller_status', 'approved'),
    ])

    return {
      listings: listingsRes.count || 0,
      orders: ordersRes.count || 0,
      sellers: sellersRes.count || 0,
    }
  } catch (err) {
    console.error('Error fetching stats from Supabase:', err)
  }

  return {
    listings: 0,
    orders: 0,
    sellers: 0,
  }
}

export const fetchStats = unstable_cache(
  _fetchStats,
  ['stats'],
  { revalidate: 120, tags: ['stats'] }
)
