'use client'

import { useEffect, useRef, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { accionLabel, PRECIO_DECIMO, type Sale } from '@/lib/sales-history'

type EditSaleModalProps = {
  sale: Sale
  saving?: boolean
  onClose: () => void
  onSave: (patch: { numero: string; decimos: number }) => void | Promise<void>
}

export function EditSaleModal({ sale, saving = false, onClose, onSave }: EditSaleModalProps) {
  const [numero, setNumero] = useState(sale.numero)
  const [decimos, setDecimos] = useState(String(sale.decimos))
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstFieldRef.current?.focus()
    firstFieldRef.current?.select()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const decimosNum = Number(decimos)
  const numeroValido = /^\d{5}$/.test(numero)
  const decimosValido = Number.isInteger(decimosNum) && decimosNum >= 1 && decimosNum <= 10
  const valido = numeroValido && decimosValido
  const nuevoImporte = decimosValido ? decimosNum * PRECIO_DECIMO : 0
  const cambioImporte = nuevoImporte - sale.cantidad

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valido || saving) return
    await onSave({ numero, decimos: decimosNum })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-sale-title"
        className={cn(
          'w-full max-w-md rounded-lg border border-border bg-card shadow-2xl',
          'animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <h2 id="edit-sale-title" className="text-sm font-semibold text-foreground">
                Corregir venta
              </h2>
              <p className="font-mono text-[11px] text-muted-foreground">
                {sale.fecha} {sale.hora} · {accionLabel(sale.accion)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label
                htmlFor="edit-numero"
                className="mb-1 block text-xs font-medium text-muted-foreground"
              >
                Corregir dígito del número
              </label>
              <input
                ref={firstFieldRef}
                id="edit-numero"
                inputMode="numeric"
                maxLength={5}
                value={numero}
                onChange={(e) => setNumero(e.target.value.replace(/\D/g, '').slice(0, 5))}
                className={cn(
                  'w-full rounded-md border bg-background px-3 py-2 font-mono text-lg tracking-[0.3em] tabular-nums text-foreground outline-none',
                  'focus:ring-2 focus:ring-ring',
                  numeroValido ? 'border-border' : 'border-destructive',
                )}
              />
              {!numeroValido ? (
                <p className="mt-1 text-[11px] text-destructive">
                  El número debe tener 5 dígitos.
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="edit-decimos"
                className="mb-1 block text-xs font-medium text-muted-foreground"
              >
                Cantidad vendida (décimos)
              </label>
              <input
                id="edit-decimos"
                inputMode="numeric"
                value={decimos}
                onChange={(e) => setDecimos(e.target.value.replace(/\D/g, '').slice(0, 2))}
                className={cn(
                  'w-full rounded-md border bg-background px-3 py-2 font-mono text-lg tabular-nums text-foreground outline-none',
                  'focus:ring-2 focus:ring-ring',
                  decimosValido ? 'border-border' : 'border-destructive',
                )}
              />
              {!decimosValido ? (
                <p className="mt-1 text-[11px] text-destructive">Entre 1 y 10.</p>
              ) : null}
            </div>

            <div>
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Nuevo importe
              </span>
              <div className="rounded-md border border-border bg-muted px-3 py-2 font-mono text-lg tabular-nums text-foreground">
                {nuevoImporte.toLocaleString('es-ES')} €
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs">
            <span className="text-muted-foreground">Ajuste de caja</span>
            <span
              className={cn(
                'font-mono font-semibold tabular-nums',
                cambioImporte === 0
                  ? 'text-muted-foreground'
                  : cambioImporte > 0
                    ? 'text-success'
                    : 'text-destructive',
              )}
            >
              {cambioImporte > 0 ? '+' : ''}
              {cambioImporte.toLocaleString('es-ES')} €
            </span>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!valido || saving}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                valido && !saving
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'cursor-not-allowed bg-muted text-muted-foreground',
              )}
            >
              {saving ? 'Guardando…' : 'Guardar corrección'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
