'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { SALES_TREND } from '@/lib/analytics-data'

const chartConfig = {
  billetes: {
    label: 'Billetes',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function TrendChart() {
  const total = SALES_TREND.reduce((s, p) => s + p.billetes, 0)
  const ultima = SALES_TREND[SALES_TREND.length - 1]
  const previa = SALES_TREND[SALES_TREND.length - 2]
  const delta = Math.round(((ultima.billetes - previa.billetes) / previa.billetes) * 100)

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Tendencia de ventas
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Volumen de billetes por semana de campaña
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-semibold tabular-nums text-foreground">
            {total.toLocaleString('es-ES')}
          </div>
          <div className="text-[11px] font-medium text-success">
            +{delta}% vs. semana anterior
          </div>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[220px] w-full">
        <BarChart accessibilityLayer data={SALES_TREND} margin={{ left: -12, right: 8, top: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="periodo"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-[11px]"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={40}
            className="text-[11px]"
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="billetes" fill="var(--color-billetes)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </section>
  )
}
