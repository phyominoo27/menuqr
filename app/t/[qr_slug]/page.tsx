import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TablePage({ params }: { params: Promise<{ qr_slug: string }> }) {
  const { qr_slug } = await params
  const supabase = await createClient()

  const { data: table } = await supabase
    .from('tables')
    .select('menu_id, menus!inner(slug)')
    .eq('qr_slug', qr_slug)
    .single()

  if (!table?.menu_id) {
    redirect('/')
  }

  // Redirect to the menu page with table context
  redirect(`/m/${(table.menus as any).slug}?from=table`)
}
