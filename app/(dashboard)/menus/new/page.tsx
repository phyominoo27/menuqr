'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Check } from 'lucide-react'
import { generateSlug } from '@/lib/utils'

export default function NewMenuPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [autoSlug, setAutoSlug] = useState(true)

  const handleNameChange = (value: string) => {
    setName(value)
    if (autoSlug) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const finalSlug = slug || generateSlug(name)

    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .insert({ user_id: user.id, name, slug: finalSlug })
      .select()
      .single()

    if (menuError) {
      if (menuError.message.includes('unique') || menuError.code === '23505') {
        setError('This URL is already taken. Please choose a different one.')
      } else {
        setError(menuError.message)
      }
      setLoading(false)
      return
    }

    router.push(`/menus/${menu.id}/edit`)
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/menus"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menus
      </Link>

      <div className="bg-white rounded-2xl card-shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Menu</h1>
        <p className="text-gray-500 mb-8">Give your menu a name and a unique URL</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700">
              Menu Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Main Menu, Drinks, Desserts..."
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-lg"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-semibold text-gray-700">
              Menu URL
            </label>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 shrink-0">/m/</span>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setAutoSlug(false) }}
                placeholder="main-menu"
                required
                pattern="[a-z0-9-]+"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
              />
            </div>
            <p className="text-xs text-gray-400">
              Customers will visit this URL to see your menu
            </p>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={loading || !name}
              className="gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              Create Menu
            </button>
            <Link href="/menus" className="text-gray-500 hover:text-gray-700 font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
