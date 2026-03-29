'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { brand } from '@/lib/brand'

export type ActivityPoint = { date: string; count: number }

/** Solid brand colors only — no SVG gradient fills */
const FILL = brand.teal
const STROKE = brand.navy

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }))

  return (
    <div className="relative h-[280px] w-full pt-1 sm:h-[300px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-lg bg-brand-mint/40" aria-hidden />
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.7} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            allowDecimals={false}
            width={36}
          />
          <Tooltip
            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              boxShadow: 'var(--shadow-md)',
            }}
            labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as ActivityPoint | undefined
              return p?.date ?? ''
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Records"
            stroke={STROKE}
            strokeWidth={2.25}
            fill={FILL}
            fillOpacity={0.14}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}
