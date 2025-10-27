import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">SisFin - Sistema Financeiro</h1>
        <div className="space-y-4">
          <Link
            href="/centros-custo"
            className="block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Gestão de Centros de Custo
          </Link>
        </div>
      </div>
    </main>
  )
}
