import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">SisFin</h1>
          <p className="text-xl text-muted-foreground">
            Sistema de Gestão Financeira com MRR
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Produtos e MRR</CardTitle>
              <CardDescription>
                Gerencie seus produtos e acompanhe a receita recorrente mensal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Cadastro de produtos únicos e recorrentes (MRR)</li>
                <li>• Cálculo automático de MRR e ARR</li>
                <li>• Evolução mensal e indicadores de crescimento</li>
                <li>• Vinculação com transações de receita</li>
              </ul>
              <Link href="/produtos">
                <Button className="w-full">Acessar Produtos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Em Desenvolvimento</CardTitle>
              <CardDescription>
                Mais funcionalidades em breve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Gestão de transações</li>
                <li>• Controle de clientes</li>
                <li>• Centros de custo</li>
                <li>• Metas financeiras</li>
              </ul>
              <Button className="w-full" variant="secondary" disabled>
                Em Breve
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tecnologias Utilizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <div className="font-semibold">Next.js 14</div>
                <div className="text-xs text-muted-foreground">Frontend</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold">Prisma ORM</div>
                <div className="text-xs text-muted-foreground">Database</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold">PostgreSQL</div>
                <div className="text-xs text-muted-foreground">Database</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold">Tailwind CSS</div>
                <div className="text-xs text-muted-foreground">Styling</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
