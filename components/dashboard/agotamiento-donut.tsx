'use client'

import { Label, Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  type ChartConfig,
} from '@/components/ui/chart'
import { stockSummary } from '@/lib/analytics-data'

const chartConfig = {
  vendidos: { label: 'Vendidos', color: 'var(--chart-1)' },
  disponibles: { label: 'Disponibles', color: 'var(--muted)' },
} satisfies ChartConfig

export function AgotamientoDonut() {
  const { stockInicial, vendidos, disponibles, pct } = stockSummary()

  const data = [
    { key: 'vendidos', value: vendidos, fill: 'var(--color-vendidos)' },
    { key: 'disponibles', value: disponibles, fill: 'var(--color-disponibles)' },
  ]

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="mb-1">
        <h2 className="text-sm font-semibold text-foreground">
          Agotamiento de almacén
        </h2>
        <p className="text-[11px] text-muted-foreground">
          Stock global vendido vs. disponible
        </p>
      </div>

      <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[180px]">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="key"
            innerRadius={58}
            outerRadius={80}
            strokeWidth={2}
            stroke="var(--card)"
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground font-mono text-2xl font-bold"
                      >
                        {pct}%
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 20}
                        className="fill-muted-foreground text-[10px] uppercase tracking-wider"
                      >
                        Vendido
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Stock</div>
          <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {stockInicial.toLocaleString('es-ES')}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Vendidos</div>
          <div className="font-mono text-sm font-semibold tabular-nums text-primary">
            {vendidos.toLocaleString('es-ES')}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Disponibles</div>
          <div className="font-mono text-sm font-semibold tabular-nums text-success">
            {disponibles.toLocaleString('es-ES')}
          </div>
        </div>
      </div>
    </section>
  )
}
