'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setEmail(user.email || '')
    const { data } = await supabase.from('users').select('business_name').eq('id', user.id).single()
    if (data) setBusinessName(data.business_name || '')
    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    setMessage('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('users').update({ business_name: businessName }).eq('id', user.id)
    if (!error) {
      setMessage('Settings saved!')
      setTimeout(() => setMessage(''), 2000)
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your restaurant profile</p>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input type="email" value={email} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed" />
          <p className="text-xs text-gray-400">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Restaurant Name</label>
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="Your Restaurant Name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
          {message && <span className="text-green-600 font-medium text-sm">{message}</span>}
        </div>
      </div>
    </div>
  )
}
