'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AVAILABILITY_OPTIONS = [
  { value: 'sofort', label: 'Sofort' },
  { value: '2_wochen', label: 'Innerhalb von 2 Wochen' },
  { value: '1_monat', label: 'Innerhalb von 1 Monat' },
  { value: '3_monate', label: 'Innerhalb von 3 Monaten' },
  { value: 'datum', label: 'Ab bestimmtem Datum' },
]


const LANGUAGE_LEVELS = [
  { value: 'keine', label: 'Keine Kenntnisse' },
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
  { value: 'C1', label: 'C1' },
  { value: 'C2', label: 'C2' },
  { value: 'native', label: 'Muttersprache' },
]

const PROCESS_OPTIONS = [
  { value: 'open', label: 'Offen' },
  { value: 'in_process', label: 'Im Prozess' },
  { value: 'hired', label: 'Eingestellt' },
  { value: 'rejected', label: 'Abgelehnt' },
]

const ONBOARDING_STEPS = ['name', 'title', 'location', 'experience', 'availability', 'employed', 'languages', 'optional']
const ADMIN_EMAIL = 'dimarachmann@aol.com'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [role, setRole] = useState('candidate')
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<any[]>([])
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [view, setView] = useState<'overview' | 'profile' | 'requests' | 'admin' | 'notifications'>('overview')
  const [requests, setRequests] = useState<any[]>([])
  const [candidateRequests, setCandidateRequests] = useState<any[]>([])
  const [adminRequests, setAdminRequests] = useState<any[]>([])
  const [adminViews, setAdminViews] = useState<any[]>([])
  const [adminRecruiters, setAdminRecruiters] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [needsProfile, setNeedsProfile] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [showInactive, setShowInactive] = useState(false)

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
  const [availability, setAvailability] = useState('sofort')
  const [availableFrom, setAvailableFrom] = useState('')
  const [salaryBase, setSalaryBase] = useState('')
  const [salaryOte, setSalaryOte] = useState('')
  const [negotiable, setNegotiable] = useState(true)
  const [currentCompany, setCurrentCompany] = useState('')
  const [employed, setEmployed] = useState(false)
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  const [industries, setIndustries] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [cvUrl, setCvUrl] = useState('')
  const [candidatePhone, setCandidatePhone] = useState('')
  const [candidateLinkedin, setCandidateLinkedin] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)

  const [germanLevel, setGermanLevel] = useState('keine')
  const [englishLevel, setEnglishLevel] = useState('keine')
  const [otherLanguages, setOtherLanguages] = useState<{name: string, level: string}[]>([])

  // Recruiter fields
  const [companyName, setCompanyName] = useState('')
  const [searchingFor, setSearchingFor] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [recruiterPhone, setRecruiterPhone] = useState('')
  const [recruiterLinkedin, setRecruiterLinkedin] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL
  const isPremium = isAdmin || recruiterProfile?.is_premium === true

  async function notifyAdmin(title: string, message: string) {
    try {
      await supabase.rpc('notify_admin', { title, message })
    } catch {}
  }

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const u = data.session?.user ?? null
        setUser(u)
        if (u) {
          await loadCandidates()
          await loadNotifications(u.id)
          const userRole = u.user_metadata?.role || 'candidate'
          if (userRole === 'candidate') {
            const hasProfile = await loadProfile(u.id)
            if (!hasProfile) {
              setNeedsProfile(true)
              setView('profile')
              setOnboardingStep(0)
              setCandidatePhone(u.user_metadata?.phone || '')
              setCandidateLinkedin(u.user_metadata?.linkedin || '')
            }
            await loadCandidateRequests(u.id)
          }
          if (userRole === 'recruiter') {
            await loadMyRequests(u.id)
            await loadRecruiterProfile(u.id)
            setRecruiterPhone(u.user_metadata?.phone || '')
            setRecruiterLinkedin(u.user_metadata?.linkedin || '')
          }
          if (u.email?.toLowerCase() === ADMIN_EMAIL) {
            await loadAdminRequests()
            await loadAdminViews()
            await loadAdminRecruiters()
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
        const userRole = u.user_metadata?.role || 'candidate'
        if (userRole === 'candidate') {
          const hasProfile = await loadProfile(u.id)
          if (!hasProfile) {
            setNeedsProfile(true)
            setView('profile')
            setOnboardingStep(0)
            setCandidatePhone(u.user_metadata?.phone || '')
            setCandidateLinkedin(u.user_metadata?.linkedin || '')
          }
          await loadCandidateRequests(u.id)
        }
        if (userRole === 'recruiter') {
          await loadMyRequests(u.id)
          await loadRecruiterProfile(u.id)
          setRecruiterPhone(u.user_metadata?.phone || '')
          setRecruiterLinkedin(u.user_metadata?.linkedin || '')
        }
        if (u.email?.toLowerCase() === ADMIN_EMAIL) {
          await loadAdminRequests()
          await loadAdminViews()
          await loadAdminRecruiters()
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

  function handleNotificationClick(n: any) {
    if (n.title?.includes('Kontaktanfrage') || n.title?.includes('Prozess')) {
      setView('admin')
    } else if (n.title?.includes('Profil') || n.title?.includes('Anmeldung')) {
      setView('admin')
    } else {
      setView('notifications')
    }
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
      setRecruiterPhone(data.phone || user?.user_metadata?.phone || '')
      setRecruiterLinkedin(data.linkedin || user?.user_metadata?.linkedin || '')
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
      phone: recruiterPhone || null,
      linkedin: recruiterLinkedin || null,
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
    const { data: reqs } = await supabase.from('contact_requests').select('*').eq('candidate_id', cand.id).order('created_at', { ascending: false })
    if (!reqs) return

    const enriched = await Promise.all(reqs.map(async (r) => {
      const { data: rp } = await supabase.from('recruiter_profiles').select('company_name, logo_url').eq('user_id', r.recruiter_id).maybeSingle()
      return { ...r, company_name: rp?.company_name || 'Unbekannte Firma', logo_url: rp?.logo_url }
    }))
    setCandidateRequests(enriched)
  }

  async function loadAdminRequests() {
    const { data: reqs } = await supabase.from('contact_requests').select('*').order('created_at', { ascending: false })
    if (!reqs) return

    const enriched = await Promise.all(reqs.map(async (r) => {
      const { data: rp } = await supabase.from('recruiter_profiles').select('company_name, logo_url, phone').eq('user_id', r.recruiter_id).maybeSingle()
      const { data: cand } = await supabase.from('candidates').select('full_name, title').eq('id', r.candidate_id).maybeSingle()
      return {
        ...r,
        company_name: rp?.company_name || 'Unbekannte Firma',
        logo_url: rp?.logo_url,
        recruiter_phone: rp?.phone,
        candidate_name: cand?.full_name || 'Unbekannter Kandidat',
        candidate_title: cand?.title,
      }
    }))
    setAdminRequests(enriched)
  }

  async function loadAdminViews() {
    const { data } = await supabase.from('candidate_views').select('*').order('viewed_at', { ascending: false }).limit(100)
    setAdminViews(data || [])
  }

  async function loadAdminRecruiters() {
    const { data } = await supabase.from('recruiter_profiles').select('*').order('updated_at', { ascending: false })
    setAdminRecruiters(data || [])
  }

  async function togglePremium(recruiterId: string, current: boolean) {
    const { error } = await supabase.from('recruiter_profiles').update({ is_premium: !current }).eq('id', recruiterId)
    if (error) {
      alert('Fehler beim Setzen von Premium: ' + error.message)
    }
    await loadAdminRecruiters()
  }

  async function toggleCertified(candidateId: string, current: boolean) {
    const { error } = await supabase.from('candidates').update({ is_certified: !current }).eq('id', candidateId)
    if (error) {
      alert('Fehler beim Zertifizieren: ' + error.message)
    }
    await loadCandidates()
  }

  async function toggleActive() {
    if (!profile) return
    const next = !isActive
    await supabase.from('candidates').update({ is_active: next }).eq('id', profile.id)
    setIsActive(next)
    setProfile({ ...profile, is_active: next })
    await loadCandidates()
  }

  async function updateProcessStatus(requestId: string, processStatus: string) {
    const { data: req } = await supabase.from('contact_requests').select('*').eq('id', requestId).single()
    await supabase.from('contact_requests').update({ process_status: processStatus }).eq('id', requestId)

    if (req) {
      const { data: cand } = await supabase.from('candidates').select('full_name').eq('id', req.candidate_id).maybeSingle()
      const { data: rp } = await supabase.from('recruiter_profiles').select('company_name').eq('user_id', req.recruiter_id).maybeSingle()
      const label = PROCESS_OPTIONS.find(o => o.value === processStatus)?.label || processStatus
      await notifyAdmin(
        'Prozess-Status geändert',
        `${rp?.company_name || 'Recruiter'} ↔ ${cand?.full_name || 'Kandidat'}: ${label}`
      )
    }

    if (user) {
      await loadCandidateRequests(user.id)
      await loadMyRequests(user.id)
      if (isAdmin) await loadAdminRequests()
    }
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

  async function loadProfile(userId: string): Promise<boolean> {
    const { data } = await supabase.from('candidates').select('*').eq('user_id', userId).maybeSingle()
    if (data) {
      setProfile(data)
      setFullName(data.full_name || '')
      setTitle(data.title || '')
      setLocation(data.location || '')
      setExperience(data.experience_years?.toString() || '')
      setAvailability(data.availability || 'sofort')
      setAvailableFrom(data.available_from || '')
      setSalaryBase(data.salary_base_k?.toString() || '')
      setSalaryOte(data.salary_ote_k?.toString() || data.salary_desired_k?.toString() || '')
      setNegotiable(data.salary_negotiable !== false)
      setCurrentCompany(data.current_company || '')
      setEmployed(!!data.currently_employed)
      setBio(data.bio || '')
      setSkills((data.skills || []).join(', '))
      setIndustries((data.industries || []).join(', '))
      setPhotoUrl(data.photo_url || '')
      setCvUrl(data.cv_url || '')
      setCandidatePhone(data.phone || '')
      setCandidateLinkedin(data.linkedin || '')
      setIsActive(data.is_active !== false)

      const langs = data.languages || {}
      setGermanLevel(langs.german || 'keine')
      setEnglishLevel(langs.english || 'keine')
      setOtherLanguages(langs.others || [])

      setNeedsProfile(false)
      return true
    }
    return false
  }

  async function requestContact(candidateId: string) {
    if (!user) return

    // Block if already in process or approved with this candidate
    const { data: existing } = await supabase
      .from('contact_requests')
      .select('id, status, process_status')
      .eq('recruiter_id', user.id)
      .eq('candidate_id', candidateId)
      .maybeSingle()

    if (existing) {
      if (existing.status === 'approved' && (existing.process_status === 'in_process' || existing.process_status === 'hired')) {
        alert('Du bist bereits im Gespräch mit diesem Kandidaten.')
        return
      }
      alert('Du hast diesen Kandidaten bereits angefragt.')
      return
    }

    if (!companyName.trim()) {
      alert('Bitte lege zuerst dein Firmenprofil an (Firmenname), bevor du anfragst.')
      setView('profile')
      return
    }

    const message = window.prompt('Kurze Nachricht (optional):')
    if (message === null) return // User clicked Cancel

    await logView(candidateId)
    const { error } = await supabase.from('contact_requests').insert({
      recruiter_id: user.id,
      candidate_id: candidateId,
      message: message || '',
      status: 'pending'
    })

    if (error) {
      alert('Fehler: ' + error.message)
    } else {
      alert('Anfrage gesendet.')
      const { data: cand } = await supabase.from('candidates').select('full_name').eq('id', candidateId).maybeSingle()
      await notifyAdmin(
        'Neue Kontaktanfrage',
        `${companyName || user.email} hat ${cand?.full_name || 'einen Kandidaten'} angefragt.`
      )
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
    const isNew = !profile
    const payload = {
      user_id: user.id,
      full_name: fullName,
      title: title || null,
      location: location || null,
      experience_years: experience ? parseInt(experience) : null,
      availability: availability || null,
      available_from: availability === 'datum' ? (availableFrom || null) : null,
      salary_base_k: salaryBase ? parseInt(salaryBase) : null,
      salary_ote_k: salaryOte ? parseInt(salaryOte) : null,
      salary_negotiable: negotiable,
      current_company: currentCompany || null,
      currently_employed: employed,
      bio: bio || null,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      industries: industries.split(',').map(s => s.trim()).filter(Boolean),
      photo_url: photoUrl || null,
      cv_url: cvUrl || null,
      phone: candidatePhone || null,
      linkedin: candidateLinkedin || null,

      languages: {
        german: germanLevel || 'keine',
        english: englishLevel || 'keine',
        others: otherLanguages.filter(l => l.name.trim()),
      },

      is_active: isActive,
      last_candidate_update: new Date().toISOString(),
    }
    try {
      if (profile) {
        await supabase.from('candidates').update(payload).eq('id', profile.id)
      } else {
        const { data } = await supabase.from('candidates').insert(payload).select().single()
        setProfile(data)
        await notifyAdmin(
          'Neues Kandidaten-Profil',
          `${fullName || user.email} hat ein Profil angelegt.`
        )
      }
      setNeedsProfile(false)
      setOnboardingStep(0)
      setMsg('Profil gespeichert!')
      setView('overview')
    } catch (e: any) {
      setMsg('Fehler: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  function nextStep() {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      saveProfile()
    }
  }

  function prevStep() {
    if (onboardingStep > 0) setOnboardingStep(onboardingStep - 1)
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        if (!phone.trim()) {
          setError('Telefonnummer ist erforderlich')
          return
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role, phone: phone.trim(), linkedin: linkedin.trim() || null } }
        })
        if (error) throw error
        await notifyAdmin(
          'Neue Anmeldung',
          `${email} hat sich als ${role === 'recruiter' ? 'Recruiter' : 'Kandidat'} registriert.`
        )
        alert('Registriert! Bitte bestätige deine E-Mail und melde dich dann an.')
        setIsLogin(true)
        setShowAuth(false)
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
    setAdminRecruiters([])
    setNotifications([])
    setUnreadCount(0)
    setNeedsProfile(false)
    setOnboardingStep(0)
    setShowAuth(false)
  }

  function calculateScore(c: any): number {
    // Completeness (0-100)
    let completeness = 0
    if (c.full_name) completeness += 15
    if (c.title) completeness += 15
    if (c.location) completeness += 10
    if (c.experience_years != null) completeness += 10
    if (c.availability) completeness += 10
    if (c.photo_url) completeness += 10
    if (c.cv_url) completeness += 10
    if (c.bio) completeness += 5
    if (c.skills && c.skills.length > 0) completeness += 5
    if (c.industries && c.industries.length > 0) completeness += 5
    if (c.salary_ote_k || c.salary_desired_k) completeness += 5

    if (c.languages?.german && c.languages.german !== 'keine') completeness += 5
    if (c.languages?.english && c.languages.english !== 'keine') completeness += 5

    completeness = Math.min(completeness, 100)

    // Recency (0-100) - based on last_candidate_update (only candidate self-updates) or created_at
    const updated = new Date(c.last_candidate_update || c.created_at || Date.now())
    const daysAgo = (Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24)
    const recency = Math.max(0, 100 - daysAgo * 5) // full score if <20 days, decays

    // Availability (0-100)
    const availMap: Record<string, number> = {
      sofort: 100,
      "2_wochen": 80,
      "1_monat": 60,
      "3_monate": 40,
      datum: 20,
    }
    const availabilityScore = availMap[c.availability] || 30

    // Certification bonus
    const certBonus = c.is_certified ? 15 : 0

    return (completeness * 0.40) + (recency * 0.25) + (availabilityScore * 0.20) + certBonus
  }

  function formatAvailability(c: any) {
    if (c.availability === 'sofort') return 'Sofort'
    if (c.availability === '2_wochen') return 'Innerhalb von 2 Wochen'
    if (c.availability === '1_monat') return 'Innerhalb von 1 Monat'
    if (c.availability === '3_monate') return 'Innerhalb von 3 Monaten'
    if (c.availability === 'datum' && c.available_from) return new Date(c.available_from).toLocaleDateString('de-DE')
    if (c.available_from) return new Date(c.available_from).toLocaleDateString('de-DE')
    return null
  }

  const filtered = candidates.filter(c => {
    if (c.is_active === false && !(isAdmin && showInactive)) return false
    if (filterExp && (c.experience_years || 0) < parseInt(filterExp)) return false
    if (filterSalary && ((c.salary_ote_k || c.salary_desired_k) || 999) > parseInt(filterSalary)) return false
    if (filterLocation && !c.location?.toLowerCase().includes(filterLocation.toLowerCase())) return false
    if (filterSkill && !c.skills?.some((s: string) => s.toLowerCase().includes(filterSkill.toLowerCase()))) return false
    if (filterJob && !c.title?.toLowerCase().includes(filterJob.toLowerCase())) return false
    if (filterIndustry && !c.industries?.some((i: string) => i.toLowerCase().includes(filterIndustry.toLowerCase()))) return false
    return true
  }).sort((a, b) => calculateScore(b) - calculateScore(a))

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Lade...</div>

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">Job Heroes</h1>
          <button onClick={() => setShowAuth(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium">Anmelden</button>
        </header>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Firmen suchen dich.<br />Nicht umgekehrt.</h2>
          <p className="mt-5 text-lg text-slate-600 max-w-xl mx-auto">Das umgekehrte Job-Portal. Du erstellst dein Profil – Recruiter kommen auf dich zu.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => { setShowAuth(true); setIsLogin(false); setRole('candidate') }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition">Als Kandidat starten</button>
            <button onClick={() => { setShowAuth(true); setIsLogin(false); setRole('recruiter') }} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-xl font-medium transition">Als Recruiter starten</button>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h3 className="font-semibold text-lg">Für Kandidaten</h3>
              <p className="text-sm text-slate-600 mt-2">Profil anlegen, CV hochladen, und auf Anfragen warten. Kein Bewerbungsstress.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="font-semibold text-lg">Für Recruiter</h3>
              <p className="text-sm text-slate-600 mt-2">Kandidaten durchsuchen, filtern und direkt anfragen. Du entscheidest, wen du ansprichst.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="font-semibold text-lg">Privat & sicher</h3>
              <p className="text-sm text-slate-600 mt-2">Wer noch im Job ist, bleibt verdeckt. Du bestimmst, wann du sichtbar bist.</p>
            </div>
          </div>
        </section>

        <footer className="max-w-5xl mx-auto px-4 sm:px-6 py-8 mt-8 border-t border-slate-200 text-center text-sm text-slate-500">
          <div className="flex justify-center gap-6">
            <a href="/impressum" className="hover:text-slate-700">Impressum</a>
            <a href="/datenschutz" className="hover:text-slate-700">Datenschutz</a>
          </div>
          <p className="mt-2">© {new Date().getFullYear()} Job Heroes</p>
        </footer>

        {showAuth && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setShowAuth(false)}>
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{isLogin ? 'Anmelden' : 'Registrieren'}</h2>
              <p className="text-sm text-slate-500 mb-6">Job Heroes</p>
              {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}
              <form onSubmit={handleAuth} className="space-y-4">
                <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                {!isLogin && (
                  <>
                    <input type="tel" placeholder="Telefonnummer *" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                    <input type="url" placeholder="LinkedIn (optional)" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none">
                      <option value="candidate">Ich bin Kandidat</option>
                      <option value="recruiter">Ich bin Arbeitgeber / Recruiter</option>
                    </select>
                  </>
                )}
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-medium transition">
                  {isLogin ? 'Anmelden' : 'Registrieren'}
                </button>
              </form>
              <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-slate-500 hover:text-slate-700">
                {isLogin ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const isRecruiter = (user.user_metadata?.role || 'candidate') === 'recruiter'
  const currentStep = ONBOARDING_STEPS[onboardingStep]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <header className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 tracking-tight">Job Heroes</h1>
          <div className="flex items-center gap-3 sm:gap-5">
            <button onClick={() => { setView('notifications'); markAllRead() }} className="relative p-2 text-slate-600 hover:text-slate-900 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">{unreadCount}</span>
              )}
            </button>
            <span className="text-xs sm:text-sm text-slate-600 hidden md:inline">{user.email} · {isRecruiter ? 'Recruiter' : 'Kandidat'}{isAdmin ? ' · Admin' : ''}{isPremium && isRecruiter ? ' · Premium' : ''}</span>
            <button onClick={signOut} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition">Abmelden</button>
          </div>
        </header>

        <nav className="flex gap-2 mb-6 sm:mb-8 flex-wrap">
          <button onClick={() => setView('overview')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition ${view === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>Übersicht</button>
          <button onClick={() => setView('profile')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition ${view === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>{isRecruiter ? 'Firmenprofil' : 'Mein Profil'}</button>
          {!isRecruiter && (
            <button onClick={() => setView('requests')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition ${view === 'requests' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>Anfragen</button>
          )}
          {isRecruiter && (
            <button onClick={() => setView('requests')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition ${view === 'requests' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>Meine Anfragen</button>
          )}
          {isAdmin && (
            <button onClick={() => setView('admin')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition ${view === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>Admin</button>
          )}
        </nav>

        {view === 'notifications' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 tracking-tight">Benachrichtigungen</h2>
            <div className="space-y-3">
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer hover:shadow-sm transition ${n.read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100'}`}
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))}
              {notifications.length === 0 && <p className="text-slate-500">Keine Benachrichtigungen.</p>}
            </div>
          </div>
        )}

        {view === 'admin' && isAdmin && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-3">Kandidaten zertifizieren</h2>
              <div className="space-y-1.5 max-h-64 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                {candidates.map(c => (
                  <div key={c.id} className="px-3 py-2 flex items-center justify-between gap-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.full_name || 'Unbekannt'} {c.is_certified && <span className="text-emerald-600">✓</span>}</p>
                      <p className="text-xs text-slate-500 truncate">{c.title || 'Kein Titel'}</p>
                    </div>
                    <button
                      onClick={() => toggleCertified(c.id, !!c.is_certified)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium flex-shrink-0 ${c.is_certified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {c.is_certified ? 'Zertifiziert' : 'Zertifizieren'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Recruiter & Premium</h2>
              <div className="space-y-1.5 max-h-64 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                {adminRecruiters.map(r => (
                  <div key={r.id} className="px-3 py-2 flex items-center justify-between gap-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.company_name || 'Unbekannte Firma'}</p>
                      <p className="text-xs text-slate-500 truncate">{r.searching_for || 'Keine Beschreibung'}</p>
                    </div>
                    <button
                      onClick={() => togglePremium(r.id, !!r.is_premium)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium flex-shrink-0 ${r.is_premium ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {r.is_premium ? 'Premium' : 'Standard'}
                    </button>
                  </div>
                ))}
                {adminRecruiters.length === 0 && <p className="text-sm text-slate-500 p-3">Noch keine Recruiter-Profile.</p>}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Kontaktanfragen</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {adminRequests.map(r => (
                  <div key={r.id} className="bg-white p-3 rounded-xl border border-slate-200 text-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{r.company_name}</p>
                        <p className="text-xs text-slate-600 truncate">→ {r.candidate_name}{r.candidate_title ? ` · ${r.candidate_title}` : ''}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span>
                    </div>
                    {r.message && <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">{r.message}</p>}
                    {r.status === 'approved' && (
                      <select value={r.process_status || 'open'} onChange={e => updateProcessStatus(r.id, e.target.value)} className="w-full mt-2 p-1.5 border border-slate-200 rounded text-xs">
                        {PROCESS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    )}
                    <div className="mt-2 flex gap-1.5 justify-end">
                      {r.status !== 'approved' && (
                        <button onClick={() => updateRequestStatus(r.id, 'approved')} className="bg-green-600 text-white text-xs px-2.5 py-1 rounded font-medium">Freigeben</button>
                      )}
                      {r.status !== 'rejected' && (
                        <button onClick={() => updateRequestStatus(r.id, 'rejected')} className="bg-red-600 text-white text-xs px-2.5 py-1 rounded font-medium">Ablehnen</button>
                      )}
                    </div>
                  </div>
                ))}
                {adminRequests.length === 0 && <p className="text-sm text-slate-500">Keine Anfragen.</p>}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Profil-Ansichten</h2>
              <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                {adminViews.slice(0, 20).map(v => (
                  <div key={v.id} className="px-3 py-1.5 text-xs flex justify-between border-b border-slate-100 last:border-0">
                    <span>Ansicht {v.id.slice(0, 8)}</span>
                    <span className="text-slate-400">{new Date(v.viewed_at).toLocaleString()}</span>
                  </div>
                ))}
                {adminViews.length === 0 && <p className="text-sm text-slate-500 p-3">Noch keine Ansichten.</p>}
              </div>
            </div>
          </div>
        )}

        {view === 'requests' && !isRecruiter && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 tracking-tight">Anfragen an dich</h2>
            <div className="space-y-4">
              {candidateRequests.map(r => (
                <div key={r.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex gap-4">
                    {r.logo_url && <img src={r.logo_url} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover" />}
                    <div className="flex-1">
                      <p className="font-semibold text-base sm:text-lg">{r.company_name || 'Unbekannte Firma'}</p>
                      <p className="mt-2 text-sm text-slate-700">{r.message || '(keine Nachricht)'}</p>
                      <p className="text-xs mt-3">Status: <span className={r.status === 'approved' ? 'text-green-600 font-medium' : r.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}>{r.status}</span></p>
                      {r.status === 'approved' && (
                        <div className="mt-3">
                          <label className="text-xs text-slate-500">Prozess-Status</label>
                          <select value={r.process_status || 'open'} onChange={e => updateProcessStatus(r.id, e.target.value)} className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-sm">
                            {PROCESS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {candidateRequests.length === 0 && <p className="text-slate-500">Noch keine Anfragen an dich.</p>}
            </div>
          </div>
        )}

        {view === 'requests' && isRecruiter && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 tracking-tight">Meine Anfragen</h2>
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100">
                  <p className="font-medium">Anfrage {r.id.slice(0, 8)}</p>
                  <p className="text-sm text-slate-600 mt-1">{r.message || '(keine Nachricht)'}</p>
                  <p className="text-xs mt-2">Status: <span className={r.status === 'approved' ? 'text-green-600' : r.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}>{r.status}</span></p>
                  {r.status === 'approved' && (
                    <p className="text-xs mt-1 text-slate-500">Prozess: {PROCESS_OPTIONS.find(o => o.value === (r.process_status || 'open'))?.label}</p>
                  )}
                </div>
              ))}
              {requests.length === 0 && <p className="text-slate-500">Noch keine Anfragen.</p>}
            </div>
          </div>
        )}

        {view === 'overview' && (
          <>
            <div className="mb-6 sm:mb-8 bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <input placeholder="Job / Titel" value={filterJob} onChange={e => setFilterJob(e.target.value)} className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Branche" value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)} className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Skill" value={filterSkill} onChange={e => setFilterSkill(e.target.value)} className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Min. Erfahrung (Jahre)" value={filterExp} onChange={e => setFilterExp(e.target.value)} className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Max. Gehalt (k€)" value={filterSalary} onChange={e => setFilterSalary(e.target.value)} className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Ort" value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {isAdmin && (
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showInactive"
                    checked={showInactive}
                    onChange={e => setShowInactive(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showInactive" className="text-sm text-slate-700 cursor-pointer">
                    Inaktive Profile anzeigen
                  </label>
                </div>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 tracking-tight">Kandidaten ({filtered.length})</h2>
            <div className="space-y-4 sm:space-y-5">
              {filtered.map(c => {
                const isHidden = c.currently_employed && !isPremium
                const avail = formatAvailability(c)
                return (
                  <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all relative" onMouseEnter={() => logView(c.id)}>
                    {isHidden && (
                      <div className="absolute inset-0 bg-white/85 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                        <div className="text-center px-6">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          </div>
                          <p className="font-semibold text-slate-800">Aktuell noch im Job</p>
                          <p className="text-sm text-slate-500 mt-1">Premium erforderlich</p>
                        </div>
                      </div>
                    )}
                    <div className={`p-5 sm:p-6 ${isHidden ? 'filter blur-[2px]' : ''}`}>
                      <div className="flex gap-4">
                        {c.photo_url ? (
                          <img src={c.photo_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 ring-1 ring-slate-200" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs flex-shrink-0">Foto</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            {isHidden ? '••••••••' : (c.full_name || 'Unbekannt')}
                            {c.is_certified && <span className="text-emerald-600 text-sm" title="Zertifiziert">✓</span>}
                            {c.is_active === false && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Inaktiv</span>}
                          </h3>
                          <p className="text-slate-700 font-medium mt-0.5">{c.title || 'Kein Titel'}</p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        {c.location && (
                          <div className="flex">
                            <span className="text-xs uppercase tracking-wide text-slate-400 w-28 flex-shrink-0 pt-0.5">Ort</span>
                            <span className="text-sm text-slate-800">{isHidden ? '••••' : c.location}</span>
                          </div>
                        )}
                        {c.experience_years != null && (
                          <div className="flex">
                            <span className="text-xs uppercase tracking-wide text-slate-400 w-28 flex-shrink-0 pt-0.5">Erfahrung</span>
                            <span className="text-sm text-slate-800">{c.experience_years} Jahre</span>
                          </div>
                        )}
                        {avail && (
                          <div className="flex">
                            <span className="text-xs uppercase tracking-wide text-slate-400 w-28 flex-shrink-0 pt-0.5">Verfügbar</span>
                            <span className="text-sm text-slate-800">{avail}</span>
                          </div>
                        )}

                        {c.languages && (
                          <div className="flex">
                            <span className="text-xs uppercase tracking-wide text-slate-400 w-28 flex-shrink-0 pt-0.5">Sprachen</span>
                            <span className="text-sm text-slate-800">
                              {(() => {
                                const parts: string[] = []
                                const de = LANGUAGE_LEVELS.find(l => l.value === c.languages?.german)?.label
                                const en = LANGUAGE_LEVELS.find(l => l.value === c.languages?.english)?.label
                                if (de) parts.push(`DE (${de})`)
                                if (en) parts.push(`EN (${en})`)
                                if (c.languages?.others?.length) {
                                  c.languages.others.forEach((o: any) => {
                                    const lvl = LANGUAGE_LEVELS.find(l => l.value === o.level)?.label || o.level
                                    if (o.name) parts.push(`${o.name} (${lvl})`)
                                  })
                                }
                                return parts.join(' · ')
                              })()}
                            </span>
                          </div>
                        )}

                        {(c.salary_ote_k || c.salary_desired_k) && (
                          <div className="flex">
                            <span className="text-xs uppercase tracking-wide text-slate-400 w-28 flex-shrink-0 pt-0.5">Gehalt</span>
                            <span className="text-sm text-slate-800">
                              OTE {c.salary_ote_k || c.salary_desired_k}k
                              {c.salary_base_k && ` (Base ${c.salary_base_k}k)`}
                              {c.salary_negotiable && <span className="text-slate-500"> · verhandelbar</span>}
                            </span>
                          </div>
                        )}
                        {isAdmin && c.phone && (
                          <div className="flex">
                            <span className="text-xs uppercase tracking-wide text-slate-400 w-28 flex-shrink-0 pt-0.5">Telefon</span>
                            <span className="text-sm text-slate-800">{c.phone}</span>
                          </div>
                        )}
                        {isPremium && c.linkedin && (
                          <div className="flex">
                            <span className="text-xs uppercase tracking-wide text-slate-400 w-28 flex-shrink-0 pt-0.5">LinkedIn</span>
                            <a href={c.linkedin} target="_blank" className="text-sm text-blue-600 underline truncate">{c.linkedin}</a>
                          </div>
                        )}
                      </div>

                      {c.bio && (
                        <div className="mt-5">
                          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Über mich</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{isHidden ? '••••••••••••••••••••' : c.bio}</p>
                        </div>
                      )}

                      {(c.skills?.length > 0 || c.industries?.length > 0) && (
                        <div className="mt-5 space-y-3">
                          {c.skills?.length > 0 && (
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1.5">Skills</p>
                              <div className="flex flex-wrap gap-1.5">
                                {c.skills.slice(0, 5).map((s: string) => (
                                  <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {c.industries?.length > 0 && (
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1.5">Branchen</p>
                              <div className="flex flex-wrap gap-1.5">
                                {c.industries.slice(0, 4).map((i: string) => (
                                  <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium">{i}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
                        {c.cv_url && !isHidden && (
                          <a href={c.cv_url} target="_blank" className="text-blue-600 text-sm font-medium hover:underline" onClick={() => logView(c.id)}>
                            Lebenslauf →
                          </a>
                        )}
                        {isRecruiter && !isHidden && (
                          <button
                            onClick={() => requestContact(c.id)}
                            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-xl font-medium transition"
                          >
                            Anfragen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && <p className="text-slate-500 text-center py-12">Keine Kandidaten gefunden.</p>}
            </div>
          </>
        )}

        {view === 'profile' && isRecruiter && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-8 max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 tracking-tight">Firmenprofil</h2>
            {msg && <div className={`p-3 rounded-xl mb-6 text-sm ${msg.includes('Fehler') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 mb-8">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200" />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">Logo</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Firmenlogo</label>
                <input type="file" accept="image/*" onChange={uploadLogo} disabled={uploadingLogo} className="text-sm text-slate-600" />
                {uploadingLogo && <p className="text-xs text-slate-500 mt-1">Lade hoch...</p>}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Firmenname</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="z.B. allO Technology GmbH" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wen sucht ihr aktuell?</label>
                <textarea value={searchingFor} onChange={e => setSearchingFor(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" rows={4} placeholder="z.B. Senior Sales Manager für DACH..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefonnummer</label>
                <input value={recruiterPhone} onChange={e => setRecruiterPhone(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn (optional)</label>
                <input value={recruiterLinkedin} onChange={e => setRecruiterLinkedin(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button onClick={saveRecruiterProfile} disabled={saving} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 transition">
                {saving ? 'Speichere...' : 'Firmenprofil speichern'}
              </button>
            </div>
          </div>
        )}

        {view === 'profile' && !isRecruiter && needsProfile && (
          <div className="max-w-md mx-auto">
            <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
              <span>Schritt {onboardingStep + 1} von {ONBOARDING_STEPS.length}</span>
              <span>{Math.round(((onboardingStep + 1) / ONBOARDING_STEPS.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full mb-8">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${((onboardingStep + 1) / ONBOARDING_STEPS.length) * 100}%` }} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              {currentStep === 'name' && (
                <>
                  <h2 className="text-xl font-semibold mb-2">Wie heißt du?</h2>
                  <p className="text-sm text-slate-500 mb-6">Dein Name wird im Profil angezeigt.</p>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Vor- und Nachname" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </>
              )}
              {currentStep === 'title' && (
                <>
                  <h2 className="text-xl font-semibold mb-2">Welchen Job suchst du?</h2>
                  <p className="text-sm text-slate-500 mb-6">z.B. Sales Director, Frontend Engineer...</p>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Gesuchter Job" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </>
              )}
              {currentStep === 'location' && (
                <>
                  <h2 className="text-xl font-semibold mb-2">Wo kannst du arbeiten?</h2>
                  <p className="text-sm text-slate-500 mb-6">Stadt, Remote, Hybrid...</p>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="z.B. Hamburg / Remote" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </>
              )}
              {currentStep === 'experience' && (
                <>
                  <h2 className="text-xl font-semibold mb-2">Wie viele Jahre Berufserfahrung hast du?</h2>
                  <input type="number" value={experience} onChange={e => setExperience(e.target.value)} placeholder="z.B. 5" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 mt-4" />
                </>
              )}
              {currentStep === 'availability' && (
                <>
                  <h2 className="text-xl font-semibold mb-2">Wann bist du verfügbar?</h2>
                  <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 mt-4">
                    {AVAILABILITY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {availability === 'datum' && (
                    <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 mt-3" />
                  )}
                </>
              )}
              {currentStep === 'employed' && (
                <>
                  <h2 className="text-xl font-semibold mb-2">Bist du aktuell noch im Job?</h2>
                  <p className="text-sm text-slate-500 mb-6">Wenn ja, wird dein Profil für normale Recruiter verdeckt angezeigt.</p>
                  <div className="space-y-3">
                    <button type="button" onClick={() => setEmployed(false)} className={`w-full p-4 rounded-xl border text-left ${!employed ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>Nein, ich bin frei</button>
                    <button type="button" onClick={() => setEmployed(true)} className={`w-full p-4 rounded-xl border text-left ${employed ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>Ja, ich bin noch angestellt</button>
                  </div>
                  {employed && (
                    <input value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} placeholder="Aktueller Arbeitgeber (optional)" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 mt-4" />
                  )}
                </>
              )}

              {currentStep === 'languages' && (
                <>
                  <h2 className="text-xl font-semibold mb-2">Sprachkenntnisse</h2>
                  <p className="text-sm text-slate-500 mb-6">Deutsch und Englisch sind verpflichtend.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Deutsch</label>
                      <select value={germanLevel} onChange={e => setGermanLevel(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                        {LANGUAGE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Englisch</label>
                      <select value={englishLevel} onChange={e => setEnglishLevel(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                        {LANGUAGE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 'optional' && (
                <>
                  <h2 className="text-xl font-semibold mb-2">Noch etwas hinzufügen?</h2>
                  <p className="text-sm text-slate-500 mb-6">Alles optional – du kannst es später ergänzen.</p>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <input type="number" value={salaryOte} onChange={e => setSalaryOte(e.target.value)} placeholder="OTE in 1.000 € (optional)" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="number" value={salaryBase} onChange={e => setSalaryBase(e.target.value)} placeholder="Base / Fixum in 1.000 € (optional)" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills, kommagetrennt (optional)" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    <input value={industries} onChange={e => setIndustries(e.target.value)} placeholder="Branchen, kommagetrennt (optional)" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Kurze Bio (optional)" rows={3} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-8">
                {onboardingStep > 0 && (
                  <button type="button" onClick={prevStep} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium">Zurück</button>
                )}
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={saving || (currentStep === 'name' && !fullName.trim())}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium disabled:opacity-50"
                >
                  {onboardingStep === ONBOARDING_STEPS.length - 1 ? (saving ? 'Speichere...' : 'Fertig') : 'Weiter'}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'profile' && !isRecruiter && !needsProfile && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-8 max-w-2xl">
            <div className="flex justify-between items-start mb-5">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Mein Profil</h2>
              <button onClick={toggleActive} className={`text-sm px-4 py-2 rounded-xl font-medium ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                {isActive ? 'Aktiv (auf Suche)' : 'Inaktiv'}
              </button>
            </div>
            {msg && <div className={`p-3 rounded-xl mb-6 text-sm ${msg.includes('Fehler') || msg.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 mb-8">
              {photoUrl ? (
                <img src={photoUrl} alt="Profil" className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200" />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">Foto</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profilbild (optional)</label>
                <input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploadingPhoto} className="text-sm text-slate-600" />
                {uploadingPhoto && <p className="text-xs text-slate-500 mt-1">Lade hoch...</p>}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-1">Lebenslauf (PDF, optional)</label>
              <input type="file" accept="application/pdf" onChange={uploadCv} disabled={uploadingCv} className="text-sm text-slate-600" />
              {uploadingCv && <p className="text-xs text-slate-500 mt-1">Lade CV hoch...</p>}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Vollständiger Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gesuchter Job</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="z.B. Senior Frontend Entwickler" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ort</label>
                <input value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Hamburg, Remote..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jahre Berufserfahrung</label>
                <input type="number" value={experience} onChange={e => setExperience(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Verfügbarkeit</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  {AVAILABILITY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              {availability === 'datum' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ab Datum</label>
                  <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">OTE (in 1.000 €, optional)</label>
                <input type="number" value={salaryOte} onChange={e => setSalaryOte(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="120" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base / Fixum (in 1.000 €, optional)</label>
                <input type="number" value={salaryBase} onChange={e => setSalaryBase(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="80" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700">verhandelbar</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aktueller Arbeitgeber (optional)</label>
                <input value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={employed} onChange={e => setEmployed(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700">Ich bin aktuell noch im Job</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio (optional)</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deutsch</label>
                <select value={germanLevel} onChange={e => setGermanLevel(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  {LANGUAGE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Englisch</label>
                <select value={englishLevel} onChange={e => setEnglishLevel(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  {LANGUAGE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weitere Sprachen (optional)</label>
                {otherLanguages.map((lang, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input value={lang.name} onChange={e => {
                      const next = [...otherLanguages]
                      next[idx].name = e.target.value
                      setOtherLanguages(next)
                    }} placeholder="Sprache" className="flex-1 p-3 border border-slate-200 rounded-xl" />
                    <select value={lang.level} onChange={e => {
                      const next = [...otherLanguages]
                      next[idx].level = e.target.value
                      setOtherLanguages(next)
                    }} className="w-40 p-3 border border-slate-200 rounded-xl">
                      {LANGUAGE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                    <button type="button" onClick={() => setOtherLanguages(otherLanguages.filter((_, i) => i !== idx))} className="text-red-500 px-2">×</button>
                  </div>
                ))}
                <button type="button" onClick={() => setOtherLanguages([...otherLanguages, { name: '', level: 'A1' }])} className="text-sm text-blue-600 mt-1">+ Sprache hinzufügen</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills (kommagetrennt, optional)</label>
                <input value={skills} onChange={e => setSkills(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="React, TypeScript, Sales..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branchen (kommagetrennt, optional)</label>
                <input value={industries} onChange={e => setIndustries(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="IT, SaaS, Hospitality..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefonnummer</label>
                <input value={candidatePhone} onChange={e => setCandidatePhone(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn (optional)</label>
                <input value={candidateLinkedin} onChange={e => setCandidateLinkedin(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button onClick={saveProfile} disabled={saving} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 transition">
                {saving ? 'Speichere...' : 'Profil speichern'}
              </button>
            </div>
          </div>
        )}
      </div>
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 py-8 border-t border-slate-200 text-center text-sm text-slate-500">
        <div className="flex justify-center gap-6">
          <a href="/impressum" className="hover:text-slate-700">Impressum</a>
          <a href="/datenschutz" className="hover:text-slate-700">Datenschutz</a>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} Job Heroes</p>
      </footer>
    </div>
  )
}
