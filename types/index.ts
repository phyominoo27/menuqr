export interface User {
  id: string
  email: string
  business_name: string | null
  created_at: string
}

export interface Menu {
  id: string
  user_id: string
  name: string
  slug: string
  is_published: boolean
  created_at: string
}

export interface MenuCategory {
  id: string
  menu_id: string
  name_my: string
  name_en: string
  sort_order: number
}

export interface MenuItem {
  id: string
  category_id: string
  name_my: string
  name_en: string
  description_my: string | null
  description_en: string | null
  price: number
  currency: 'MMK' | 'USD'
  image_url: string | null
  sort_order: number
  is_available: boolean
}

export interface Table {
  id: string
  restaurant_id: string
  label: string
  qr_slug: string
  menu_id: string | null
  created_at: string
}

export type Language = 'my' | 'en'
