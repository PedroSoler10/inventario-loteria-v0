'use client'

import { Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  applySoldDelta,
  fetchNumberEntry,
  filterInventory,
  loadInventoryCatalog,
  sellTickets,
  subscribeInventory,
  totalsFromEntries,
  type FilterMode,
  type InventoryTotals,
} from '@/lib/inventory'
import type { LotteryEntry } from '@/lib/lottery-data'
import { cn } from '@/lib/utils'
import { ResultsTable, SERIE_SIZE } from './results-table'
import { StatsBar } from './stats-bar'

const FILTERS: { value: FilterMode; label: string }[] = [
  { value: 'exacto', label: 'Exacto' },
  { value: 'termina', label: 'Termina en' },
  { value: 'empieza', label: 'Empieza por' },
  { value: 'contiene', label: 'Contiene' },
]

const EMPTY_TOTALS: InventoryTotals = {
  totalInicial: 0,
  totalVendidos: 0,
  totalDisponibles: 0,
  numeros: 0,
}

function mergeEntry(catalog: LotteryEntry[], entry: LotteryEntry) {
  const exists = catalog.some((item) => item.numero === entry.numero)
  const next = exists
    ? catalog.map((item) => (item.numero === entry.numero ? entry : item))
    : [...catalog, entry]
  return next.sort((a, b) => a.numero.localeCompare(b.numero))
}

export function LotteryTerminal() {
  const [catalog, setCatalog] = useState<LotteryEntry[]>([])
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<FilterMode>('contiene')
  const [activeIndex, setActiveIndex] = useState(0)
  const [flashing, setFlashing] = useState<Record<string, 'uno' | 'serie'>>({})
  const [loading, setLoading] = useState(true)
  const [selling, setSelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)
  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const reloadGen = useRef(0)

  const focusSearch = () => searchRef.current?.focus()

  const reloadCatalog = useCallback(async (silent = false) => {
    const gen = ++reloadGen.current
    if (!silent) setLoading(true)
    try {
      const next = await loadInventoryCatalog()
      if (reloadGen.current !== gen) return
      setCatalog(next)
      setError(null)
    } catch (err) {
      if (reloadGen.current !== gen) return
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo consultar el inventario.',
      )
    } finally {
      if (reloadGen.current === gen) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reloadCatalog()
  }, [reloadCatalog])

  useEffect(() => {
    return subscribeInventory(() => {
      void reloadCatalog(true)
    })
  }, [reloadCatalog])

  const rows = useMemo(() => {
    return filterInventory(catalog, query, mode).map((entry) => ({
      ...entry,
      disponibles: Math.max(0, entry.stockInicial - entry.vendidos),
    }))
  }, [catalog, query, mode])

  const totals = useMemo(
    () => (catalog.length === 0 ? EMPTY_TOTALS : totalsFromEntries(catalog)),
    [catalog],
  )

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

  const sell = async (numero: string, amount: number, kind: 'uno' | 'serie') => {
    if (selling) return
    const current = catalog.find((e) => e.numero === numero)
    const disponibles = current
      ? current.stockInicial - current.vendidos
      : 0
    const qty = Math.min(amount, disponibles)
    if (qty <= 0) {
      requestAnimationFrame(focusSearch)
      return
    }

    setSelling(true)
    setCatalog((prev) => applySoldDelta(prev, numero, qty))

    try {
      const { sold } = await sellTickets(numero, qty, kind)
      if (sold <= 0) {
        setCatalog((prev) => applySoldDelta(prev, numero, -qty))
        return
      }
      if (sold !== qty) {
        setCatalog((prev) => applySoldDelta(prev, numero, sold - qty))
      }
      const fresh = await fetchNumberEntry(numero)
      if (fresh) {
        setCatalog((prev) => mergeEntry(prev, fresh))
      }
      flashRow(numero, kind)
      setError(null)
    } catch (err) {
      setCatalog((prev) => applySoldDelta(prev, numero, -qty))
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la venta.',
      )
    } finally {
      setSelling(false)
      requestAnimationFrame(focusSearch)
    }
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
      if (target) void sell(target.numero, 1, 'uno')
    }
  }

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

      {error ? (
        <div className="border-b border-destructive/30 bg-destructive/10 px-5 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading && catalog.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Consultando inventario…
        </div>
      ) : (
        <ResultsTable
          rows={rows}
          activeIndex={safeActiveIndex}
          flashing={flashing}
          busy={selling}
          onSellOne={(numero) => void sell(numero, 1, 'uno')}
          onSellSerie={(numero) => void sell(numero, SERIE_SIZE, 'serie')}
          onHoverRow={setActiveIndex}
        />
      )}

      <footer className="flex items-center justify-between border-t border-border bg-card px-5 py-1.5 text-[11px] text-muted-foreground">
        <span>
          {loading ? 'Sincronizando… · ' : ''}
          {rows.length.toLocaleString('es-ES')} resultado
          {rows.length === 1 ? '' : 's'}
          {query ? ` · filtro: ${FILTERS.find((f) => f.value === mode)?.label}` : ''}
        </span>
        <span>Serie = {SERIE_SIZE} décimos</span>
      </footer>
    </main>
  )
}
