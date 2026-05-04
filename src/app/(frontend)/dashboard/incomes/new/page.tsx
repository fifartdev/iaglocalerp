import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import React from 'react'
import { TransactionForm } from '../../_components/TransactionForm'

export default async function NewIncomePage() {
  const payload = await getPayload({ config })

  const [{ docs: cats }, { docs: vatPresets }] = await Promise.all([
    payload.find({ collection: 'income-categories', limit: 200, depth: 0 }),
    payload.find({ collection: 'vat-categories', limit: 200, depth: 0 }),
  ])

  const categories = cats.map((d) => ({ id: String(d.id), name: String(d.name ?? '') }))
  const presets = vatPresets.map((d) => ({
    id: String(d.id),
    name: String(d.name ?? ''),
    rate: typeof d.rate === 'number' ? d.rate : 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/incomes"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Income</h1>
          <p className="mt-0.5 text-sm text-slate-500">VAT amounts are calculated automatically.</p>
        </div>
      </div>
      <TransactionForm
        collection="incomes"
        categories={categories}
        vatPresets={presets}
        redirectTo="/dashboard/incomes"
      />
    </div>
  )
}
