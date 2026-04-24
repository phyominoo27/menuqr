'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, QrCode, Trash2, Copy, Download } from 'lucide-react'
import QRCodeLib from 'qrcode'

export default function TablesPage() {
  const supabase = createClient()
  const [tables, setTables] = useState<any[]>([])
  const [menus, setMenus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newLabel, setNewLabel] = useState('')
  const [newMenuId, setNewMenuId] = useState('')
  const [adding, setAdding] = useState(false)
  const [qrModal, setQrModal] = useState<any>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: tablesData }, { data: menusData }] = await Promise.all([
      supabase.from('tables').select('*').eq('restaurant_id', user.id).order('created_at', { ascending: false }),
      supabase.from('menus').select('id, name, slug').eq('user_id', user.id).order('name'),
    ])

    setTables(tablesData || [])
    setMenus(menusData || [])
    if (menusData?.length && !newMenuId) setNewMenuId(menusData[0].id)
    setLoading(false)
  }

  const addTable = async () => {
    if (!newLabel.trim() || !newMenuId) return
    setAdding(true)

    const qrSlug = Math.random().toString(36).substring(2, 10)

    const { data, error } = await supabase
      .from('tables')
      .insert({ restaurant_id: (await supabase.auth.getUser()).data.user?.id, label: newLabel.trim(), menu_id: newMenuId, qr_slug: qrSlug })
      .select().single()

    if (!error && data) {
      setTables([data, ...tables])
      setNewLabel('')
    }
    setAdding(false)
  }

  const deleteTable = async (id: string) => {
    if (!confirm('Delete this table QR?')) return
    await supabase.from('tables').delete().eq('id', id)
    setTables(tables.filter(t => t.id !== id))
  }

  const openQrModal = async (table: any) => {
    setQrModal(table)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'
    const url = `${baseUrl}/t/${table.qr_slug}`
    const dataUrl = await QRCodeLib.toDataURL(url, { width: 400, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } })
    setQrDataUrl(dataUrl)
  }

  const downloadQr = (table: any) => {
    const link = document.createElement('a')
    link.download = `qr-${table.label.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = qrDataUrl
    link.click()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Table QR Codes</h1>
        <p className="text-gray-500 mt-1">Generate unique QR codes for each table</p>
      </div>

      {/* Add Table */}
      <div className="bg-white rounded-2xl card-shadow p-6">
        <p className="font-bold text-gray-900 mb-4">Add New Table</p>
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-48">
            <label className="text-xs text-gray-500 mb-1 block">Table Label</label>
            <input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="e.g. Table 1, Bar Seat 3, VIP Room"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="text-xs text-gray-500 mb-1 block">Menu</label>
            <select
              value={newMenuId}
              onChange={e => setNewMenuId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
            >
              {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <button
            onClick={addTable}
            disabled={!newLabel.trim() || adding}
            className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center gap-2"
          >
            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Add Table
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      {tables.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tables.map(table => (
            <div key={table.id} className="bg-white rounded-2xl card-shadow p-5 flex items-center gap-4">
              <button onClick={() => openQrModal(table)} className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0">
                <QrCode className="w-8 h-8 text-gray-400" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{table.label}</p>
                <code className="text-xs text-gray-400">{baseUrl}/t/{table.qr_slug}</code>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openQrModal(table)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View QR">
                  <QrCode className="w-5 h-5" />
                </button>
                <button onClick={() => deleteTable(table.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2">No table QR codes yet</h3>
          <p className="text-gray-400 max-w-sm mx-auto">Create table-specific QR codes so customers can quickly access the right menu.</p>
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setQrModal(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl text-gray-900 mb-2">{qrModal.label}</h3>
            <p className="text-gray-400 text-sm mb-6">Scan to see menu</p>
            {qrDataUrl && (
              <>
                <img src={qrDataUrl} alt="QR Code" className="w-64 h-64 mx-auto rounded-2xl" />
                <div className="mt-6 flex items-center gap-3 justify-center">
                  <button onClick={() => downloadQr(qrModal)} className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download PNG
                  </button>
                </div>
              </>
            )}
            <button onClick={() => setQrModal(null)} className="mt-4 text-gray-400 hover:text-gray-600 text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
