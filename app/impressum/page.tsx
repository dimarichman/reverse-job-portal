'use client'

export default function Impressum() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <a href="/" className="text-blue-600 text-sm font-medium hover:underline mb-6 inline-block">← Zurück zu Job Heroes</a>
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Impressum</h1>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">Angaben gemäß § 5 TMG</h2>
            <p>
              Dimitry Rachmann<br />
              [Straße und Hausnummer]<br />
              [PLZ] Hamburg<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Kontakt</h2>
            <p>
              E-Mail: dimarachmann@aol.com<br />
              Telefon: [Telefonnummer]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
              Dimitry Rachmann<br />
              [Adresse wie oben]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Plattform</h2>
            <p>
              Job Heroes – Umgekehrtes Job-Portal<br />
              https://reverse-job-portal.vercel.app
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Haftung für Inhalte</h2>
            <p>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          <p className="text-sm text-slate-500 mt-10">
            Bitte ersetze die Platzhalter in eckigen Klammern durch deine vollständigen Angaben. Dieses Impressum entspricht den Anforderungen des deutschen Telemediengesetzes (TMG).
          </p>
        </div>
      </div>
    </div>
  )
}
