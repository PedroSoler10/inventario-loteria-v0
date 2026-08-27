'use client'

import { Search } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { LOTTERY_DATA, type LotteryEntry } from '@/lib/lottery-data'
import { cn } from '@/lib/utils'
import { ResultsTable, SERIE_SIZE } from './results-table'
import { StatsBar } from './stats-bar'

type FilterMode = 'exacto' | 'termina' | 'empieza' | 'contiene'

const FILTERS: { value: FilterMode; label: string }[] = [
  { value: 'exacto', label: 'Exacto' },
  { value: 'termina', label: 'Termina en' },
  { value: 'empieza', label: 'Empieza por' },
  { value: 'contiene', label: 'Contiene' },
]

export function LotteryTerminal() {
  const [entries, setEntries] = useState<LotteryEntry[]>(LOTTERY_DATA)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<FilterMode>('contiene')
  const [activeIndex, setActiveIndex] = useState(0)
  const [flashing, setFlashing] = useState<Record<string, 'uno' | 'serie'>>({})

  const searchRef = useRef<HTMLInputElement>(null)
  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const focusSearch = () => searchRef.current?.focus()

  const rows = useMemo(() => {
    const q = query.trim()
    const filtered = entries.filter((e) => {
      if (!q) return true
      switch (mode) {
        case 'exacto':
          return e.numero === q
        case 'termina':
          return e.numero.endsWith(q)
        case 'empieza':
          return e.numero.startsWith(q)
        case 'contiene':
          return e.numero.includes(q)
      }
    })
    return filtered.map((e) => ({
      ...e,
      disponibles: e.stockInicial - e.vendidos,
    }))
  }, [entries, query, mode])

  const totals = useMemo(() => {
    const totalInicial = entries.reduce((s, e) => s + e.stockInicial, 0)
    const totalVendidos = entries.reduce((s, e) => s + e.vendidos, 0)
    return {
      totalInicial,
      totalVendidos,
      totalDisponibles: totalInicial - totalVendidos,
      numeros: entries.length,
    }
  }, [entries])

  const flashRow = (numero: string, kind: 'uno' | 'serie') => {
    if (flashTimers.current[numero]) clearTimeout(flashTimers.current[numero])
    setFlashing((prev) => ({ ...prev, [numero]: kind }))
    flashTimers.current[numero] = setTimeout(() => {
      setFlashing((prev) => {
        const next = { ...prev }
        delete next[numero]
        return next
      })
    }, 1000)
  }

  const sell = (numero: string, amount: number, kind: 'uno' | 'serie') => {
    let didSell = false
    setEntries((prev) =>
      prev.map((e) => {
        if (e.numero !== numero) return e
        const disponibles = e.stockInicial - e.vendidos
        const qty = Math.min(amount, disponibles)
        if (qty <= 0) return e
        didSell = true
        return { ...e, vendidos: e.vendidos + qty }
      }),
    )
    if (didSell) flashRow(numero, kind)
    // El foco siempre vuelve a la barra de búsqueda tras una acción.
    requestAnimationFrame(focusSearch)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, rows.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const target = rows[activeIndex] ?? rows[0]
      if (target) sell(target.numero, 1, 'uno')
    }
  }

  // Mantener el índice activo dentro de rango al cambiar la búsqueda.
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, rows.length - 1))

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background">
      <StatsBar {...totals} />

      <section className="border-b border-border bg-card px-5 py-4">
        <div className="mx-auto w-full max-w-3xl">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value.replace(/\D/g, ''))
                setActiveIndex(0)
              }}
              onKeyDown={handleSearchKeyDown}
              inputMode="numeric"
              placeholder="Buscar número…  (Enter para vender · ↑ ↓ para navegar)"
              aria-label="Buscar número de lotería"
              className="h-14 w-full rounded-lg border border-border bg-background pl-12 pr-4 font-mono text-2xl font-semibold tabular-nums tracking-widest text-foreground shadow-sm outline-none transition-shadow placeholder:text-base placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <fieldset className="mt-3 flex items-center justify-center gap-2">
            <legend className="sr-only">Modo de búsqueda</legend>
            {FILTERS.map((f) => {
              const checked = mode === f.value
              return (
                <label
                  key={f.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md border px-3.5 py-1.5 text-sm font-medium transition-colors',
                    checked
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted',
                  )}
                >
                  <input
                    type="radio"
                    name="filter-mode"
                    value={f.value}
                    checked={checked}
                    onChange={() => {
                      setMode(f.value)
                      setActiveIndex(0)
                      focusSearch()
                    }}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  {f.label}
                </label>
              )
            })}
          </fieldset>
        </div>
      </section>

      <ResultsTable
        rows={rows}
        activeIndex={safeActiveIndex}
        flashing={flashing}
        onSellOne={(numero) => sell(numero, 1, 'uno')}
        onSellSerie={(numero) => sell(numero, SERIE_SIZE, 'serie')}
        onHoverRow={setActiveIndex}
      />

      <footer className="flex items-center justify-between border-t border-border bg-card px-5 py-1.5 text-[11px] text-muted-foreground">
        <span>
          {rows.length.toLocaleString('es-ES')} resultado
          {rows.length === 1 ? '' : 's'}
          {query ? ` · filtro: ${FILTERS.find((f) => f.value === mode)?.label}` : ''}
        </span>
        <span>Serie = {SERIE_SIZE} billetes</span>
      </footer>
    </main>
  )
}
