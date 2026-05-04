'use client'

import React, { useEffect, useMemo, useState } from 'react'
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

export type DashboardTx = {
  id: string
  type: 'income' | 'expense'
  referenceNumber: string
  name?: string
  netAmount: number
  vatAmount: number
  totalGross: number
  vatRate?: number
  category?: string | null
  docUrl?: string | null
  date: string // ISO — uses `date` field, falls back to createdAt
}

type Range = '3m' | '6m' | '12m' | 'ytd' | 'all'

const RANGES: { value: Range; label: string }[] = [
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '12m', label: '1Y' },
  { value: 'ytd', label: 'YTD' },
  { value: 'all', label: 'All' },
]

function filterByRange(txs: DashboardTx[], range: Range): DashboardTx[] {
  if (range === 'all') return txs
  const now = new Date()
  const from = new Date()
  if (range === '3m') from.setMonth(now.getMonth() - 3)
  else if (range === '6m') from.setMonth(now.getMonth() - 6)
  else if (range === '12m') from.setFullYear(now.getFullYear() - 1)
  else if (range === 'ytd') {
    from.setMonth(0)
    from.setDate(1)
    from.setHours(0, 0, 0, 0)
  }
  return txs.filter((t) => new Date(t.date) >= from)
}

function toMonthlyData(txs: DashboardTx[]) {
  const map = new Map<string, { income: number; expense: number; sortKey: number }>()
  for (const tx of txs) {
    const d = new Date(tx.date)
    const key = d.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' })
    const sortKey = d.getFullYear() * 100 + d.getMonth()
    if (!map.has(key)) map.set(key, { income: 0, expense: 0, sortKey })
    const entry = map.get(key)!
    if (tx.type === 'income') entry.income += tx.totalGross
    else entry.expense += tx.totalGross
  }
  return Array.from(map.entries())
    .sort((a, b) => a[1].sortKey - b[1].sortKey)
    .map(([month, { income, expense }]) => ({ month, income, expense }))
}

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(v)
const fmtAxis = (v: number) =>
  v >= 1000 ? `€${(v / 1000).toFixed(0)}k` : `€${v}`

function sum(txs: DashboardTx[], field: 'netAmount' | 'vatAmount' | 'totalGross') {
  return txs.reduce((acc, tx) => acc + tx[field], 0)
}

type KpiProps = {
  label: string
  gross: number
  net: number
  vat: number
  ringClass: string
  iconBgClass: string
  valueClass: string
  icon: React.ReactNode
}
function KpiCard({ label, gross, net, vat, ringClass, iconBgClass, valueClass, icon }: KpiProps) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${ringClass}`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-xl p-2 ${iconBgClass}`}>{icon}</div>
      </div>
      <p className={`mt-4 text-3xl font-bold tracking-tight ${valueClass}`}>{fmt(gross)}</p>
      <div className="mt-1.5 flex gap-4 text-xs text-slate-400">
        <span>Net {fmt(net)}</span>
        <span>VAT {fmt(vat)}</span>
      </div>
    </div>
  )
}

export function OverviewDashboard({ transactions }: { transactions: DashboardTx[] }) {
  const [range, setRange] = useState<Range>('12m')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const filtered = useMemo(() => filterByRange(transactions, range), [transactions, range])
  const chartData = useMemo(() => toMonthlyData(filtered), [filtered])

  const incomes = useMemo(() => filtered.filter((t) => t.type === 'income'), [filtered])
  const expenses = useMemo(() => filtered.filter((t) => t.type === 'expense'), [filtered])

  const incomeStats = {
    net: sum(incomes, 'netAmount'),
    vat: sum(incomes, 'vatAmount'),
    gross: sum(incomes, 'totalGross'),
  }
  const expenseStats = {
    net: sum(expenses, 'netAmount'),
    vat: sum(expenses, 'vatAmount'),
    gross: sum(expenses, 'totalGross'),
  }
  const netProfit = {
    gross: incomeStats.gross - expenseStats.gross,
    net: incomeStats.net - expenseStats.net,
    vat: incomeStats.vat - expenseStats.vat,
  }
  const vatBalance = incomeStats.vat - expenseStats.vat
  const isProfitable = netProfit.gross >= 0

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [filtered],
  )

  const rangeSelector = (
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
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Showing {sorted.length} transaction{sorted.length !== 1 ? 's' : ''} for selected period.
          </p>
        </div>
        {rangeSelector}
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Income"
          gross={incomeStats.gross}
          net={incomeStats.net}
          vat={incomeStats.vat}
          ringClass="ring-emerald-100"
          iconBgClass="bg-emerald-50"
          valueClass="text-emerald-700"
          icon={
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          }
        />
        <KpiCard
          label="Total Expenses"
          gross={expenseStats.gross}
          net={expenseStats.net}
          vat={expenseStats.vat}
          ringClass="ring-rose-100"
          iconBgClass="bg-rose-50"
          valueClass="text-rose-700"
          icon={
            <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          }
        />
        <KpiCard
          label={isProfitable ? 'Net Profit' : 'Net Loss'}
          gross={Math.abs(netProfit.gross)}
          net={Math.abs(netProfit.net)}
          vat={Math.abs(netProfit.vat)}
          ringClass={isProfitable ? 'ring-indigo-100' : 'ring-amber-100'}
          iconBgClass={isProfitable ? 'bg-indigo-50' : 'bg-amber-50'}
          valueClass={isProfitable ? 'text-indigo-700' : 'text-amber-700'}
          icon={
            <svg className={`h-5 w-5 ${isProfitable ? 'text-indigo-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-violet-100">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-slate-500">VAT Balance</p>
            <div className="rounded-xl bg-violet-50 p-2">
              <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-violet-700">
            {fmt(Math.abs(vatBalance))}
          </p>
          <p className="mt-1.5 text-xs text-slate-400">
            {vatBalance >= 0 ? 'Payable to tax authority' : 'Reclaimable from tax authority'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-900">Income vs Expenses</h2>
          <p className="mt-0.5 text-xs text-slate-400">Gross amounts · monthly view</p>
        </div>
        {!mounted ? (
          <div className="h-[280px] animate-pulse rounded-xl bg-slate-100" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
            No transactions for selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
              <Tooltip
                formatter={(value: number, name: string) => [fmt(value), name === 'income' ? 'Income' : 'Expense']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Legend formatter={(v) => (v === 'income' ? 'Income' : 'Expense')} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Transactions table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Transactions
            <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {sorted.length}
            </span>
          </h2>
        </div>

        {sorted.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-400">
            No transactions for the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Ref', 'Type', 'Date', 'Description', 'Category', 'Net', 'VAT', 'Gross', 'Doc'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 first:pl-6 last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map((tx) => (
                  <tr key={`${tx.type}-${tx.id}`} className="transition-colors hover:bg-slate-50/60">
                    <td className="whitespace-nowrap py-3 pl-6 pr-4 font-mono text-xs text-slate-500">{tx.referenceNumber}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {tx.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                      {new Date(tx.date).toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-700">
                      {tx.name ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {tx.category ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-700">{fmt(tx.netAmount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-400">{fmt(tx.vatAmount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-slate-900">{fmt(tx.totalGross)}</td>
                    <td className="whitespace-nowrap py-3 pl-4 pr-6">
                      {tx.docUrl ? (
                        <a href={tx.docUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 transition hover:bg-sky-100">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Doc
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
