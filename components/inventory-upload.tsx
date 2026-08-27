'use client'

import { FileText, Loader2, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ErrorNotice, SuccessNotice } from './upload-feedback'

type JobStatus = 'processing' | 'success' | 'error'

type Job = {
  id: string
  fileName: string
  status: JobStatus
  billetes?: number
  reason?: string
}

// Simulación: un albarán es válido si es un PDF cuyo nombre sugiere el
// formato oficial de Loterías y Apuestas del Estado (LAE / SELAE).
function validateFile(file: File): { ok: boolean; reason?: string } {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    return { ok: false, reason: 'El archivo no es un PDF.' }
  }
  if (file.size === 0) {
    return { ok: false, reason: 'El PDF está vacío o corrupto.' }
  }
  const name = file.name.toLowerCase()
  const looksOfficial =
    name.includes('albaran') ||
    name.includes('albarán') ||
    name.includes('lae') ||
    name.includes('selae')
  if (!looksOfficial) {
    return {
      ok: false,
      reason: 'No es un albarán oficial de SELAE reconocible.',
    }
  }
  return { ok: true }
}

let counter = 0
const nextId = () => `job-${Date.now()}-${counter++}`

export function InventoryUpload() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const dragDepth = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    const id = nextId()
    setJobs((prev) => [
      { id, fileName: file.name, status: 'processing' },
      ...prev,
    ])

    const { ok, reason } = validateFile(file)

    // Simular el tiempo de análisis y clasificación del albarán.
    window.setTimeout(
      () => {
        setJobs((prev) =>
          prev.map((j) => {
            if (j.id !== id) return j
            if (!ok) return { ...j, status: 'error', reason }
            // Nº de billetes simulado por lote (múltiplos de la serie).
            const billetes = 1000 + Math.floor(Math.random() * 20) * 100 + 52
            return { ...j, status: 'success', billetes }
          }),
        )
      },
      700 + Math.random() * 500,
    )
  }, [])

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      Array.from(files).forEach(processFile)
    },
    [processFile],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragDepth.current = 0
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragDepth.current += 1
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragDepth.current -= 1
    if (dragDepth.current <= 0) setIsDragging(false)
  }, [])

  const dismiss = (id: string) =>
    setJobs((prev) => prev.filter((j) => j.id !== id))

  const totalCargados = jobs
    .filter((j) => j.status === 'success')
    .reduce((s, j) => s + (j.billetes ?? 0), 0)

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-foreground">
              Carga de Inventario
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Backoffice · Loterías y Apuestas del Estado
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-stretch rounded-md border border-border bg-background">
            <div className="flex flex-col justify-center border-r border-border px-4 py-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Albaranes
              </span>
              <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                {jobs.length.toLocaleString('es-ES')}
              </span>
            </div>
            <div className="flex flex-col justify-center px-4 py-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Billetes cargados
              </span>
              <span className="font-mono text-lg font-semibold tabular-nums text-success">
                {totalCargados.toLocaleString('es-ES')}
              </span>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Ir al Mostrador
          </Link>
        </div>
      </header>

      {/* Cuerpo: dropzone centrada + panel de resultados */}
      <div className="grid flex-1 grid-cols-1 gap-5 overflow-hidden p-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Dropzone */}
        <section className="flex items-center justify-center">
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            aria-label="Zona de carga de albaranes PDF. Arrastra archivos o pulsa para seleccionar."
            className={cn(
              'flex h-full max-h-[560px] w-full max-w-2xl cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed p-10 text-center outline-none transition-colors',
              isDragging
                ? 'border-primary bg-accent'
                : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50',
            )}
          >
            <div
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-full transition-colors',
                isDragging
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <UploadCloud className="h-10 w-10" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <p className="text-balance text-xl font-semibold text-foreground">
                Arrastra aquí los albaranes PDF
              </p>
              <p className="text-sm text-muted-foreground">
                o pulsa para seleccionar archivos desde tu equipo
              </p>
            </div>
            <p className="rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
              Solo PDF oficiales de SELAE · procesamiento por lotes
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="sr-only"
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>
        </section>

        {/* Panel de resultados / feedback */}
        <section className="flex min-h-0 flex-col rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h2 className="text-sm font-semibold text-foreground">
              Actividad de carga
            </h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              {jobs.length.toLocaleString('es-ES')} en cola
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {jobs.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <FileText className="h-8 w-8 opacity-40" aria-hidden="true" />
                <p className="text-sm">Aún no se han cargado albaranes.</p>
                <p className="text-xs">
                  Los resultados aparecerán aquí en tiempo real.
                </p>
              </div>
            ) : (
              jobs.map((job) => {
                if (job.status === 'processing') {
                  return (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3"
                    >
                      <Loader2
                        className="h-5 w-5 shrink-0 animate-spin text-primary"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="text-sm font-medium text-foreground">
                          Analizando y clasificando…
                        </p>
                        <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                          {job.fileName}
                        </p>
                      </div>
                    </div>
                  )
                }
                if (job.status === 'success') {
                  return (
                    <SuccessNotice
                      key={job.id}
                      billetes={job.billetes ?? 0}
                      albaran={job.fileName}
                      onDismiss={() => dismiss(job.id)}
                    />
                  )
                }
                return (
                  <ErrorNotice
                    key={job.id}
                    fileName={job.fileName}
                    reason={job.reason ?? 'Archivo no válido.'}
                    onDismiss={() => dismiss(job.id)}
                  />
                )
              })
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
