import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, TrendingUp, Building2, Package, Users } from 'lucide-react'

export default function Home() {
  const reportTypes = [
    {
      title: 'DRE',
      description: 'Demonstração do Resultado do Exercício',
      icon: FileText,
      href: '/relatorios?type=DRE',
    },
    {
      title: 'Fluxo de Caixa',
      description: 'Controle de entradas e saídas',
      icon: TrendingUp,
      href: '/relatorios?type=CASH_FLOW',
    },
    {
      title: 'Centro de Custo',
      description: 'Análise por centros de custo',
      icon: Building2,
      href: '/relatorios?type=COST_CENTER',
    },
    {
      title: 'Produtos/Vendas',
      description: 'Relatório de produtos e vendas',
      icon: Package,
      href: '/relatorios?type=PRODUCT_SALES',
    },
    {
      title: 'Clientes',
      description: 'Análise de clientes e compras',
      icon: Users,
      href: '/relatorios?type=CUSTOMER',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Bem-vindo ao SisFin</h1>
        <p className="text-lg text-muted-foreground">
          Sistema completo de gestão financeira com relatórios detalhados
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <report.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={report.href}>
                <Button className="w-full">Ver Relatório</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
