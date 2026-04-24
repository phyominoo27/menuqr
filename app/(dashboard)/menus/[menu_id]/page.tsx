import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Menu, Layers, Edit, QrCode, ArrowLeft, ExternalLink, Eye } from 'lucide-react'

export default async function MenuViewPage({ params }: { params: Promise<{ menu_id: string }> }) {
  const { menu_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: menu } = await supabase
    .from('menus')
    .select('*')
    .eq('id', menu_id)
    .eq('user_id', user?.id)
    .single()

  if (!menu) notFound()

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('id, name_my, name_en')
    .eq('menu_id', menu_id)
    .order('sort_order')

  const { data: tables } = await supabase
    .from('tables')
    .select('id, label, qr_slug')
    .eq('menu_id', menu_id)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/menus"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menus
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl card-shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{menu.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                menu.is_published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {menu.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <code className="text-sm text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg font-mono">
              {baseUrl}/m/{menu.slug}
            </code>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/m/${menu.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
            <Link
              href={`/menus/${menu.id}/edit`}
              className="gradient-primary text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Menu
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Categories', value: categories?.length ?? 0, icon: Layers },
          { label: 'Table QR Codes', value: tables?.length ?? 0, icon: QrCode },
          { label: 'Menu URL', value: '1', icon: Menu },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-4 card-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl card-shadow">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Categories</h2>
        </div>
        <div className="p-6">
          {categories && categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span key={cat.id} className="px-4 py-2 bg-gray-50 rounded-xl text-sm font-medium text-gray-700">
                  🇲🇲 {cat.name_my} · 🇬🇧 {cat.name_en}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No categories yet</p>
          )}
          <div className="mt-4 pt-4 border-t border-gray-50">
            <Link
              href={`/menus/${menu.id}/edit`}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              + Add categories and items
            </Link>
          </div>
        </div>
      </div>

      {/* Table QR Codes */}
      <div className="bg-white rounded-2xl card-shadow">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Table QR Codes</h2>
          <Link
            href="/tables"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Manage Tables
          </Link>
        </div>
        <div className="p-6">
          {tables && tables.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tables.map((table) => (
                <div key={table.id} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="font-semibold text-gray-900 text-sm">{table.label}</p>
                  <code className="text-xs text-gray-400">{table.qr_slug}</code>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No table QR codes yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
