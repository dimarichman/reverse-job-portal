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

const LOCATIONS = [
  'Remote', 'Hybrid',
  'Berlin', 'Hamburg', 'München', 'Frankfurt', 'Köln', 'Düsseldorf', 'Stuttgart', 'Wien', 'Zürich',
  'London', 'Paris', 'Amsterdam', 'Madrid', 'Barcelona', 'Milan', 'Dublin',
  'New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Austin', 'Boston', 'Seattle',
  'Singapore', 'Hong Kong', 'Dubai', 'Sydney', 'Toronto', 'Vancouver',
]

const JOBS = [
  'Account Executive', 'Account Manager', 'Sales Director', 'Head of Sales', 'VP Sales',
  'Country Manager', 'Commercial Director', 'Business Development Manager',
  'Key Account Manager', 'Enterprise Account Executive', 'Sales Manager',
  'Marketing Manager', 'Head of Marketing', 'Product Manager', 'Product Owner',
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'Data Analyst', 'Customer Success Manager', 'Operations Manager',
  'HR Manager', 'Recruiter', 'Finance Manager', 'Controller',
]

const INDUSTRIES = [
  'SaaS', 'Software', 'E-Commerce', 'FinTech', 'HealthTech', 'EdTech',
  'Healthcare', 'Finance', 'Banking', 'Insurance', 'Manufacturing',
  'Automotive', 'Retail', 'Hospitality', 'Food & Beverage', 'Logistics',
  'Consulting', 'Media', 'Telecommunications', 'Energy', 'Real Estate',
  'Gaming', 'Cybersecurity', 'AI / Machine Learning',
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
  const [adminEditing, setAdminEditing] = useState<any>(null)

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
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [newsletter, setNewsletter] = useState(true)

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL
  const isPremium = isAdmin || recruiterProfile?.is_premium === true

  async function notifyAdmin(title: string, message: string) {
    try {
      await supabase.rpc('notify_admin', { title, message })
    } catch {}
  }

  async function sendEmail(to: string, subject: string, html: string) {
    try {
      await supabase.functions.invoke('send-email', {
        body: { to, subject, html }
      })
    } catch (e) {
      console.error('Email failed', e)
    }
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


  async function startAdminEdit(candidate: any) {
    setAdminEditing(candidate)
    setFullName(candidate.full_name || '')
    setTitle(candidate.title || '')
    setLocation(candidate.location || '')
    setExperience(candidate.experience_years?.toString() || '')
    setAvailability(candidate.availability || 'sofort')
    setAvailableFrom(candidate.available_from || '')
    setSalaryBase(candidate.salary_base_k?.toString() || '')
    setSalaryOte(candidate.salary_ote_k?.toString() || candidate.salary_desired_k?.toString() || '')
    setNegotiable(candidate.salary_negotiable !== false)
    setCurrentCompany(candidate.current_company || '')
    setEmployed(!!candidate.currently_employed)
    setBio(candidate.bio || '')
    setSkills((candidate.skills || []).join(', '))
    setIndustries((candidate.industries || []).join(', '))
    setPhotoUrl(candidate.photo_url || '')
    setCvUrl(candidate.cv_url || '')
    setCandidatePhone(candidate.phone || '')
    setCandidateLinkedin(candidate.linkedin || '')
    setIsActive(candidate.is_active !== false)
    const langs = candidate.languages || {}
    setGermanLevel(langs.german || 'keine')
    setEnglishLevel(langs.english || 'keine')
    setOtherLanguages(langs.others || [])
    setView('profile')
    setNeedsProfile(false)
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
    const { data: req } = await supabase.from('contact_requests').select('*').eq('id', requestId).maybeSingle()
    if (!req) return
    await supabase.from('contact_requests').update({ process_status: processStatus }).eq('id', requestId)
    await loadCandidateRequests(user?.id)
    await loadAdminRequests()
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
      setNewsletter(data.newsletter !== false)
      setEmailNotifications(data.email_notifications !== false)

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
    const targetId = adminEditing ? adminEditing.id : profile?.id
    const targetUserId = adminEditing ? adminEditing.user_id : user.id
    const isNew = !targetId
    const payload = {
      user_id: targetUserId,
      full_name: fullName,
      email: user.email || null,
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
      newsletter: newsletter,
      email_notifications: emailNotifications,
      last_candidate_update: new Date().toISOString(),
    }
    try {
      if (targetId) {
        await supabase.from('candidates').update(payload).eq('id', targetId)
        if (adminEditing) {
          setMsg('Profil als Admin gespeichert!')
          setAdminEditing(null)
          await loadCandidates()
          setView('admin')
        } else {
          setMsg('Profil gespeichert!')
          setView('overview')
        }
      } else {
        const { data } = await supabase.from('candidates').insert(payload).select().single()
        setProfile(data)
        await notifyAdmin(
          'Neues Kandidaten-Profil',
          `${fullName || user.email} hat ein Profil angelegt.`
        )
        setNeedsProfile(false)
        setOnboardingStep(0)
        setMsg('Profil gespeichert!')
        setView('overview')
      }
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
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              phone,
              linkedin,
            },
          },
        })
        if (error) throw error
        alert('Registrierung erfolgreich! Bitte bestätige deine E-Mail.')
      }
      setShowAuth(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setView('overview')
  }

  function getCompleteness(c: any) {
    let score = 0
    if (c.full_name) score += 10
    if (c.title) score += 10
    if (c.location) score += 10
    if (c.experience_years) score += 10
    if (c.availability) score += 10
    if (c.skills?.length) score += 10
    if (c.industries?.length) score += 10
    if (c.bio) score += 10
    if (c.photo_url) score += 5
    if (c.cv_url) score += 5
    if (c.languages?.german && c.languages.german !== 'keine') score += 5
    if (c.languages?.english && c.languages.english !== 'keine') score += 5
    return Math.min(100, score)
  }

  const filtered = candidates.filter(c => {
    if (!showInactive && c.is_active === false) return false
    if (filterExp && (c.experience_years || 0) < parseInt(filterExp)) return false
    if (filterSalary && (c.salary_base_k || 0) < parseInt(filterSalary)) return false
    if (filterLocation && !c.location?.toLowerCase().includes(filterLocation.toLowerCase())) return false
    if (filterSkill && !c.skills?.some((s: string) => s.toLowerCase().includes(filterSkill.toLowerCase()))) return false
    if (filterJob && !c.title?.toLowerCase().includes(filterJob.toLowerCase())) return false
    if (filterIndustry && !c.industries?.some((i: string) => i.toLowerCase().includes(filterIndustry.toLowerCase()))) return false
    return true
  }).sort((a, b) => getCompleteness(b) - getCompleteness(a))

  if (loading) return <div className="min-h-screen flex items-center justify-center">Lade...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">JH</div>
            <h1 className="text-xl font-semibold text-slate-900">Job Heroes</h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-slate-600 hidden sm:inline">{user.email}</span>
                <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700">Abmelden</button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl">Anmelden</button>
            )}
          </div>
        </div>
      </header>

      {showAuth && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{isLogin ? 'Anmelden' : 'Registrieren'}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 border rounded-xl" />
              <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border rounded-xl" />
              {!isLogin && (
                <>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 border rounded-xl">
                    <option value="candidate">Ich bin Bewerber</option>
                    <option value="recruiter">Ich bin Arbeitgeber / Recruiter</option>
                  </select>
                  <input placeholder="Telefonnummer" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border rounded-xl" />
                  <input placeholder="LinkedIn (optional)" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="w-full p-3 border rounded-xl" />
                </>
              )}
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl">{loading ? '...' : isLogin ? 'Anmelden' : 'Registrieren'}</button>
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-sm text-slate-500">{isLogin ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}</button>
            </form>
            <button onClick={() => setShowAuth(false)} className="mt-4 text-sm text-slate-400">Schließen</button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {!user && (
          <div className="text-center py-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Firmen kommen zu dir</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">Erstelle dein Profil und lass Arbeitgeber dich finden – statt selbst zu suchen.</p>
            <button onClick={() => setShowAuth(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-medium">Profil anlegen</button>
          </div>
        )}

        {user && (
          <nav className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setView('overview')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition ${view === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>Übersicht</button>
            <button onClick={() => setView('profile')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition ${view === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>Mein Profil</button>
            {(user.user_metadata?.role === 'recruiter' || isAdmin) && (
              <button onClick={() => setView('requests')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition ${view === 'requests' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>Meine Anfragen</button>
            )}
            {isAdmin && (
              <button onClick={() => setView('admin')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition ${view === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>Admin</button>
            )}
          </nav>
        )}

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
                      <p className="text-sm font-medium truncate">{c.full_name || 'Unbekannt'} {c.is_certified && <span className="text-emerald-600">✓</span>} <span className="text-xs text-slate-400 font-normal">({getCompleteness(c)}%)</span></p>
                      <p className="text-xs text-slate-500 truncate">{c.title || 'Kein Titel'}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => startAdminEdit(c)}
                        className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg"
                      >Bearbeiten</button>
                      <button
                        onClick={() => toggleCertified(c.id, !!c.is_certified)}
                        className={`text-xs px-2 py-1 rounded-lg ${c.is_certified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}
                      >{c.is_certified ? 'Zertifiziert' : 'Zertifizieren'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Recruiter & Premium</h2>
              <div className="space-y-1.5 max-h-64 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                {adminRecruiters.map(r => (
                  <div key={r.id} className="px-3 py-2 flex items-center justify-between gap-3 border-b border-slate-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.company_name || 'Unbekannt'}</p>
                      <p className="text-xs text-slate-500 truncate">{r.searching_for || 'Keine Suche'}</p>
                    </div>
                    <button
                      onClick={() => togglePremium(r.id, !!r.is_premium)}
                      className={`text-xs px-3 py-1 rounded-lg ${r.is_premium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100'}`}
                    >{r.is_premium ? 'Premium' : 'Standard'}</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Kontaktanfragen</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-xl bg-white p-2">
                {adminRequests.map(r => (
                  <div key={r.id} className="p-3 border border-slate-100 rounded-lg">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-medium text-sm">{r.company_name}</p>
                        <p className="text-xs text-slate-500">{r.candidate_name} · {r.candidate_title}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                    </div>
                    {r.message && <p className="text-sm mt-2 text-slate-700">{r.message}</p>}
                    <div className="flex gap-2 mt-3">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={async () => { await supabase.from('contact_requests').update({ status: 'approved' }).eq('id', r.id); await loadAdminRequests() }} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg">Freigeben</button>
                          <button onClick={async () => { await supabase.from('contact_requests').update({ status: 'rejected' }).eq('id', r.id); await loadAdminRequests() }} className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg">Ablehnen</button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <select
                          value={r.process_status || 'open'}
                          onChange={e => updateProcessStatus(r.id, e.target.value)}
                          className="text-xs border rounded-lg px-2 py-1"
                        >
                          {PROCESS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
                {adminRequests.length === 0 && <p className="text-sm text-slate-500">Keine Anfragen.</p>}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Newsletter</h2>
              <button
                onClick={async () => {
                  const subject = window.prompt('Betreff des Newsletters:')
                  if (!subject) return
                  const body = window.prompt('Inhalt (HTML erlaubt):')
                  if (!body) return

                  const { data: users, error } = await supabase
                    .from('candidates')
                    .select('user_id, full_name, email')
                    .eq('newsletter', true)

                  if (error) {
                    alert('Fehler beim Laden der Abonnenten: ' + error.message)
                    return
                  }

                  const count = users?.length || 0
                  if (count === 0) {
                    alert('Keine Abonnenten gefunden. Stelle sicher, dass im Profil der Newsletter-Haken gesetzt und gespeichert ist.')
                    return
                  }

                  if (!confirm(`Newsletter an ${count} Abonnenten senden?`)) return

                  let sent = 0
                  for (const u of users || []) {
                    if (u.email) {
                      await sendEmail(u.email, subject, body)
                      sent++
                    }
                  }
                  alert(`Newsletter an ${sent} von ${count} Abonnenten gesendet.`)
                }}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl"
              >
                Newsletter senden
              </button>
            </div>
          </div>
        )}

        {view === 'overview' && user && (
          <div>
            <div className="flex flex-wrap gap-3 mb-6">
              <input placeholder="Erfahrung min. Jahre" value={filterExp} onChange={e => setFilterExp(e.target.value)} className="p-2.5 border rounded-xl text-sm w-40" />
              <input placeholder="Gehalt min. (k)" value={filterSalary} onChange={e => setFilterSalary(e.target.value)} className="p-2.5 border rounded-xl text-sm w-40" />
              <input placeholder="Ort" value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="p-2.5 border rounded-xl text-sm w-40" />
              <input placeholder="Skill" value={filterSkill} onChange={e => setFilterSkill(e.target.value)} className="p-2.5 border rounded-xl text-sm w-40" />
              <input placeholder="Job / Titel" value={filterJob} onChange={e => setFilterJob(e.target.value)} className="p-2.5 border rounded-xl text-sm w-40" />
              <input placeholder="Branche" value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)} className="p-2.5 border rounded-xl text-sm w-40" />
              {isAdmin && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
                  Inaktive zeigen
                </label>
              )}
            </div>

            <div className="grid gap-4">
              {filtered.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-lg">{c.full_name || 'Unbekannt'} {c.is_certified && <span className="text-emerald-600 text-sm">✓</span>}</h3>
                        <p className="text-slate-600">{c.title || 'Kein Titel'}</p>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{getCompleteness(c)}%</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(c.skills || []).slice(0, 5).map((s: string) => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{s}</span>
                      ))}
                      {(c.industries || []).slice(0, 3).map((i: string) => (
                        <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{i}</span>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-slate-500">{c.location} · {c.experience_years || 0} Jahre · {c.availability}</p>
                  </div>
                  {c.photo_url && <img src={c.photo_url} alt="" className="w-20 h-20 rounded-xl object-cover" />}
                  {(user.user_metadata?.role === 'recruiter' || isAdmin) && (
                    <button onClick={() => requestContact(c.id)} className="self-start bg-blue-600 text-white text-sm px-4 py-2 rounded-xl">Kontakt anfragen</button>
                  )}
                </div>
              ))}
              {filtered.length === 0 && <p className="text-slate-500">Keine Kandidaten gefunden.</p>}
            </div>
          </div>
        )}

        {view === 'profile' && user && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold mb-6">{adminEditing ? 'Profil bearbeiten (Admin)' : 'Mein Profil'}</h2>
            <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aktuelle / Wunsch-Position(en)</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. Sales Director, Account Executive" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {JOBS.slice(0, 8).map(j => (
                    <button key={j} type="button" onClick={() => setTitle(prev => prev ? prev + ', ' + j : j)} className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full">+ {j}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ort(e)</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="z.B. Hamburg, Remote, Berlin" className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {LOCATIONS.slice(0, 8).map(l => (
                    <button key={l} type="button" onClick={() => setLocation(prev => prev ? prev + ', ' + l : l)} className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full">+ {l}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Berufserfahrung (Jahre)</label>
                  <input type="number" value={experience} onChange={e => setExperience(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Verfügbarkeit</label>
                  <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                    {AVAILABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              {availability === 'datum' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Verfügbar ab</label>
                  <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Wunschgehalt Base (k€)</label>
                  <input type="number" value={salaryBase} onChange={e => setSalaryBase(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">OTE (k€, optional)</label>
                  <input type="number" value={salaryOte} onChange={e => setSalaryOte(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)} />
                <span className="text-sm">Gehalt verhandelbar</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aktuelle Firma (optional)</label>
                <input value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={employed} onChange={e => setEmployed(e.target.checked)} />
                <span className="text-sm">Aktuell angestellt</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills (kommagetrennt)</label>
                <input value={skills} onChange={e => setSkills(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branchen (kommagetrennt)</label>
                <input value={industries} onChange={e => setIndustries(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Weitere Sprachen</label>
                {otherLanguages.map((lang, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input value={lang.name} onChange={e => {
                      const next = [...otherLanguages]
                      next[idx].name = e.target.value
                      setOtherLanguages(next)
                    }} placeholder="Sprache" className="flex-1 p-3 border rounded-xl" />
                    <select value={lang.level} onChange={e => {
                      const next = [...otherLanguages]
                      next[idx].level = e.target.value
                      setOtherLanguages(next)
                    }} className="p-3 border rounded-xl">
                      {LANGUAGE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                ))}
                <button type="button" onClick={() => setOtherLanguages([...otherLanguages, { name: '', level: 'B1' }])} className="text-sm text-blue-600">+ Sprache</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Foto</label>
                <input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploadingPhoto} className="text-sm" />
                {photoUrl && <img src={photoUrl} alt="" className="mt-2 w-24 h-24 rounded-xl object-cover" />}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CV (PDF)</label>
                <input type="file" accept=".pdf" onChange={uploadCv} disabled={uploadingCv} className="text-sm" />
                {cvUrl && <a href={cvUrl} target="_blank" className="text-sm text-blue-600 ml-2">CV ansehen</a>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefonnummer</label>
                <input value={candidatePhone} onChange={e => setCandidatePhone(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} className="rounded" />
                  <span className="text-sm text-slate-700">E-Mail-Benachrichtigungen bei Anfragen & Statusänderungen</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newsletter} onChange={e => setNewsletter(e.target.checked)} className="rounded" />
                  <span className="text-sm text-slate-700">Newsletter (Neuigkeiten & Aktivität auf Job Heroes)</span>
                </label>
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
      </main>
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
