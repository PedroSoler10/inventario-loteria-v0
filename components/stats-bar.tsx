import { Ticket } from 'lucide-react'
import Link from 'next/link'

type StatsBarProps = {
  totalInicial: number
  totalVendidos: number
  totalDisponibles: number
  numeros: number
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'primary' | 'success' | 'default'
}) {
  const valueColor =
    accent === 'success'
      ? 'text-success'
      : accent === 'primary'
        ? 'text-primary'
        : 'text-foreground'
  return (
    <div className="flex flex-col justify-center px-4 py-1.5 border-l border-border first:border-l-0">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={`font-mono text-lg font-semibold tabular-nums ${valueColor}`}>
        {value}
      </span>
    </div>
  )
}

export function StatsBar({
  totalInicial,
  totalVendidos,
  totalDisponibles,
  numeros,
}: StatsBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-5 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Ticket className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-semibold text-foreground">
            Administración de Lotería
          </h1>
          <p className="text-[11px] text-muted-foreground">
            Mostrador · Sorteo Ordinario del Sábado
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-stretch rounded-md border border-border bg-background">
          <Stat label="Números" value={numeros.toLocaleString('es-ES')} />
          <Stat
            label="Stock inicial"
            value={totalInicial.toLocaleString('es-ES')}
          />
          <Stat
            label="Vendidos"
            value={totalVendidos.toLocaleString('es-ES')}
            accent="primary"
          />
          <Stat
            label="Disponibles"
            value={totalDisponibles.toLocaleString('es-ES')}
            accent="success"
          />
        </div>
        <Link
          href="/inventario"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Carga de Inventario
        </Link>
      </div>
    </header>
  )
}
