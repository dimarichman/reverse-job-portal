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
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [view, setView] = useState<'overview' | 'profile' | 'requests' | 'admin' | 'notifications'>('overview')
  const [requests, setRequests] = useState<any[]>([])
  const [candidateRequests, setCandidateRequests] = useState<any[]>([])
  const [adminRequests, setAdminRequests] = useState<any[]>([])
  const [adminViews, setAdminViews] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const [filterExp, setFilterExp] = useState('')
  const [filterSalary, setFilterSalary] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [filterJob, setFilterJob] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('')

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

  // Recruiter fields
  const [companyName, setCompanyName] = useState('')
  const [searchingFor, setSearchingFor] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const isAdmin = user?.email?.toLowerCase() === 'dimarachmann@aol.com'

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const u = data.session?.user ?? null
        setUser(u)
        if (u) {
          await loadCandidates()
          await loadNotifications(u.id)
          if ((u.user_metadata?.role || 'candidate') === 'candidate') {
            await loadProfile(u.id)
            await loadCandidateRequests(u.id)
          }
          if ((u.user_metadata?.role || 'candidate') === 'recruiter') {
            await loadMyRequests(u.id)
            await loadRecruiterProfile(u.id)
          }
          if (u.email?.toLowerCase() === 'dimarachmann@aol.com') {
            await loadAdminRequests()
            await loadAdminViews()
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
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        await loadCandidates()
        await loadNotifications(u.id)
        if ((u.user_metadata?.role || 'candidate') === 'candidate') {
          await loadProfile(u.id)
          await loadCandidateRequests(u.id)
        }
        if ((u.user_metadata?.role || 'candidate') === 'recruiter') {
          await loadMyRequests(u.id)
          await loadRecruiterProfile(u.id)
        }
        if (u.email?.toLowerCase() === 'dimarachmann@aol.com') {
          await loadAdminRequests()
          await loadAdminViews()
        }
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadNotifications(userId: string) {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30)
    setNotifications(data || [])
    setUnreadCount((data || []).filter(n => !n.read).length)
  }

  async function markAllRead() {
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    await loadNotifications(user.id)
  }

  async function loadCandidates() {
    const { data } = await supabase.from('candidates').select('*').order('created_at', { ascending: false }).limit(50)
    setCandidates(data || [])
  }

  async function loadRecruiterProfile(userId: string) {
    const { data } = await supabase.from('recruiter_profiles').select('*').eq('user_id', userId).maybeSingle()
    if (data) {
      setRecruiterProfile(data)
      setCompanyName(data.company_name || '')
      setSearchingFor(data.searching_for || '')
      setLogoUrl(data.logo_url || '')
    }
  }

  async function saveRecruiterProfile() {
    if (!user) return
    setSaving(true)
    setMsg('')
    const payload = {
      user_id: user.id,
      company_name: companyName || null,
      searching_for: searchingFor || null,
      logo_url: logoUrl || null,
      updated_at: new Date().toISOString(),
    }
    try {
      if (recruiterProfile) {
        await supabase.from('recruiter_profiles').update(payload).eq('id', recruiterProfile.id)
      } else {
        const { data } = await supabase.from('recruiter_profiles').insert(payload).select().single()
        setRecruiterProfile(data)
      }
      setMsg('Firmenprofil gespeichert!')
    } catch (e: any) {
      setMsg('Fehler: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingLogo(true)
    setMsg('')
    try {
      const ext = file.name.split('.').pop()
      const path = `logos/${user.id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('profiles').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('profiles').getPublicUrl(path)
      setLogoUrl(data.publicUrl)
      setMsg('Logo hochgeladen')
    } catch (err: any) {
      setMsg('Logo-Fehler: ' + err.message)
    } finally {
      setUploadingLogo(false)
    }
  }

  async function logView(candidateId: string) {
    if (!user || (user.user_metadata?.role || 'candidate') !== 'recruiter') return
    try {
      await supabase.from('candidate_views').insert({
        recruiter_id: user.id,
        candidate_id: candidateId
      })
    } catch {}
  }

  async function loadMyRequests(userId: string) {
    const { data } = await supabase.from('contact_requests').select('*').eq('recruiter_id', userId).order('created_at', { ascending: false })
    setRequests(data || [])
  }

  async function loadCandidateRequests(userId: string) {
    const { data: cand } = await supabase.from('candidates').select('id').eq('user_id', userId).maybeSingle()
    if (!cand) return
    const { data } = await supabase.from('contact_requests').select('*').eq('candidate_id', cand.id).order('created_at', { ascending: false })
    setCandidateRequests(data || [])
  }

  async function loadAdminRequests() {
    const { data } = await supabase.from('contact_requests').select('*').order('created_at', { ascending: false })
    setAdminRequests(data || [])
  }

  async function loadAdminViews() {
    const { data } = await supabase.from('candidate_views').select('*').order('viewed_at', { ascending: false }).limit(100)
    setAdminViews(data || [])
  }

  async function updateRequestStatus(id: string, status: string) {
    const { data: req } = await supabase.from('contact_requests').select('*').eq('id', id).single()
    await supabase.from('contact_requests').update({ status }).eq('id', id)

    if (req) {
      const title = status === 'approved' ? 'Anfrage freigegeben' : 'Anfrage abgelehnt'
      const message = status === 'approved' ? 'Deine Anfrage wurde freigegeben.' : 'Deine Anfrage wurde abgelehnt.'

      await supabase.from('notifications').insert({
        user_id: req.recruiter_id,
        title,
        message
      })

      if (status === 'approved') {
        const { data: cand } = await supabase.from('candidates').select('user_id').eq('id', req.candidate_id).maybeSingle()
        if (cand?.user_id) {
          await supabase.from('notifications').insert({
            user_id: cand.user_id,
            title: 'Neue Kontaktanfrage freigegeben',
            message: 'Eine Firma möchte Kontakt mit dir aufnehmen.'
          })
        }
      }
    }

    await loadAdminRequests()
    if (user) await loadNotifications(user.id)
  }

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('candidates').select('*').eq('user_id', userId).maybeSingle()
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

  async function requestContact(candidateId: string) {
    if (!user) return
    await logView(candidateId)
    const message = window.prompt('Kurze Nachricht (optional):') || ''
    const { error } = await supabase.from('contact_requests').insert({
      recruiter_id: user.id,
      candidate_id: candidateId,
      message,
      status: 'pending'
    })
    if (error) alert('Fehler: ' + error.message)
    else {
      alert('Anfrage gesendet.')
      await loadMyRequests(user.id)
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
    try {
      const path = `cvs/${user.id}-${Date.now()}.pdf`
      const { error: upErr } = await supabase.storage.from('profiles').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('profiles').getPublicUrl(path)
      setCvUrl(data.publicUrl)
      setMsg('CV hochgeladen')
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
    setRecruiterProfile(null)
    setRequests([])
    setCandidateRequests([])
    setAdminRequests([])
    setAdminViews([])
    setNotifications([])
    setUnreadCount(0)
  }

  const filtered = candidates.filter(c => {
    if (filterExp && (c.experience_years || 0) < parseInt(filterExp)) return false
    if (filterSalary && (c.salary_desired_k || 999) > parseInt(filterSalary)) return false
    if (filterLocation && !c.location?.toLowerCase().includes(filterLocation.toLowerCase())) return false
    if (filterSkill && !c.skills?.some((s: string) => s.toLowerCase().includes(filterSkill.toLowerCase()))) return false
    if (filterJob && !c.title?.toLowerCase().includes(filterJob.toLowerCase())) return false
    if (filterIndustry && !c.industries?.some((i: string) => i.toLowerCase().includes(filterIndustry.toLowerCase()))) return false
    return true
  })

  if (loading) return <div className="p-8 text-center text-gray-500">Lade...</div>

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">Job Heroes</h1>
        <p className="text-center text-gray-500 mb-6">Firmen suchen dich – nicht umgekehrt</p>
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
          <button onClick={() => { setView('notifications'); markAllRead() }} className="relative p-2 text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
            )}
          </button>
          <span className="text-sm text-gray-600">{user.email} · {isRecruiter ? 'Recruiter' : 'Kandidat'}{isAdmin ? ' · Admin' : ''}</span>
          <button onClick={signOut} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">Abmelden</button>
        </div>
      </header>

      <nav className="flex gap-2 mb-8 flex-wrap">
        <button onClick={() => setView('overview')} className={`px-5 py-2 rounded-xl text-sm font-medium transition ${view === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Übersicht</button>
        <button onClick={() => setView('profile')} className={`px-5 py-2 rounded-xl text-sm font-medium transition ${view === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{isRecruiter ? 'Firmenprofil' : 'Mein Profil'}</button>
        {!isRecruiter && (
          <button onClick={() => setView('requests')} className={`px-5 py-2 rounded-xl text-sm font-medium transition ${view === 'requests' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Anfragen</button>
        )}
        {isRecruiter && (
          <button onClick={() => setView('requests')} className={`px-5 py-2 rounded-xl text-sm font-medium transition ${view === 'requests' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Meine Anfragen</button>
        )}
        {isAdmin && (
          <button onClick={() => setView('admin')} className={`px-5 py-2 rounded-xl text-sm font-medium transition ${view === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Admin</button>
        )}
      </nav>

      {view === 'notifications' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Benachrichtigungen</h2>
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className={`p-4 rounded-xl border ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-gray-500">Keine Benachrichtigungen.</p>}
          </div>
        </div>
      )}

      {view === 'admin' && isAdmin && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Kontaktanfragen</h2>
            <div className="space-y-4">
              {adminRequests.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border shadow-sm">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="font-semibold">Anfrage {r.id.slice(0, 8)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{r.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{r.message || '(keine Nachricht)'}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="mt-4 flex gap-2 justify-end">
                      <button onClick={() => updateRequestStatus(r.id, 'approved')} className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg">Freigeben</button>
                      <button onClick={() => updateRequestStatus(r.id, 'rejected')} className="bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg">Ablehnen</button>
                    </div>
                  )}
                </div>
              ))}
              {adminRequests.length === 0 && <p className="text-gray-500">Keine Anfragen.</p>}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Profil-Ansichten</h2>
            <div className="space-y-2">
              {adminViews.map(v => (
                <div key={v.id} className="bg-white p-3 rounded-lg border text-sm flex justify-between">
                  <span>Ansicht {v.id.slice(0, 8)}</span>
                  <span className="text-gray-400">{new Date(v.viewed_at).toLocaleString()}</span>
                </div>
              ))}
              {adminViews.length === 0 && <p className="text-gray-500">Noch keine Ansichten.</p>}
            </div>
          </div>
        </div>
      )}

      {view === 'requests' && !isRecruiter && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Anfragen an dich</h2>
          <div className="space-y-4">
            {candidateRequests.map(r => (
              <div key={r.id} className="bg-white p-5 rounded-2xl border shadow-sm">
                <p className="font-semibold">Anfrage {r.id.slice(0, 8)}</p>
                <p className="mt-2 text-sm text-gray-700">{r.message || '(keine Nachricht)'}</p>
                <p className="text-xs mt-2">Status: <span className={r.status === 'approved' ? 'text-green-600 font-medium' : r.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}>{r.status}</span></p>
                <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleString()}</p>
              </div>
            ))}
            {candidateRequests.length === 0 && <p className="text-gray-500">Noch keine Anfragen an dich.</p>}
          </div>
        </div>
      )}

      {view === 'requests' && isRecruiter && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Meine Anfragen</h2>
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="bg-white p-4 rounded-xl border">
                <p className="font-medium">Anfrage {r.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-600 mt-1">{r.message || '(keine Nachricht)'}</p>
                <p className="text-xs mt-2">Status: <span className={r.status === 'approved' ? 'text-green-600' : r.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}>{r.status}</span></p>
              </div>
            ))}
            {requests.length === 0 && <p className="text-gray-500">Noch keine Anfragen.</p>}
          </div>
        </div>
      )}

      {view === 'overview' && (
        <>
          <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input placeholder="Job / Titel" value={filterJob} onChange={e => setFilterJob(e.target.value)} className="p-2 border rounded-lg text-sm" />
              <input placeholder="Branche" value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)} className="p-2 border rounded-lg text-sm" />
              <input placeholder="Skill" value={filterSkill} onChange={e => setFilterSkill(e.target.value)} className="p-2 border rounded-lg text-sm" />
              <input placeholder="Min. Erfahrung (Jahre)" value={filterExp} onChange={e => setFilterExp(e.target.value)} className="p-2 border rounded-lg text-sm" />
              <input placeholder="Max. Gehalt (k€)" value={filterSalary} onChange={e => setFilterSalary(e.target.value)} className="p-2 border rounded-lg text-sm" />
              <input placeholder="Ort" value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="p-2 border rounded-lg text-sm" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Kandidaten ({filtered.length})</h2>
          <div className="space-y-4">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow" onMouseEnter={() => logView(c.id)}>
                <div className="p-6 flex gap-5">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm flex-shrink-0">Foto</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900">{c.full_name || 'Unbekannt'}</h3>
                    <p className="text-gray-600 mt-0.5">{c.title || 'Kein Titel'} · {c.location || 'Kein Ort'}</p>
                    {c.experience_years != null && (
                      <p className="text-sm text-gray-500 mt-1">{c.experience_years} Jahre Berufserfahrung</p>
                    )}
                    {c.salary_desired_k && (
                      <p className="text-sm font-medium text-gray-800 mt-1">{c.salary_desired_k}k € {c.salary_negotiable ? '(verhandelbar)' : ''}</p>
                    )}
                    {c.bio && <p className="mt-3 text-gray-700 text-sm leading-relaxed line-clamp-2">{c.bio}</p>}
                    {(c.skills?.length > 0 || c.industries?.length > 0) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.skills?.map((s: string) => (
                          <span key={s} className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{s}</span>
                        ))}
                        {c.industries?.map((i: string) => (
                          <span key={i} className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">{i}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-3">
                      {c.cv_url && (
                        <a href={c.cv_url} target="_blank" className="text-blue-600 text-sm font-medium hover:underline" onClick={() => logView(c.id)}>
                          Lebenslauf (PDF) →
                        </a>
                      )}
                      {isRecruiter && (
                        <button
                          onClick={() => requestContact(c.id)}
                          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium"
                        >
                          Kandidat anfragen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-gray-500">Keine Kandidaten gefunden.</p>}
          </div>
        </>
      )}

      {view === 'profile' && isRecruiter && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Firmenprofil</h2>
          {msg && <div className={`p-3 rounded-lg mb-6 text-sm ${msg.includes('Fehler') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}

          <div className="flex items-center gap-6 mb-8">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-28 h-28 rounded-2xl object-cover border border-gray-200" />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">Logo</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firmenlogo</label>
              <input type="file" accept="image/*" onChange={uploadLogo} disabled={uploadingLogo} className="text-sm text-gray-600" />
              {uploadingLogo && <p className="text-xs text-gray-500 mt-1">Lade hoch...</p>}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firmenname</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" placeholder="z.B. allO Technology GmbH" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wen sucht ihr aktuell?</label>
              <textarea value={searchingFor} onChange={e => setSearchingFor(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" rows={4} placeholder="z.B. Senior Sales Manager für DACH, Full-Stack Entwickler..." />
            </div>
            <button onClick={saveRecruiterProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 transition">
              {saving ? 'Speichere...' : 'Firmenprofil speichern'}
            </button>
          </div>
        </div>
      )}

      {view === 'profile' && !isRecruiter && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Mein Profil</h2>
          {msg && <div className={`p-3 rounded-lg mb-6 text-sm ${msg.includes('Fehler') || msg.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}

          <div className="flex items-center gap-6 mb-8">
            {photoUrl ? (
              <img src={photoUrl} alt="Profil" className="w-28 h-28 rounded-2xl object-cover border border-gray-200" />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">Foto</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profilbild</label>
              <input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploadingPhoto} className="text-sm text-gray-600" />
              {uploadingPhoto && <p className="text-xs text-gray-500 mt-1">Lade hoch...</p>}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lebenslauf (PDF)</label>
            <input type="file" accept="application/pdf" onChange={uploadCv} disabled={uploadingCv} className="text-sm text-gray-600" />
            {uploadingCv && <p className="text-xs text-gray-500 mt-1">Lade CV hoch...</p>}
            {cvUrl && (
              <div className="mt-2 flex items-center gap-4">
                <a href={cvUrl} target="_blank" className="text-blue-600 underline text-sm">Aktueller CV ansehen</a>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm('CV wirklich löschen?')) return
                    setCvUrl('')
                    setMsg('CV entfernt (bitte Profil speichern)')
                  }}
                  className="text-red-600 text-sm underline"
                >
                  Löschen
                </button>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vollständiger Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gesuchter Job</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" placeholder="z.B. Senior Frontend Entwickler" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
              <input value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" placeholder="Hamburg, Remote..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jahre Berufserfahrung</label>
                <input type="number" value={experience} onChange={e => setExperience(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verfügbar ab</label>
                <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wunschgehalt (in 1.000 €)</label>
                <input type="number" value={salary} onChange={e => setSalary(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" placeholder="75" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)} className="rounded" />
                  <span className="text-sm text-gray-700">verhandelbar</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aktueller Arbeitgeber</label>
              <input value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={employed} onChange={e => setEmployed(e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-700">Ich bin aktuell noch im Job</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (kommagetrennt)</label>
              <input value={skills} onChange={e => setSkills(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" placeholder="React, TypeScript, Sales..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branchen (kommagetrennt)</label>
              <input value={industries} onChange={e => setIndustries(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" placeholder="IT, SaaS, Hospitality..." />
            </div>
            <button onClick={saveProfile} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 transition">
              {saving ? 'Speichere...' : 'Profil speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
