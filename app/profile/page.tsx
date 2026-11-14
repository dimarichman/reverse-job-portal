'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [form, setForm] = useState({
    full_name: '',
    title: '',
    bio: '',
    skills: '',
    location: '',
    experience_years: '',
  })
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Speichere...')

    // Für MVP: ohne Auth erstmal direkt einfügen (später mit user_id)
    // Hinweis: RLS muss ggf. angepasst werden oder Test-Daten manuell anlegen
    const { error } = await supabase.from('candidates').insert({
      full_name: form.full_name,
      title: form.title || null,
      bio: form.bio || null,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      location: form.location || null,
      experience_years: form.experience_years ? parseInt(form.experience_years) : null,
    })

    if (error) {
      setMessage('Fehler: ' + error.message)
    } else {
      setMessage('Profil erfolgreich angelegt!')
      setForm({ full_name: '', title: '', bio: '', skills: '', location: '', experience_years: '' })
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Kandidaten-Profil anlegen</h1>
      <p className="mb-4 text-sm text-gray-600">
        Hinweis: Für den Start ohne Login. Später kommt Auth dazu.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Vollständiger Name *"
          value={form.full_name}
          onChange={e => setForm({ ...form, full_name: e.target.value })}
          className="w-full p-3 border rounded"
        />
        <input
          placeholder="Titel (z.B. Senior React Entwickler)"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full p-3 border rounded"
        />
        <textarea
          placeholder="Kurze Bio / Beschreibung"
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
          className="w-full p-3 border rounded h-24"
        />
        <input
          placeholder="Skills (kommagetrennt, z.B. React, TypeScript, Node.js)"
          value={form.skills}
          onChange={e => setForm({ ...form, skills: e.target.value })}
          className="w-full p-3 border rounded"
        />
        <input
          placeholder="Standort (z.B. Hamburg)"
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
          className="w-full p-3 border rounded"
        />
        <input
          type="number"
          placeholder="Jahre Erfahrung"
          value={form.experience_years}
          onChange={e => setForm({ ...form, experience_years: e.target.value })}
          className="w-full p-3 border rounded"
        />

        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
          Profil speichern
        </button>
      </form>

      {message && <p className="mt-4 font-medium">{message}</p>}
    </div>
  )
}
