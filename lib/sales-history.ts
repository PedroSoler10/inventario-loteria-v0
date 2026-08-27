export type SaleAction = 'venta-1' | 'venta-serie'

export type Sale = {
  id: string
  hora: string // HH:MM:SS
  accion: SaleAction
  numero: string
  decimos: number
  cantidad: number // euros
  anulada: boolean
}

// Precio oficial del décimo (sorteo ordinario).
export const PRECIO_DECIMO = 3

// Ventas simuladas del día actual, ordenadas por hora.
export const SEED_SALES: Sale[] = [
  { id: 's-01', hora: '08:12:04', accion: 'venta-1', numero: '24680', decimos: 1, cantidad: 3, anulada: false },
  { id: 's-02', hora: '08:31:47', accion: 'venta-serie', numero: '55555', decimos: 10, cantidad: 30, anulada: false },
  { id: 's-03', hora: '09:02:19', accion: 'venta-1', numero: '13000', decimos: 2, cantidad: 6, anulada: false },
  { id: 's-04', hora: '09:44:55', accion: 'venta-1', numero: '77777', decimos: 3, cantidad: 9, anulada: false },
  { id: 's-05', hora: '10:05:31', accion: 'venta-serie', numero: '12345', decimos: 10, cantidad: 30, anulada: false },
  { id: 's-06', hora: '10:38:12', accion: 'venta-1', numero: '00007', decimos: 1, cantidad: 3, anulada: false },
  { id: 's-07', hora: '11:14:08', accion: 'venta-1', numero: '42195', decimos: 5, cantidad: 15, anulada: false },
  { id: 's-08', hora: '11:52:40', accion: 'venta-serie', numero: '99999', decimos: 10, cantidad: 30, anulada: false },
  { id: 's-09', hora: '12:20:03', accion: 'venta-1', numero: '31415', decimos: 2, cantidad: 6, anulada: false },
  { id: 's-10', hora: '12:47:29', accion: 'venta-1', numero: '88888', decimos: 4, cantidad: 12, anulada: false },
  { id: 's-11', hora: '13:09:51', accion: 'venta-1', numero: '27182', decimos: 1, cantidad: 3, anulada: false },
  { id: 's-12', hora: '13:38:16', accion: 'venta-serie', numero: '11111', decimos: 10, cantidad: 30, anulada: false },
  { id: 's-13', hora: '14:01:44', accion: 'venta-1', numero: '54321', decimos: 3, cantidad: 9, anulada: false },
  { id: 's-14', hora: '14:35:22', accion: 'venta-1', numero: '67890', decimos: 2, cantidad: 6, anulada: false },
]

export function accionLabel(accion: SaleAction): string {
  return accion === 'venta-serie' ? 'Venta serie' : 'Venta 1'
}
