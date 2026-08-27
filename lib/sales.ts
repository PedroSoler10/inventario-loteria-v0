import { restoreVendidos, takeDisponibles } from '@/lib/inventory'
import {
  PRECIO_DECIMO,
  type Sale,
  type SaleAction,
  type VentaRow,
} from '@/lib/sales-history'
import { supabase } from '@/lib/supabase'

const madridDate = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const madridTime = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function tipoToAccion(tipo: string, cantidad: number): SaleAction {
  return tipo === 'serie' || cantidad >= 10 ? 'venta-serie' : 'venta-1'
}

export function mapVenta(row: VentaRow): Sale {
  const created = new Date(row.created_at)
  return {
    id: String(row.id),
    createdAt: row.created_at,
    fecha: madridDate.format(created),
    hora: madridTime.format(created),
    accion: tipoToAccion(row.tipo_venta, row.cantidad),
    numero: row.numero,
    decimos: row.cantidad,
    cantidad: row.cantidad * PRECIO_DECIMO,
  }
}

export async function loadSales() {
  const { data, error } = await supabase
    .from('ventas')
    .select('id,numero,cantidad,tipo_venta,created_at')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  if (error) throw error
  return ((data ?? []) as VentaRow[]).map(mapVenta)
}

export async function deleteSale(sale: Sale) {
  const { changed } = await restoreVendidos(sale.numero, sale.decimos)
  if (changed < sale.decimos) {
    throw new Error(
      `Solo se pudieron devolver ${changed} de ${sale.decimos} décimos al inventario.`,
    )
  }

  const { data, error } = await supabase
    .from('ventas')
    .delete()
    .eq('id', Number(sale.id))
    .select('id')

  if (error) {
    await takeDisponibles(sale.numero, changed)
    throw error
  }
  if (!data?.length) {
    await takeDisponibles(sale.numero, changed)
    throw new Error(
      'No se pudo borrar la venta. Revisa los permisos de borrado en la tabla ventas.',
    )
  }
}

export async function updateSale(
  sale: Sale,
  patch: { numero: string; decimos: number },
) {
  const nextNumero = patch.numero.padStart(5, '0')
  const nextQty = patch.decimos
  const sameNumber = nextNumero === sale.numero

  if (sameNumber && nextQty === sale.decimos) return

  if (sameNumber && nextQty < sale.decimos) {
    const { changed } = await restoreVendidos(sale.numero, sale.decimos - nextQty)
    if (changed !== sale.decimos - nextQty) {
      throw new Error('No hay suficientes décimos vendidos para reducir esta venta.')
    }
  } else if (sameNumber && nextQty > sale.decimos) {
    const extra = nextQty - sale.decimos
    const { changed } = await takeDisponibles(sale.numero, extra)
    if (changed !== extra) {
      if (changed > 0) await restoreVendidos(sale.numero, changed)
      throw new Error(
        `No hay stock suficiente del ${sale.numero}. Faltan ${extra - changed} décimos.`,
      )
    }
  } else {
    const restored = await restoreVendidos(sale.numero, sale.decimos)
    if (restored.changed < sale.decimos) {
      if (restored.changed > 0) {
        await takeDisponibles(sale.numero, restored.changed)
      }
      throw new Error('No se pudo devolver el stock del número original.')
    }

    const taken = await takeDisponibles(nextNumero, nextQty)
    if (taken.changed !== nextQty) {
      if (taken.changed > 0) await restoreVendidos(nextNumero, taken.changed)
      await takeDisponibles(sale.numero, sale.decimos)
      throw new Error(
        `No hay stock suficiente del ${nextNumero}. Disponibles: ${taken.changed}.`,
      )
    }
  }

  const { data, error } = await supabase
    .from('ventas')
    .update({
      numero: nextNumero,
      cantidad: nextQty,
      tipo_venta: nextQty >= 10 ? 'serie' : 'decimo',
    })
    .eq('id', Number(sale.id))
    .select('id')

  if (error) throw error
  if (!data?.length) {
    throw new Error(
      'No se pudo actualizar la venta. Revisa los permisos de edición en la tabla ventas.',
    )
  }
}

export function subscribeSales(onChange: () => void) {
  const channel = supabase
    .channel(`ventas-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ventas' },
      onChange,
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
