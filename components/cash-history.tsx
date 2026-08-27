'use client'

import { useEffect, useRef, useState } from 'react'
import { Pencil, RotateCcw, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  accionLabel,
  PRECIO_DECIMO,
  SEED_SALES,
  type Sale,
} from '@/lib/sales-history'
import { EditSaleModal } from '@/components/edit-sale-modal'

function DescuadreStat({ value }: { value: number }) {
  const cuadrada = value === 0
  return (
    <div className="flex items-stretch rounded-md border border-border bg-background">
      <div className="flex flex-col justify-center px-4 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Descuadre de caja
        </span>
        <span
          className={cn(
            'font-mono text-lg font-semibold tabular-nums',
            cuadrada ? 'text-success' : 'text-destructive',
          )}
        >
          {value > 0 ? '+' : ''}
          {value.toLocaleString('es-ES')} €
        </span>
      </div>
      <div className="flex items-center border-l border-border px-3">
        <span
          className={cn(
            'rounded px-2 py-0.5 text-[11px] font-semibold',
            cuadrada
              ? 'bg-success-muted text-success'
              : 'bg-destructive/15 text-destructive',
          )}
        >
          {cuadrada ? 'Caja cuadrada' : 'Revisar'}
        </span>
      </div>
    </div>
  )
}

export function CashHistory() {
  const [sales, setSales] = useState<Sale[]>(SEED_SALES)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Sale | null>(null)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current)
    }
  }, [])

  // Descuadre: importe esperado (ventas activas) menos el efectivo teórico.
  // En esta simulación la caja cuadra a cero cuando todo coincide.
  const totalActivo = sales
    .filter((s) => !s.anulada)
    .reduce((acc, s) => acc + s.cantidad, 0)
  const totalAnulado = sales
    .filter((s) => s.anulada)
    .reduce((acc, s) => acc + s.cantidad, 0)
  const descuadre = 0 // trazabilidad completa: anulaciones y correcciones ajustan la caja

  function requestAnular(id: string) {
    setConfirmingId(id)
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
    // La micro-confirmación se auto-cancela tras 1 segundo si no se confirma.
    confirmTimer.current = setTimeout(() => {
      setConfirmingId((current) => (current === id ? null : current))
    }, 1000)
  }

  function confirmAnular(id: string) {
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
    setConfirmingId(null)
    setSales((prev) =>
      prev.map((s) => (s.id === id ? { ...s, anulada: true } : s)),
    )
  }

  function restaurar(id: string) {
    setSales((prev) =>
      prev.map((s) => (s.id === id ? { ...s, anulada: false } : s)),
    )
  }

  function saveEdit(id: string, patch: { numero: string; decimos: number }) {
    setSales((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              numero: patch.numero,
              decimos: patch.decimos,
              cantidad: patch.decimos * PRECIO_DECIMO,
              accion: patch.decimos >= 10 ? 'venta-serie' : 'venta-1',
            }
          : s,
      ),
    )
    setEditing(null)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-5 py-2.5">
        <div className="leading-tight">
          <h1 className="text-sm font-semibold text-foreground">
            Historial de Caja y Correcciones
          </h1>
          <p className="text-[11px] text-muted-foreground">
            Trazabilidad del día · {sales.filter((s) => !s.anulada).length} ventas activas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DescuadreStat value={descuadre} />
          <Link
            href="/"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Volver al Mostrador
          </Link>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-auto px-5 py-4">
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 font-medium">Hora</th>
                <th className="px-4 py-2 font-medium">Acción</th>
                <th className="px-4 py-2 font-medium">Número</th>
                <th className="px-4 py-2 text-right font-medium">Décimos</th>
                <th className="px-4 py-2 text-right font-medium">Cantidad</th>
                <th className="px-4 py-2 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const isConfirming = confirmingId === sale.id
                return (
                  <tr
                    key={sale.id}
                    className={cn(
                      'border-t border-border transition-colors',
                      sale.anulada
                        ? 'bg-destructive/5 text-muted-foreground'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <td className="px-4 py-2 font-mono tabular-nums text-muted-foreground">
                      {sale.hora}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[11px] font-medium',
                          sale.accion === 'venta-serie'
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted text-foreground',
                        )}
                      >
                        {accionLabel(sale.accion)}
                      </span>
                    </td>
                    <td
                      className={cn(
                        'px-4 py-2 font-mono text-base tracking-widest tabular-nums',
                        sale.anulada
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground',
                      )}
                    >
                      {sale.numero}
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">
                      {sale.decimos}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-2 text-right font-mono font-semibold tabular-nums',
                        sale.anulada
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground',
                      )}
                    >
                      {sale.cantidad.toLocaleString('es-ES')} €
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1.5">
                        {sale.anulada ? (
                          <button
                            type="button"
                            onClick={() => restaurar(sale.id)}
                            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                            Restaurar
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditing(sale)}
                              aria-label={`Modificar venta de las ${sale.hora}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            {isConfirming ? (
                              <button
                                type="button"
                                onClick={() => confirmAnular(sale.id)}
                                className={cn(
                                  'flex items-center gap-1.5 rounded-md border border-destructive bg-destructive px-2.5 py-1.5 text-xs font-semibold text-destructive-foreground',
                                  'animate-in fade-in zoom-in-95 duration-150',
                                )}
                              >
                                ¿Anular venta?
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => requestAnular(sale.id)}
                                aria-label={`Anular venta de las ${sale.hora}`}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Total activo:{' '}
            <span className="font-mono font-semibold text-foreground">
              {totalActivo.toLocaleString('es-ES')} €
            </span>
          </span>
          <span>
            Anulado:{' '}
            <span className="font-mono font-semibold text-destructive">
              {totalAnulado.toLocaleString('es-ES')} €
            </span>
          </span>
          <span className="text-muted-foreground/70">
            Precio del décimo: {PRECIO_DECIMO} €
          </span>
        </div>
      </main>

      {editing ? (
        <EditSaleModal
          sale={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => saveEdit(editing.id, patch)}
        />
      ) : null}
    </div>
  )
}
