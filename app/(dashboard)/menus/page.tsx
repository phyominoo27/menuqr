import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Menu, ArrowRight, ExternalLink, Copy } from 'lucide-react'

export default async function MenusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: menus } = await supabase
    .from('menus')
    .select('id, name, slug, is_published, created_at')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menus</h1>
          <p className="text-gray-500 mt-1">Create and manage your restaurant menus</p>
        </div>
        <Link
          href="/menus/new"
          className="gradient-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Menu
        </Link>
      </div>

      {menus && menus.length > 0 ? (
        <div className="grid gap-4">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white rounded-2xl card-shadow hover:card-shadow-hover transition-all">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Menu className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{menu.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-sm text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                        /m/{menu.slug}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'}/m/${menu.slug}`)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    menu.is_published
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {menu.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Link
                    href={`/menus/${menu.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1"
                  >
                    Manage <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Menu className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2">No menus yet</h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">
            Create your first menu with categories and items, then generate QR codes for your tables.
          </p>
          <Link
            href="/menus/new"
            className="gradient-primary text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Menu
          </Link>
        </div>
      )}
    </div>
  )
}
