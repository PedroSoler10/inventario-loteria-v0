export type SaleAction = 'venta-1' | 'venta-serie'

export type VentaRow = {
  id: number
  numero: string
  cantidad: number
  tipo_venta: string
  created_at: string
}

export type Sale = {
  id: string
  createdAt: string
  fecha: string
  hora: string
  accion: SaleAction
  numero: string
  decimos: number
  cantidad: number
}

export const PRECIO_DECIMO = 3

export function accionLabel(accion: SaleAction): string {
  return accion === 'venta-serie' ? 'Venta serie' : 'Venta 1'
}
