import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SisFin - Sistema Financeiro',
  description: 'Sistema de gestão financeira com relatórios completos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-primary">SisFin</h1>
              <p className="text-sm text-muted-foreground">Sistema Financeiro</p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
