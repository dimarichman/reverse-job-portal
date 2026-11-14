'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('candidate')
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<any[]>([])
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [view, setView] = useState<'overview' | 'profile'>('overview')

  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [availableFrom, setAvailableFrom] = useState('')
  const [salary, setSalary] = useState('')
  const [negotiable, setNegotiable] = useState(true)
  const [currentCompany, setCurrentCompany] = useState('')
  const [employed, setEmployed] = useState(false)
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  const [industries, setIndustries] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [cvUrl, setCvUrl] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setUser(data.session?.user ?? null)
        if (data.session) {
          await loadCandidates()
          if ((data.session.user.user_metadata?.role || 'candidate') === 'candidate') {
            await loadProfile(data.session.user.id)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    check()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null)
      if (session) {
        await loadCandidates()
        if ((session.user.user_metadata?.role || 'candidate') === 'candidate') {
          await loadProfile(session.user.id)
        }
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadCandidates() {
    const { data } = await supabase.from('candidates').select('*').order('created_at', { ascending: false }).limit(30)
    setCandidates(data || [])
  }

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('candidates').select('*').eq('user_id', userId).single()
    if (data) {
      setProfile(data)
      setFullName(data.full_name || '')
      setTitle(data.title || '')
      setLocation(data.location || '')
      setExperience(data.experience_years?.toString() || '')
      setAvailableFrom(data.available_from || '')
      setSalary(data.salary_desired_k?.toString() || '')
      setNegotiable(data.salary_negotiable !== false)
      setCurrentCompany(data.current_company || '')
      setEmployed(!!data.currently_employed)
      setBio(data.bio || '')
      setSkills((data.skills || []).join(', '))
      setIndustries((data.industries || []).join(', '))
      setPhotoUrl(data.photo_url || '')
      setCvUrl(data.cv_url || '')
    }
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingPhoto(true)
    setMsg('')
    try {
      const ext = file.name.split('.').pop()
      const path = `photos/${user.id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('profiles').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('profiles').getPublicUrl(path)
      setPhotoUrl(data.publicUrl)
      setMsg('Foto hochgeladen')
    } catch (err: any) {
      setMsg('Foto-Fehler: ' + err.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function uploadCv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingCv(true)
    setMsg('')
    let publicUrl = ''
    try {
      const path = `cvs/${user.id}-${Date.now()}.pdf`
      const { error: upErr } = await supabase.storage.from('profiles').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('profiles').getPublicUrl(path)
      publicUrl = data.publicUrl

      try {
        const session = (await supabase.auth.getSession()).data.session
        const checkRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/redact-cv`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          },
          body: JSON.stringify({ fileUrl: publicUrl, userId: user.id })
        })
        if (checkRes.ok) {
          const checkData = await checkRes.json()
          if (checkData.blocked) {
            await supabase.storage.from('profiles').remove([path])
            setMsg('❌ ' + (checkData.reason || 'Kontaktdaten gefunden'))
            e.target.value = ''
            return
          }
          setMsg('✅ CV ist sauber und wurde hochgeladen')
        } else {
          setMsg('CV hochgeladen (Validierung nicht verfügbar)')
        }
      } catch {
        setMsg('CV hochgeladen (Validierung übersprungen)')
      }

      setCvUrl(publicUrl)
    } catch (err: any) {
      setMsg('CV-Fehler: ' + err.message)
    } finally {
      setUploadingCv(false)
    }
  }

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    setMsg('')
    const payload = {
      user_id: user.id,
      full_name: fullName,
      title: title || null,
      location: location || null,
      experience_years: experience ? parseInt(experience) : null,
      available_from: availableFrom || null,
      salary_desired_k: salary ? parseInt(salary) : null,
      salary_negotiable: negotiable,
      current_company: currentCompany || null,
      currently_employed: employed,
      bio: bio || null,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      industries: industries.split(',').map(s => s.trim()).filter(Boolean),
      photo_url: photoUrl || null,
      cv_url: cvUrl || null,
    }
    try {
      if (profile) {
        await supabase.from('candidates').update(payload).eq('id', profile.id)
      } else {
        const { data } = await supabase.from('candidates').insert(payload).select().single()
        setProfile(data)
      }
      setMsg('Profil gespeichert!')
    } catch (e: any) {
      setMsg('Fehler: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role } }
        })
        if (error) throw error
        alert('Registriert! Du kannst dich jetzt anmelden.')
        setIsLogin(true)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setCandidates([])
    setProfile(null)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Lade...</div>

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">Job Heroes</h1>
        <p className="text-center text-gray-500 mb-6">Umgekehrtes Job-Portal</p>
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" required />
          <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" required />
          {!isLogin && (
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg">
              <option value="candidate">Ich bin Kandidat</option>
              <option value="recruiter">Ich bin Arbeitgeber / Recruiter</option>
            </select>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium">
            {isLogin ? 'Anmelden' : 'Registrieren'}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-gray-500">
          {isLogin ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
        </button>
      </div>
    )
  }

  const isRecruiter = (user.user_metadata?.role || 'candidate') === 'recruiter'

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Job Heroes</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email} · {isRecruiter ? 'Recruiter' : 'Kandidat'}</span>
          <button onClick={signOut} className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm">Abmelden</button>
        </div>
      </header>

      <nav className="flex gap-2 mb-6">
        <button
          onClick={() => setView('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Übersicht
        </button>
        {!isRecruiter && (
          <button
            onClick={() => setView('profile')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Mein Profil
          </button>
        )}
      </nav>

      {view === 'overview' || isRecruiter ? (
        <>
          <h2 className="text-2xl font-semibold mb-6">Kandidaten-Übersicht</h2>
          <div className="space-y-4">
            {candidates.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border flex gap-4">
                {c.photo_url && <img src={c.photo_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                <div>
                  <h3 className="text-xl font-semibold">{c.full_name || 'Unbekannt'}</h3>
                  <p className="text-gray-600">{c.title || ''} · {c.location || ''}</p>
                  {c.experience_years != null && <p className="text-sm text-gray-500">{c.experience_years} Jahre Berufserfahrung</p>}
                  {c.salary_desired_k && <p className="text-sm">Gehalt: {c.salary_desired_k}k € {c.salary_negotiable ? '(verhandelbar)' : ''}</p>}
                  {c.bio && <p className="mt-2 text-gray-700">{c.bio}</p>}
                  {c.cv_url && <p className="mt-2"><a href={c.cv_url} target="_blank" className="text-blue-600 text-sm underline">Lebenslauf (PDF)</a></p>}
                </div>
              </div>
            ))}
            {candidates.length === 0 && <p className="text-gray-500">Keine Kandidaten.</p>}
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-2xl">
          <h2 className="text-2xl font-semibold mb-6">Mein Profil</h2>
          {msg && <div className={`p-3 rounded mb-4 ${msg.includes('Fehler') || msg.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}

          <div className="flex items-center gap-6 mb-6">
            {photoUrl ? (
              <img src={photoUrl} alt="Profil" className="w-24 h-24 rounded-full object-cover border" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">Foto</div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Profilbild</label>
              <input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploadingPhoto} className="text-sm" />
              {uploadingPhoto && <p className="text-xs text-gray-500 mt-1">Lade hoch...</p>}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Lebenslauf (PDF)</label>
            <input type="file" accept="application/pdf" onChange={uploadCv} disabled={uploadingCv} className="text-sm" />
            {uploadingCv && <p className="text-xs text-gray-500 mt-1">Lade CV hoch...</p>}
            {cvUrl && <p className="text-sm mt-2"><a href={cvUrl} target="_blank" className="text-blue-600 underline">Aktueller CV ansehen</a></p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vollständiger Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gesuchter Job</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="z.B. Senior Frontend Entwickler" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ort</label>
              <input value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Hamburg, Remote..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Jahre Berufserfahrung</label>
                <input type="number" value={experience} onChange={e => setExperience(e.target.value)} className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Verfügbar ab</label>
                <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} className="w-full p-3 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Wunschgehalt (in 1.000 €)</label>
                <input type="number" value={salary} onChange={e => setSalary(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="75" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)} />
                  <span className="text-sm">verhandelbar</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Aktueller Arbeitgeber</label>
              <input value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} className="w-full p-3 border rounded-lg" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={employed} onChange={e => setEmployed(e.target.checked)} />
              <span className="text-sm">Ich bin aktuell noch im Job</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full p-3 border rounded-lg" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Skills (kommagetrennt)</label>
              <input value={skills} onChange={e => setSkills(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="React, TypeScript, Sales..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branchen (kommagetrennt)</label>
              <input value={industries} onChange={e => setIndustries(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="IT, SaaS, Hospitality..." />
            </div>
            <button onClick={saveProfile} disabled={saving} className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50">
              {saving ? 'Speichere...' : 'Profil speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
