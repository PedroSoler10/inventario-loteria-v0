'use client'

import { topNumeros, topTerminaciones } from '@/lib/analytics-data'

export function RankingTable() {
  const numeros = topNumeros(10)
  const terminaciones = topTerminaciones()
  const maxVendidos = numeros[0]?.vendidos ?? 1
  const maxTerm = terminaciones[0]?.vendidos ?? 1

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground">Ranking de ventas</h2>
        <p className="text-[11px] text-muted-foreground">
          Números y terminaciones con mayor rotación
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.6fr_1fr]">
        {/* Top 10 números */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Top 10 números</span>
            <span>Vendidos</span>
          </div>
          <ol className="flex flex-col">
            {numeros.map((row, i) => (
              <li
                key={row.numero}
                className="flex items-center gap-3 border-b border-border/60 py-1.5 last:border-b-0"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[11px] font-semibold tabular-nums ${
                    i < 3
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="font-mono text-sm font-semibold tracking-wider tabular-nums text-foreground">
                  {row.numero}
                </span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-chart-1"
                    style={{ width: `${(row.vendidos / maxVendidos) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
                  {row.vendidos}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Terminaciones */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Terminación</span>
            <span>Vendidos</span>
          </div>
          <ol className="flex flex-col">
            {terminaciones.slice(0, 10).map((row) => (
              <li
                key={row.digito}
                className="flex items-center gap-3 border-b border-border/60 py-1.5 last:border-b-0"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-background font-mono text-sm font-bold tabular-nums text-foreground">
                  {row.digito}
                </span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-chart-2"
                    style={{ width: `${(row.vendidos / maxTerm) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
                  {row.vendidos}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
