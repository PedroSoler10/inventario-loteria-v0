import Link from 'next/link'
import { BarChart3, Ticket } from 'lucide-react'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { AgotamientoDonut } from '@/components/dashboard/agotamiento-donut'
import { RankingTable } from '@/components/dashboard/ranking-table'

export default function DashboardPage() {
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-foreground">
              Panel de Análisis · Dirección
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Rendimiento de campaña · Sorteo Ordinario del Sábado
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Ticket className="h-4 w-4" aria-hidden="true" />
          Volver al mostrador
        </Link>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
        <div className="lg:col-span-2">
          <TrendChart />
        </div>
        <div className="lg:col-span-1 lg:row-span-1">
          <AgotamientoDonut />
        </div>
        <div className="lg:col-span-3">
          <RankingTable />
        </div>
      </div>
    </main>
  )
}
