import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  if (!RESEND_API_KEY) {
    return json({ error: 'RESEND_API_KEY fehlt' }, 500)
  }

  try {
    const { to, subject, html } = await req.json()
    if (!to || !subject || !html) {
      return json({ error: 'Missing to, subject or html' }, 400)
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Job Heroes <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return json({ error: data?.message || 'Resend hat abgelehnt', details: data }, 400)
    }
    return json(data)
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})
