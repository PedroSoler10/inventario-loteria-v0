import type { LotteryEntry } from '@/lib/lottery-data'
import { supabase } from '@/lib/supabase'

export type FilterMode = 'exacto' | 'termina' | 'empieza' | 'contiene'

export type InventarioRow = {
  id: number
  numero: string
  estado: string
}

export type InventoryTotals = {
  totalInicial: number
  totalVendidos: number
  totalDisponibles: number
  numeros: number
}

const PAGE_SIZE = 1000

export function aggregateInventory(
  rows: InventarioRow[],
  soldByNumero: Map<string, number> = new Map(),
): LotteryEntry[] {
  const map = new Map<string, LotteryEntry>()
  for (const row of rows) {
    const current = map.get(row.numero) ?? {
      numero: row.numero,
      stockInicial: 0,
      vendidos: 0,
    }
    current.stockInicial += 1
    map.set(row.numero, current)
  }
  return [...map.values()]
    .map((entry) => ({
      ...entry,
      vendidos: soldByNumero.get(entry.numero) ?? 0,
    }))
    .sort((a, b) => a.numero.localeCompare(b.numero))
}

export function totalsFromEntries(entries: LotteryEntry[]): InventoryTotals {
  const totalInicial = entries.reduce((s, e) => s + e.stockInicial, 0)
  const totalVendidos = entries.reduce((s, e) => s + e.vendidos, 0)
  return {
    totalInicial,
    totalVendidos,
    totalDisponibles: Math.max(0, totalInicial - totalVendidos),
    numeros: entries.length,
  }
}

export function applySoldDelta(
  entries: LotteryEntry[],
  numero: string,
  sold: number,
): LotteryEntry[] {
  if (sold === 0) return entries
  return entries.map((entry) => {
    if (entry.numero !== numero) return entry
    const vendidos = Math.min(
      entry.stockInicial,
      Math.max(0, entry.vendidos + sold),
    )
    return { ...entry, vendidos }
  })
}

export function filterInventory(
  entries: LotteryEntry[],
  rawQuery: string,
  mode: FilterMode,
) {
  const q = rawQuery.trim()
  if (!q) return entries
  switch (mode) {
    case 'exacto':
      return entries.filter((e) => e.numero === q.padStart(5, '0'))
    case 'termina':
      return entries.filter((e) => e.numero.endsWith(q))
    case 'empieza':
      return entries.filter((e) => e.numero.startsWith(q))
    case 'contiene':
      return entries.filter((e) => e.numero.includes(q))
  }
}

async function fetchInventarioRows(numero?: string) {
  const rows: InventarioRow[] = []
  let from = 0

  while (true) {
    let request = supabase
      .from('inventario')
      .select('id,numero,estado')
      .order('numero', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (numero) request = request.eq('numero', numero)

    const { data, error } = await request
    if (error) throw error
    const batch = (data ?? []) as InventarioRow[]
    rows.push(...batch)
    if (batch.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return rows
}

async function fetchSoldByNumero(numero?: string) {
  const sold = new Map<string, number>()
  let from = 0

  while (true) {
    let request = supabase
      .from('ventas')
      .select('numero,cantidad')
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (numero) request = request.eq('numero', numero)

    const { data, error } = await request
    if (error) throw error
    const batch = (data ?? []) as { numero: string; cantidad: number }[]
    for (const row of batch) {
      sold.set(row.numero, (sold.get(row.numero) ?? 0) + Number(row.cantidad ?? 0))
    }
    if (batch.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return sold
}

export async function loadInventoryCatalog() {
  const [tickets, soldByNumero] = await Promise.all([
    fetchInventarioRows(),
    fetchSoldByNumero(),
  ])
  return aggregateInventory(tickets, soldByNumero)
}

export async function fetchNumberEntry(numero: string) {
  const [tickets, soldByNumero] = await Promise.all([
    fetchInventarioRows(numero),
    fetchSoldByNumero(numero),
  ])
  return aggregateInventory(tickets, soldByNumero)[0] ?? null
}

export async function searchInventory(rawQuery: string, mode: FilterMode) {
  const catalog = await loadInventoryCatalog()
  return filterInventory(catalog, rawQuery, mode)
}

export async function loadInventoryTotals() {
  return totalsFromEntries(await loadInventoryCatalog())
}

async function pickTickets(numero: string, estado: 'disponible' | 'vendido', amount: number) {
  const ascending = estado === 'disponible'
  const { data, error } = await supabase
    .from('inventario')
    .select('id')
    .eq('numero', numero)
    .eq('estado', estado)
    .order('id', { ascending })
    .limit(amount)

  if (error) throw error
  return (data ?? []).map((row) => row.id as number)
}

export async function setTicketsEstado(
  ids: number[],
  estado: 'disponible' | 'vendido',
) {
  if (ids.length === 0) return 0
  const { data, error } = await supabase
    .from('inventario')
    .update({ estado })
    .in('id', ids)
    .select('id')

  if (error) throw error
  return data?.length ?? ids.length
}

export async function takeDisponibles(numero: string, amount: number) {
  const ids = await pickTickets(numero, 'disponible', amount)
  if (ids.length === 0) return { ids, changed: 0 }
  const changed = await setTicketsEstado(ids, 'vendido')
  return { ids, changed: changed || ids.length }
}

export async function restoreVendidos(numero: string, amount: number) {
  const ids = await pickTickets(numero, 'vendido', amount)
  if (ids.length === 0) return { ids, changed: 0 }
  const changed = await setTicketsEstado(ids, 'disponible')
  return { ids, changed: changed || ids.length }
}

export async function sellTickets(
  numero: string,
  amount: number,
  kind: 'uno' | 'serie',
) {
  const qtyWanted = Math.max(0, Math.floor(amount))
  if (qtyWanted <= 0) return { sold: 0 as const }

  const { ids, changed } = await takeDisponibles(numero, qtyWanted)
  const sold = changed || ids.length
  if (sold === 0) return { sold: 0 as const }

  const { error: insertError } = await supabase.from('ventas').insert({
    numero,
    cantidad: sold,
    tipo_venta: kind === 'serie' ? 'serie' : 'decimo',
  })

  if (insertError) {
    await setTicketsEstado(ids, 'disponible')
    throw insertError
  }

  return { sold }
}

export function subscribeInventory(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout> | null = null
  const schedule = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(onChange, 150)
  }

  const channel = supabase
    .channel(`stock-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'inventario' },
      schedule,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ventas' },
      schedule,
    )
    .subscribe()

  return () => {
    if (timer) clearTimeout(timer)
    void supabase.removeChannel(channel)
  }
}
