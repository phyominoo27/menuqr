'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Plus, Trash2, Loader2, Save, GripVertical,
  ChevronDown, ChevronUp, Image as ImageIcon, Eye, EyeOff, Copy, Sparkles
} from 'lucide-react'
import type { Menu, MenuCategory, MenuItem } from '@/types'
import { formatPrice, generateSlug } from '@/lib/utils'
import { seedSampleData } from '@/app/actions/seed'

export default function EditMenuPage({ params }: { params: Promise<{ menu_id: string }> }) {
  const { menu_id } = require('react').use(params as any) as { menu_id: string }
  const router = useRouter()
  const supabase = createClient()

  const [menu, setMenu] = useState<Menu | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<Record<string, MenuItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [message, setMessage] = useState('')
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())

  const [newCatMy, setNewCatMy] = useState('')
  const [newCatEn, setNewCatEn] = useState('')
  const [newItem, setNewItem] = useState({
    name_my: '', name_en: '', desc_my: '', desc_en: '',
    price: '', currency: 'MMK' as 'MMK' | 'USD', image_url: ''
  })

  useEffect(() => {
    loadData()
  }, [menu_id])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: menuData } = await supabase
      .from('menus').select('*').eq('id', menu_id).eq('user_id', user.id).single()

    if (!menuData) { router.push('/menus'); return }
    setMenu(menuData)

    const { data: cats } = await supabase
      .from('menu_categories').select('*').eq('menu_id', menu_id).order('sort_order')
    setCategories(cats || [])
    setExpandedCats(new Set((cats || []).map((c: MenuCategory) => c.id)))

    if (cats) {
      const itemsByCat: Record<string, MenuItem[]> = {}
      for (const cat of cats) {
        const { data: catItems } = await supabase
          .from('menu_items').select('*').eq('category_id', cat.id).order('sort_order')
        itemsByCat[cat.id] = catItems || []
      }
      setItems(itemsByCat)
    }

    setLoading(false)
  }

  const addCategory = async () => {
    if (!newCatMy.trim() || !newCatEn.trim()) return
    const { data, error } = await supabase
      .from('menu_categories')
      .insert({ menu_id, name_my: newCatMy.trim(), name_en: newCatEn.trim(), sort_order: categories.length })
      .select().single()
    if (!error && data) {
      setCategories([...categories, data])
      setItems({ ...items, [data.id]: [] })
      setExpandedCats(new Set([...Array.from(expandedCats), data.id]))
      setNewCatMy('')
      setNewCatEn('')
    }
  }

  const deleteCategory = async (catId: string) => {
    if (!confirm('Delete this category and all its items?')) return
    await supabase.from('menu_categories').delete().eq('id', catId)
    setCategories(categories.filter(c => c.id !== catId))
    const newItems = { ...items }
    delete newItems[catId]
    setItems(newItems)
  }

  const addItem = async (catId: string) => {
    if (!newItem.name_my.trim() || !newItem.price) return
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        category_id: catId,
        name_my: newItem.name_my.trim(),
        name_en: newItem.name_en.trim() || newItem.name_my.trim(),
        description_my: newItem.desc_my.trim() || null,
        description_en: newItem.desc_en.trim() || null,
        price: parseFloat(newItem.price),
        currency: newItem.currency,
        image_url: newItem.image_url.trim() || null,
        sort_order: (items[catId] || []).length,
      })
      .select().single()
    if (!error && data) {
      setItems({ ...items, [catId]: [...(items[catId] || []), data] })
      setNewItem({ name_my: '', name_en: '', desc_my: '', desc_en: '', price: '', currency: 'MMK', image_url: '' })
    }
  }

  const toggleItemAvailability = async (item: MenuItem) => {
    const { data } = await supabase
      .from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id).select().single()
    if (data) {
      setItems({
        ...items,
        [item.category_id]: items[item.category_id].map(i => i.id === data.id ? data : i)
      })
    }
  }

  const deleteItem = async (item: MenuItem) => {
    if (!confirm('Delete this item?')) return
    await supabase.from('menu_items').delete().eq('id', item.id)
    setItems({
      ...items,
      [item.category_id]: items[item.category_id].filter(i => i.id !== item.id)
    })
  }

  const togglePublish = async () => {
    if (!menu) return
    const { data } = await supabase
      .from('menus').update({ is_published: !menu.is_published }).eq('id', menu_id).select().single()
    if (data) setMenu(data)
  }

  const saveMenu = async () => {
    setSaving(true)
    setMessage('')
    try {
      await supabase.from('menus').update({ name: menu?.name, slug: menu?.slug }).eq('id', menu_id)
      setMessage('Saved!')
      setTimeout(() => setMessage(''), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleSeedData = async () => {
    setSeeding(true)
    const result = await seedSampleData(menu_id)
    if (result?.error) {
      alert(result.error)
    } else {
      setMessage('Sample data added!')
      setTimeout(() => setMessage(''), 3000)
      loadData()
    }
    setSeeding(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={`/menus/${menu_id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex items-center gap-3">
          {message && <span className="text-green-600 font-medium text-sm">{message}</span>}
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all disabled:opacity-50 text-sm"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {seeding ? 'Adding...' : 'Add Sample Data'}
          </button>
          <button onClick={saveMenu} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={togglePublish}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition-all ${
              menu?.is_published
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : 'gradient-primary text-white hover:opacity-90'
            }`}
          >
            {menu?.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {menu?.is_published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Menu URL */}
      <div className="bg-white rounded-2xl card-shadow p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">Public Menu URL</p>
          <code className="text-blue-600 font-mono">{baseUrl}/m/{menu?.slug}</code>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(`${baseUrl}/m/${menu?.slug}`)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Categories + Items */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl card-shadow overflow-hidden">
            {/* Category Header */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => {
                  const next = new Set(Array.from(expandedCats))
                  next.has(cat.id) ? next.delete(cat.id) : next.add(cat.id)
                  setExpandedCats(next)
                }}
                className="flex items-center gap-3 font-bold text-gray-900"
              >
                {expandedCats.has(cat.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                🇲🇲 {cat.name_my} · 🇬🇧 {cat.name_en}
              </button>
              <button onClick={() => deleteCategory(cat.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            {expandedCats.has(cat.id) && (
              <div className="p-6 space-y-3">
                {/* Existing items */}
                {(items[cat.id] || []).map((item) => (
                  <div key={item.id} className={`flex items-start gap-4 p-4 rounded-xl border border-gray-100 ${!item.is_available ? 'opacity-50' : ''}`}>
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name_my} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{item.name_my}</p>
                          {item.name_en !== item.name_my && <p className="text-sm text-gray-500">{item.name_en}</p>}
                        </div>
                        <p className="font-bold text-blue-600 shrink-0">{formatPrice(item.price, item.currency)}</p>
                      </div>
                      {item.description_my && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.description_my}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleItemAvailability(item)}
                        className={`p-2 rounded-lg text-xs font-medium ${item.is_available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}
                        title={item.is_available ? 'Available' : 'Unavailable'}
                      >
                        {item.is_available ? '✓' : '✗'}
                      </button>
                      <button onClick={() => deleteItem(item)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add new item */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Add Item</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Name (Burmese) *" value={newItem.name_my} onChange={e => setNewItem({...newItem, name_my: e.target.value})} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                    <input placeholder="Name (English)" value={newItem.name_en} onChange={e => setNewItem({...newItem, name_en: e.target.value})} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <input placeholder="Description (Burmese)" value={newItem.desc_my} onChange={e => setNewItem({...newItem, desc_my: e.target.value})} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                    <input placeholder="Description (English)" value={newItem.desc_en} onChange={e => setNewItem({...newItem, desc_en: e.target.value})} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <input type="number" placeholder="Price *" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                    <select value={newItem.currency} onChange={e => setNewItem({...newItem, currency: e.target.value as 'MMK' | 'USD'})} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm">
                      <option value="MMK">MMK</option>
                      <option value="USD">USD</option>
                    </select>
                    <button onClick={() => addItem(cat.id)} disabled={!newItem.name_my.trim() || !newItem.price} className="gradient-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center gap-2 text-sm">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Category */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <p className="font-bold text-gray-900 mb-4">Add Category</p>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="text-xs text-gray-500 mb-1 block">🇲🇲 Burmese Name *</label>
              <input value={newCatMy} onChange={e => setNewCatMy(e.target.value)} placeholder="e.g. အစားအသောက်" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" />
            </div>
            <div className="flex-1 min-w-48">
              <label className="text-xs text-gray-500 mb-1 block">🇬🇧 English Name *</label>
              <input value={newCatEn} onChange={e => setNewCatEn(e.target.value)} placeholder="e.g. Main Dishes" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" />
            </div>
            <button onClick={addCategory} disabled={!newCatMy.trim() || !newCatEn.trim()} className="gradient-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
