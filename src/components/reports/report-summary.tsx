import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SummaryItem {
  label: string
  value: string | number
  icon?: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

interface ReportSummaryProps {
  title: string
  items: SummaryItem[]
}

export function ReportSummary({ title, items }: ReportSummaryProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  item.variant === 'success'
                    ? 'text-green-600'
                    : item.variant === 'danger'
                    ? 'text-red-600'
                    : item.variant === 'warning'
                    ? 'text-yellow-600'
                    : ''
                }`}
              >
                {typeof item.value === 'number' ? formatCurrency(item.value) : item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
