'use client'

import { Check, Layers, Plus } from 'lucide-react'
import type { LotteryEntry } from '@/lib/lottery-data'
import { cn } from '@/lib/utils'

export const SERIE_SIZE = 10

type Row = LotteryEntry & { disponibles: number }

type ResultsTableProps = {
  rows: Row[]
  activeIndex: number
  flashing: Record<string, 'uno' | 'serie'>
  onSellOne: (numero: string) => void
  onSellSerie: (numero: string) => void
  onHoverRow: (index: number) => void
}

function stockTone(disponibles: number, inicial: number) {
  if (disponibles === 0) return 'text-destructive'
  if (disponibles <= Math.max(2, inicial * 0.15)) return 'text-warning'
  return 'text-success'
}

export function ResultsTable({
  rows,
  activeIndex,
  flashing,
  onSellOne,
  onSellSerie,
  onHoverRow,
}: ResultsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Sin resultados para la búsqueda actual.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-secondary text-secondary-foreground">
            <th className="w-[16%] border-b border-border px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider">
              Número
            </th>
            <th className="w-[13%] border-b border-border px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider">
              Stock Inicial
            </th>
            <th className="w-[13%] border-b border-border px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider">
              Vendidos
            </th>
            <th className="w-[13%] border-b border-border px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider">
              Disponibles
            </th>
            <th className="border-b border-border px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const flash = flashing[row.numero]
            const isActive = index === activeIndex
            const soldOut = row.disponibles === 0
            const noSerie = row.disponibles < SERIE_SIZE
            return (
              <tr
                key={row.numero}
                onMouseEnter={() => onHoverRow(index)}
                className={cn(
                  'group relative transition-colors',
                  index % 2 === 1 && 'bg-muted/40',
                  isActive && 'bg-accent',
                  flash && 'bg-success-muted',
                )}
              >
                <td className="border-b border-border px-4 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-semibold tabular-nums tracking-wider text-foreground">
                      {row.numero}
                    </span>
                    {flash && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-success px-1.5 py-0.5 text-[10px] font-semibold text-success-foreground animate-in zoom-in-50 fade-in duration-200"
                        role="status"
                      >
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                        {flash === 'serie' ? '+ serie' : 'vendido'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="border-b border-border px-4 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                  {row.stockInicial}
                </td>
                <td className="border-b border-border px-4 py-1.5 text-right font-mono tabular-nums text-foreground">
                  {row.vendidos}
                </td>
                <td
                  className={cn(
                    'border-b border-border px-4 py-1.5 text-right font-mono text-base font-semibold tabular-nums',
                    stockTone(row.disponibles, row.stockInicial),
                  )}
                >
                  {row.disponibles}
                </td>
                <td className="border-b border-border px-3 py-1.5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onSellOne(row.numero)}
                      disabled={soldOut}
                      className="inline-flex w-28 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                      Vender 1
                    </button>
                    <button
                      type="button"
                      onClick={() => onSellSerie(row.numero)}
                      disabled={noSerie}
                      className="inline-flex w-32 items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-card px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Layers className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                      Vender Serie
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
