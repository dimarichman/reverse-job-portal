import './globals.css'

export const metadata = {
  title: 'Job Heroes',
  description: 'Umgekehrtes Job-Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
