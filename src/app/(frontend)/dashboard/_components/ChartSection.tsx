'use client'

import React, { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export type ChartTx = {
  type: 'income' | 'expense'
  gross: number
  date: string
}

type Range = '3m' | '6m' | '12m' | 'ytd' | 'all'

const RANGES: { value: Range; label: string }[] = [
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '12m', label: '1Y' },
  { value: 'ytd', label: 'YTD' },
  { value: 'all', label: 'All' },
]

function filterByRange(txs: ChartTx[], range: Range): ChartTx[] {
  if (range === 'all') return txs
  const now = new Date()
  const from = new Date()
  if (range === '3m') from.setMonth(now.getMonth() - 3)
  else if (range === '6m') from.setMonth(now.getMonth() - 6)
  else if (range === '12m') from.setFullYear(now.getFullYear() - 1)
  else if (range === 'ytd') {
    from.setMonth(0)
    from.setDate(1)
  }
  return txs.filter((t) => new Date(t.date) >= from)
}

function toMonthlyData(txs: ChartTx[]) {
  const map = new Map<string, { income: number; expense: number; sortKey: number }>()
  for (const tx of txs) {
    const d = new Date(tx.date)
    const key = d.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' })
    const sortKey = d.getFullYear() * 100 + d.getMonth()
    if (!map.has(key)) map.set(key, { income: 0, expense: 0, sortKey })
    const entry = map.get(key)!
    if (tx.type === 'income') entry.income += tx.gross
    else entry.expense += tx.gross
  }
  return Array.from(map.entries())
    .sort((a, b) => a[1].sortKey - b[1].sortKey)
    .map(([month, { income, expense }]) => ({ month, income, expense }))
}

const fmtTooltip = (v: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(v)

const fmtAxis = (v: number) =>
  v >= 1000 ? `€${(v / 1000).toFixed(0)}k` : `€${v}`

export function ChartSection({ transactions }: { transactions: ChartTx[] }) {
  const [range, setRange] = useState<Range>('12m')
  const data = useMemo(
    () => toMonthlyData(filterByRange(transactions, range)),
    [transactions, range],
  )

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Income vs Expenses</h2>
          <p className="mt-0.5 text-xs text-slate-400">Gross amounts · monthly view</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                range === r.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          No transactions for the selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barCategoryGap="30%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtAxis}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                fmtTooltip(value),
                name === 'income' ? 'Income' : 'Expense',
              ]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
              }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Legend
              formatter={(v) => (v === 'income' ? 'Income' : 'Expense')}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
