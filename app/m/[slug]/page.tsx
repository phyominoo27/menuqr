import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Globe } from 'lucide-react'
import MenuViewer from '@/components/menu-viewer/MenuViewer'

export const metadata = {
  title: 'Menu — MenuQR',
  description: 'Browse our menu',
}

export default async function MenuPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { slug } = await params
  const { lang: urlLang } = await searchParams
  const supabase = await createClient()

  const { data: menu } = await supabase
    .from('menus')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!menu) notFound()

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('menu_id', menu.id)
    .order('sort_order')

  if (categories) {
    for (const cat of categories) {
      const { data: items } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', cat.id)
        .order('sort_order')
      ;(cat as any).items = items || []
    }
  }

  return <MenuViewer menu={menu} categories={categories || []} initialLang={urlLang === 'en' ? 'en' : 'my'} />
}
