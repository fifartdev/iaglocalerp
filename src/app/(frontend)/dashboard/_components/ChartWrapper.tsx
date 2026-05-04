'use client'

import dynamic from 'next/dynamic'
import type { ChartTx } from './ChartSection'

const ChartSection = dynamic(
  () => import('./ChartSection').then((m) => m.ChartSection),
  { ssr: false, loading: () => <div className="h-[364px] animate-pulse rounded-2xl bg-slate-100" /> },
)

export function ChartWrapper({ transactions }: { transactions: ChartTx[] }) {
  return <ChartSection transactions={transactions} />
}
