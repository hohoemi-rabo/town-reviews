// Common types for the application

export interface Place {
  id: string
  place_id: string
  name: string
  lat: number
  lng: number
  category: string | null
  address: string | null
  created_at: string
}

export interface Recommendation {
  id: string
  place_id: string
  heard_from: string
  heard_from_type: string
  note_raw: string | null
  note_formatted: string | null
  tags: string[] | null
  season: string | null
  author_name: string | null
  author_ip_hash: string | null
  is_anonymous: boolean
  images: string[] | null
  created_at: string
  updated_at: string
  is_editable_until: string | null
}

export interface Reaction {
  id: string
  recommendation_id: string
  reaction_type: 'ほっこり' | '行ってみたい' | 'メモした'
  user_identifier: string
  created_at: string
}

export interface MonthlyDigest {
  id: string
  year_month: string
  summary: string | null
  popular_spots: Record<string, unknown> | null
  trending_tags: string[] | null
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
}

// Category types
export type Category = '飲食' | '体験' | '自然' | '温泉'

// Source types
export type HeardFromType = '家族・親戚' | '友人・知人' | '近所の人' | 'お店の人' | 'SNS' | 'その他'
