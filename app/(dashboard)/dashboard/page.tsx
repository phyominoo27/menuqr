import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Menu, Layers, QrCode, ArrowRight, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: menus } = await supabase
    .from('menus')
    .select('id, name, slug, is_published, created_at')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const { data: tables } = await supabase
    .from('tables')
    .select('id')
    .eq('restaurant_id', user?.id)

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant menus</p>
        </div>
        <Link
          href="/menus/new"
          className="gradient-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Menu
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Menus', value: menus?.length ?? 0, icon: Menu, color: 'from-blue-500 to-blue-600' },
          { label: 'QR Codes Generated', value: tables?.length ?? 0, icon: QrCode, color: 'from-purple-500 to-purple-600' },
          { label: 'Published', value: menus?.filter(m => m.is_published).length ?? 0, icon: Layers, color: 'from-green-500 to-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-6 card-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-gray-500 text-sm">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Menus */}
      <div className="bg-white rounded-2xl card-shadow">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Menus</h2>
          <Link href="/menus" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-6">
          {menus && menus.length > 0 ? (
            <div className="space-y-3">
              {menus.slice(0, 5).map((menu) => (
                <Link
                  key={menu.id}
                  href={`/menus/${menu.id}`}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Menu className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{menu.name}</p>
                      <p className="text-sm text-gray-400">/{menu.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      menu.is_published
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {menu.is_published ? 'Published' : 'Draft'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Menu className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">No menus yet</h3>
              <p className="text-gray-400 text-sm mb-4">Create your first menu to get started</p>
              <Link
                href="/menus/new"
                className="gradient-primary text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Menu
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
