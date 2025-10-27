import { formatDate } from '@/lib/utils'
import { DateRange } from '@/types'

interface ReportHeaderProps {
  title: string
  period: DateRange
}

export function ReportHeader({ title, period }: ReportHeaderProps) {
  return (
    <div className="mb-6 border-b pb-4">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Período: {formatDate(period.from)} - {formatDate(period.to)}
        </span>
        <span>•</span>
        <span>Gerado em: {formatDate(new Date())}</span>
      </div>
    </div>
  )
}
