export type UserRole = 'buyer' | 'seller' | 'admin'
export type SellerStatus = 'pending' | 'approved' | 'rejected'
export type ListingType = 'account' | 'coins'
export type Platform = 'ps' | 'xbox' | 'pc' | 'mobile'
export type ListingStatus = 'active' | 'pending_review' | 'rejected' | 'removed' | 'sold'
export type OrderStatus = 'paid' | 'awaiting_delivery' | 'delivered' | 'confirmed' | 'completed' | 'disputed' | 'refunded'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'
export type TicketStatus = 'open' | 'in_progress' | 'resolved'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  email?: string | null
  phone?: string | null
  seller_status: SellerStatus | null
  telegram_username: string | null
  total_sales?: number
  created_at: string
}

export interface Listing {
  id: string
  seller_id: string
  type: ListingType
  title: string
  description: string | null
  platform: Platform
  price: number
  status: ListingStatus
  reject_reason?: string | null
  // Account specific
  team_rating: number | null
  coin_balance: number | null
  gp_balance?: number | null
  key_players: string[] | null
  // Coins specific
  coin_amount: number | null
  // Common
  delivery_time: string | null
  images: string[] | null
  created_at: string
  // Joined
  seller?: Profile
  reviews?: Review[]
}

export interface SellerApplication {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  telegram: string | null
  platforms: Platform[]
  experience: string
  id_doc_url: string | null
  status: ApplicationStatus
  admin_note: string | null
  created_at: string
  // Joined
  profile?: Profile
}

export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  price: number
  status: OrderStatus
  delivery_confirmed_at: string | null
  dispute_reason: string | null
  created_at: string
  // Joined
  listing?: Listing
  buyer?: Profile
  seller?: Profile
}

export interface Review {
  id: string
  order_id: string
  reviewer_id: string
  seller_id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer?: Profile
}

export interface Message {
  id: string
  order_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: Profile
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  status: TicketStatus
  admin_reply: string | null
  created_at: string
  updated_at: string
}
