import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { TransactionForm } from '../../../_components/TransactionForm'

export default async function EditIncomePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const payload = await getPayload({ config })

  const [income, { docs: cats }, { docs: vatDocs }] = await Promise.all([
    payload.findByID({ collection: 'incomes', id, depth: 1 }).catch(() => null),
    payload.find({ collection: 'income-categories', limit: 200, depth: 0 }),
    payload.find({ collection: 'vat-categories', limit: 200, depth: 0 }),
  ])

  if (!income) notFound()

  const categories = cats.map((d) => ({ id: String(d.id), name: String(d.name ?? '') }))
  const vatPresets = vatDocs.map((d) => ({
    id: String(d.id),
    name: String(d.name ?? ''),
    rate: typeof d.rate === 'number' ? d.rate : 0,
  }))

  const rawCategory = income.category
  const categoryId =
    rawCategory && typeof rawCategory === 'object'
      ? String((rawCategory as { id: unknown }).id)
      : rawCategory
        ? String(rawCategory)
        : ''

  const rawDocument = income.document
  const documentId =
    rawDocument && typeof rawDocument === 'object'
      ? String((rawDocument as { id: unknown }).id)
      : rawDocument ? String(rawDocument) : ''
  const documentUrl =
    rawDocument && typeof rawDocument === 'object'
      ? String((rawDocument as { url?: unknown }).url ?? '')
      : ''

  const initialValues = {
    referenceNumber: String(income.referenceNumber ?? ''),
    date: income.date
      ? new Date(income.date as string).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    name: String(income.name ?? ''),
    netAmount: String(income.netAmount ?? ''),
    vatRate: String(income.vatRate ?? ''),
    categoryId,
    documentId,
    documentUrl,
  }

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
          <h1 className="text-2xl font-bold text-slate-900">Edit Income</h1>
          <p className="mt-0.5 text-sm text-slate-500">Ref: {income.referenceNumber}</p>
        </div>
      </div>
      <TransactionForm
        collection="incomes"
        categories={categories}
        vatPresets={vatPresets}
        redirectTo="/dashboard/incomes"
        editId={String(income.id)}
        initialValues={initialValues}
      />
    </div>
  )
}
