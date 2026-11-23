'use client'

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <a href="/" className="text-blue-600 text-sm font-medium hover:underline mb-6 inline-block">← Zurück zu Job Heroes</a>
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Datenschutzerklärung</h1>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. Verantwortlicher</h2>
            <p>
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:<br /><br />
              Dimitry Rachmann<br />
              Julius-Brecht-Straße 21a<br />
              22609 Hamburg<br />
              E-Mail: dimarachmann@aol.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Welche Daten wir verarbeiten</h2>
            <p>Wir verarbeiten folgende personenbezogene Daten:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Registrierungsdaten:</strong> E-Mail-Adresse, Passwort (verschlüsselt), Telefonnummer, optional LinkedIn-Profil</li>
              <li><strong>Profildaten (Kandidaten):</strong> Name, gewünschter Job, Ort, Berufserfahrung, Verfügbarkeit, Wunschgehalt, Bio, Skills, Branchen, Profilfoto, Lebenslauf (PDF), aktueller Arbeitgeber</li>
              <li><strong>Profildaten (Recruiter):</strong> Firmenname, Logo, Beschreibung der gesuchten Positionen, Telefonnummer, LinkedIn</li>
              <li><strong>Nutzungsdaten:</strong> Kontaktanfragen, Profilansichten, Prozessstatus, Benachrichtigungen</li>
              <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Informationen (durch Hosting-Anbieter)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. Zwecke und Rechtsgrundlagen</h2>
            <p>Die Verarbeitung erfolgt auf folgenden Rechtsgrundlagen:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):</strong> Bereitstellung des Job-Portals, Profilverwaltung, Kontaktvermittlung</li>
              <li><strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):</strong> Freiwillige Angaben wie LinkedIn, Bio, Foto, CV</li>
              <li><strong>Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO):</strong> Betriebssicherheit, Missbrauchsprävention, Verbesserung des Dienstes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Speicherung und Löschung</h2>
            <p>
              Deine Daten werden gespeichert, solange dein Konto aktiv ist. Nach Löschung des Kontos werden personenbezogene Daten innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Lebensläufe und Fotos werden aus dem Speicher (Supabase Storage) entfernt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">5. Empfänger der Daten</h2>
            <p>Wir geben Daten nur weiter, wenn dies zur Vertragserfüllung erforderlich ist oder eine Einwilligung vorliegt:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase:</strong> Hosting der Datenbank, Authentifizierung und Dateispeicher (Server in der EU / USA mit Standardvertragsklauseln)</li>
              <li><strong>Vercel:</strong> Hosting der Website</li>
              <li><strong>Andere Nutzer:</strong> Kandidatenprofile sind für angemeldete Recruiter sichtbar (mit Einschränkungen bei noch im Job befindlichen Kandidaten). Kontaktdaten (Telefon, LinkedIn) sind nur für Premium-Recruiter und den Admin sichtbar.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">6. Deine Rechte</h2>
            <p>Du hast folgende Rechte:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
              <li>Beschwerde bei einer Aufsichtsbehörde</li>
            </ul>
            <p>Zur Ausübung deiner Rechte wende dich an: dimarachmann@aol.com</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">7. Cookies und Tracking</h2>
            <p>
              Die Plattform verwendet technisch notwendige Cookies für die Anmeldung (Supabase Auth). Es werden keine Tracking-Cookies oder Analyse-Tools von Drittanbietern eingesetzt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">8. Datensicherheit</h2>
            <p>
              Die Übertragung erfolgt verschlüsselt (HTTPS). Passwörter werden nicht im Klartext gespeichert. Zugriff auf sensible Kontaktdaten ist auf berechtigte Nutzer beschränkt.
            </p>
          </section>

          <p className="text-sm text-slate-500 mt-10">
            Stand: November 2026. Diese Datenschutzerklärung entspricht den Anforderungen der DSGVO.
          </p>
        </div>
      </div>
    </div>
  )
}
