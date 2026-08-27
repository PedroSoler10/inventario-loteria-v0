import { LOTTERY_DATA } from './lottery-data'

// --- Stock global (agotamiento) ---
export function stockSummary() {
  const stockInicial = LOTTERY_DATA.reduce((s, e) => s + e.stockInicial, 0)
  const vendidos = LOTTERY_DATA.reduce((s, e) => s + e.vendidos, 0)
  const disponibles = stockInicial - vendidos
  const pct = Math.round((vendidos / stockInicial) * 100)
  return { stockInicial, vendidos, disponibles, pct }
}

// --- Tendencia de ventas (últimas ~6 semanas de campaña) ---
export type TrendPoint = {
  periodo: string
  billetes: number
  euros: number
}

export const SALES_TREND: TrendPoint[] = [
  { periodo: 'Sem 1', billetes: 142, euros: 426 },
  { periodo: 'Sem 2', billetes: 208, euros: 624 },
  { periodo: 'Sem 3', billetes: 301, euros: 903 },
  { periodo: 'Sem 4', billetes: 389, euros: 1167 },
  { periodo: 'Sem 5', billetes: 512, euros: 1536 },
  { periodo: 'Sem 6', billetes: 704, euros: 2112 },
]

// --- Ranking Top 10 números más vendidos ---
export type RankRow = {
  numero: string
  vendidos: number
  stockInicial: number
  pctVendido: number
}

export function topNumeros(limit = 10): RankRow[] {
  return [...LOTTERY_DATA]
    .map((e) => ({
      numero: e.numero,
      vendidos: e.vendidos,
      stockInicial: e.stockInicial,
      pctVendido: Math.round((e.vendidos / e.stockInicial) * 100),
    }))
    .sort((a, b) => b.vendidos - a.vendidos)
    .slice(0, limit)
}

// --- Ranking de terminaciones (último dígito) más vendidas ---
export type TerminacionRow = {
  digito: string
  vendidos: number
}

export function topTerminaciones(): TerminacionRow[] {
  const acc = new Map<string, number>()
  for (const e of LOTTERY_DATA) {
    const d = e.numero.slice(-1)
    acc.set(d, (acc.get(d) ?? 0) + e.vendidos)
  }
  return [...acc.entries()]
    .map(([digito, vendidos]) => ({ digito, vendidos }))
    .sort((a, b) => b.vendidos - a.vendidos)
}
