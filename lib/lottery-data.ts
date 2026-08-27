export type LotteryEntry = {
  numero: string
  stockInicial: number
  vendidos: number
}

/** Datos de demostración para el panel BI. El mostrador usa la tabla `inventario`. */
const SEED_NUMBERS = [
  '00007', '01234', '02580', '04815', '05555', '07777', '10101', '11111',
  '12345', '13000', '14785', '15987', '18200', '19999', '21212', '23456',
  '24680', '25000', '27182', '28800', '30303', '31415', '33333', '34567',
  '38520', '40404', '41000', '42195', '45450', '47000', '49999', '50505',
  '51234', '54321', '55555', '58800', '60606', '62500', '65432', '67890',
  '70707', '72900', '75000', '77777', '80808', '82100', '85858', '88888',
  '90090', '91234', '93750', '95000', '97531', '99999',
]

function pseudoStock(seed: string): { stock: number; sold: number } {
  const n = Number(seed.slice(-3))
  const stock = 10 + (n % 4) * 10 // 10, 20, 30 o 40
  const sold = (n * 7) % (stock + 1)
  return { stock, sold }
}

export const LOTTERY_DATA: LotteryEntry[] = SEED_NUMBERS.map((numero) => {
  const { stock, sold } = pseudoStock(numero)
  return { numero, stockInicial: stock, vendidos: sold }
})
