'use client'

import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type SuccessProps = {
  billetes: number
  albaran?: string
  onDismiss?: () => void
}

export function SuccessNotice({ billetes, albaran, onDismiss }: SuccessProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-success/40 bg-success-muted px-4 py-3',
        'animate-in fade-in slide-in-from-top-2 duration-300',
      )}
    >
      <CheckCircle2
        className="mt-0.5 h-5 w-5 shrink-0 text-success"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-sm font-semibold text-success">
          Éxito: {billetes.toLocaleString('es-ES')} billetes cargados y
          clasificados
        </p>
        {albaran ? (
          <p className="mt-0.5 truncate font-mono text-xs text-success/80">
            {albaran}
          </p>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Descartar notificación"
          className="rounded p-0.5 text-success/70 transition-colors hover:bg-success/10 hover:text-success"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

type ErrorProps = {
  fileName?: string
  reason: string
  onDismiss?: () => void
}

export function ErrorNotice({ fileName, reason, onDismiss }: ErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3',
        'animate-in fade-in slide-in-from-top-2 duration-300',
      )}
    >
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-sm font-semibold text-destructive">
          Error: no se pudo procesar el albarán
        </p>
        <p className="mt-0.5 text-xs text-destructive/85">{reason}</p>
        {fileName ? (
          <p className="mt-0.5 truncate font-mono text-xs text-destructive/70">
            {fileName}
          </p>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Descartar notificación"
          className="rounded p-0.5 text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
