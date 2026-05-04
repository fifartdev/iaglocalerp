import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { TransactionForm } from '../../../_components/TransactionForm'

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const payload = await getPayload({ config })

  const [expense, { docs: cats }, { docs: vatDocs }] = await Promise.all([
    payload.findByID({ collection: 'expenses', id, depth: 1 }).catch(() => null),
    payload.find({ collection: 'expense-categories', limit: 200, depth: 0 }),
    payload.find({ collection: 'vat-categories', limit: 200, depth: 0 }),
  ])

  if (!expense) notFound()

  const categories = cats.map((d) => ({ id: String(d.id), name: String(d.name ?? '') }))
  const vatPresets = vatDocs.map((d) => ({
    id: String(d.id),
    name: String(d.name ?? ''),
    rate: typeof d.rate === 'number' ? d.rate : 0,
  }))

  const rawCategory = expense.category
  const categoryId =
    rawCategory && typeof rawCategory === 'object'
      ? String((rawCategory as { id: unknown }).id)
      : rawCategory
        ? String(rawCategory)
        : ''

  const initialValues = {
    referenceNumber: String(expense.referenceNumber ?? ''),
    date: expense.date
      ? new Date(expense.date as string).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    name: String(expense.name ?? ''),
    netAmount: String(expense.netAmount ?? ''),
    vatRate: String(expense.vatRate ?? ''),
    categoryId,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/expenses"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Expense</h1>
          <p className="mt-0.5 text-sm text-slate-500">Ref: {expense.referenceNumber}</p>
        </div>
      </div>
      <TransactionForm
        collection="expenses"
        categories={categories}
        vatPresets={vatPresets}
        redirectTo="/dashboard/expenses"
        editId={String(expense.id)}
        initialValues={initialValues}
      />
    </div>
  )
}
