'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Globe, MapPin } from 'lucide-react'
import type { Menu, MenuCategory, Language } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function MenuViewer({
  menu,
  categories,
  initialLang = 'my',
}: {
  menu: Menu
  categories: (MenuCategory & { items: any[] })[]
  initialLang?: Language
}) {
  const [lang, setLang] = useState<Language>(initialLang)

  const langLabel = lang === 'my' ? '🇲🇲 မြန်မာ' : '🇬🇧 English'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{menu.name}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{categories.length} categories</p>
            </div>
            <button
              onClick={() => setLang(l => l === 'my' ? 'en' : 'my')}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <Globe className="w-4 h-4" />
              {langLabel}
            </button>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="bg-white border-b border-gray-100 sticky top-[72px] z-10 overflow-x-auto">
          <div className="max-w-lg mx-auto px-4 flex gap-2 py-3 scrollbar-hide">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className="shrink-0 px-4 py-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-sm font-medium transition-colors whitespace-nowrap"
              >
                {lang === 'my' ? cat.name_my : cat.name_en}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 pb-24">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
          {categories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-32">
              {/* Category Title */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {lang === 'my' ? cat.name_my : cat.name_en}
                </h2>
                {cat.name_my !== cat.name_en && (
                  <p className="text-sm text-gray-400">{lang === 'my' ? cat.name_en : cat.name_my}</p>
                )}
              </div>

              {/* Items */}
              <div className="space-y-3">
                {cat.items.map((item: any) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl overflow-hidden card-shadow transition-all ${!item.is_available ? 'opacity-50' : ''}`}
                  >
                    {item.image_url && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={item.image_url}
                          alt={lang === 'my' ? item.name_my : item.name_en}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="p-4 flex gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-900">
                            {lang === 'my' ? item.name_my : item.name_en}
                          </h3>
                          <span className="font-bold text-blue-600 shrink-0">
                            {formatPrice(item.price, item.currency)}
                          </span>
                        </div>
                          {(lang === 'my' ? item.description_my : item.description_en) && (
                            <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                              {lang === 'my' ? item.description_my : item.description_en}
                            </p>
                          )}
                        {!item.is_available && (
                          <span className="inline-block mt-2 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                            Currently unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {categories.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400">This menu is empty.</p>
            </div>
          )}
        </div>
      </main>

      {/* Powered by footer */}
      <footer className="bg-white border-t border-gray-100 py-4 text-center">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="currentColor">
              <rect x="0" y="0" width="4" height="4" rx="0.5"/>
              <rect x="6" y="0" width="4" height="4" rx="0.5"/>
              <rect x="0" y="6" width="4" height="4" rx="0.5"/>
              <rect x="6" y="6" width="4" height="4" rx="0.5"/>
            </svg>
          </div>
          Powered by MenuQR
        </Link>
      </footer>
    </div>
  )
}
