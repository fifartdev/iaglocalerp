import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import React, { Suspense } from 'react'
import { Pagination } from '../_components/Pagination'
import { TransactionFilters } from '../_components/TransactionFilters'

const PAGE_SIZE = 25

type CategoryDoc = { id: string; name?: string }
type MediaDoc = { id: string; url?: string }
type ExpenseDoc = {
  id: string
  referenceNumber: string
  date?: string
  name?: string
  netAmount?: number
  vatRate?: number
  vatAmount?: number
  totalGross?: number
  category?: CategoryDoc | string | null
  document?: MediaDoc | string | null
  createdAt: string
}

function fmt(value: number | undefined | null) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(value ?? 0)
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string; q?: string; category?: string }>
}) {
  const { sort, page, q, category: categoryParam } = await searchParams
  const sortOrder = sort === 'asc' ? 'asc' : 'desc'
  const nextSort = sortOrder === 'asc' ? 'desc' : 'asc'
  const pageNum = Math.max(1, parseInt(page ?? '1', 10))

  const conditions: Where[] = []
  if (q?.trim()) conditions.push({ name: { like: q.trim() } })
  if (categoryParam) {
    const catId = Number.isInteger(Number(categoryParam)) ? Number(categoryParam) : categoryParam
    conditions.push({ category: { equals: catId } })
  }
  const where: Where | undefined =
    conditions.length === 0 ? undefined :
    conditions.length === 1 ? conditions[0] :
    { and: conditions }

  const payload = await getPayload({ config })

  const [{ docs: allDocs }, { docs: pageDocs, totalDocs, totalPages }, { docs: catDocs }] =
    await Promise.all([
      payload.find({ collection: 'expenses', where, limit: 10000, depth: 0, sort: '-date' }),
      payload.find({
        collection: 'expenses',
        where,
        limit: PAGE_SIZE,
        page: pageNum,
        depth: 1,
        sort: sortOrder === 'asc' ? 'date' : '-date',
      }),
      payload.find({ collection: 'expense-categories', limit: 200, depth: 0 }),
    ])

  const all = allDocs as unknown as ExpenseDoc[]
  const rows = pageDocs as unknown as ExpenseDoc[]
  const categories = catDocs.map((d) => ({ id: String(d.id), name: String(d.name ?? '') }))

  type F = { netAmount?: number | null; vatAmount?: number | null; totalGross?: number | null }
  const sum = (docs: ExpenseDoc[], field: keyof F) =>
    docs.reduce((acc, d) => acc + (Number((d as F)[field]) || 0), 0)

  const totals = {
    net: sum(all, 'netAmount'),
    vat: sum(all, 'vatAmount'),
    gross: sum(all, 'totalGross'),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">{totalDocs} record{totalDocs !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/dashboard/expenses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Expense
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Net', value: totals.net, text: 'text-rose-700', ring: 'ring-rose-100' },
          { label: 'Total VAT', value: totals.vat, text: 'text-slate-700', ring: 'ring-slate-200' },
          { label: 'Total Gross', value: totals.gross, text: 'text-rose-800', ring: 'ring-rose-200' },
        ].map(({ label, value, text, ring }) => (
          <div key={label} className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${ring}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${text}`}>{fmt(value)}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-900">All Expense Entries</h2>
        </div>

        {/* Filters */}
        <Suspense>
          <TransactionFilters categories={categories} basePath="/dashboard/expenses" />
        </Suspense>

        {totalDocs === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-slate-400">
              {q || categoryParam ? 'No records match your filters.' : 'No expense records yet.'}
            </p>
            {!q && !categoryParam && (
              <Link href="/dashboard/expenses/new" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
                Add your first expense →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="py-3 pl-6 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <a href={`?sort=${nextSort}${q ? `&q=${encodeURIComponent(q)}` : ''}${categoryParam ? `&category=${categoryParam}` : ''}`} className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors">
                        Date
                        {sortOrder === 'asc'
                          ? <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                          : <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>}
                      </a>
                    </th>
                    {['Description', 'Category', 'Net', 'VAT %', 'VAT', 'Gross', 'Doc', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 last:pr-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((row) => {
                    const category = row.category && typeof row.category === 'object' ? row.category.name : null
                    const doc = row.document && typeof row.document === 'object' ? row.document : null
                    const displayDate = row.date
                      ? new Date(row.date).toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'
                    return (
                      <tr key={row.id} className="transition-colors hover:bg-slate-50/60">
                        <td className="whitespace-nowrap py-3 pl-6 pr-4 font-mono text-xs text-slate-500">{row.referenceNumber}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{displayDate}</td>
                        <td className="max-w-xs truncate px-4 py-3 text-slate-700">{row.name ?? <span className="text-slate-300">—</span>}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">{category ?? <span className="text-slate-300">—</span>}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-700">{fmt(row.netAmount)}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-400">{row.vatRate != null ? `${row.vatRate}%` : <span className="text-slate-300">—</span>}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-400">{fmt(row.vatAmount)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-rose-700">{fmt(row.totalGross)}</td>
                        <td className="whitespace-nowrap py-3 pl-4 pr-6">
                          {doc?.url ? (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 transition hover:bg-sky-100">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              Download
                            </a>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="whitespace-nowrap py-3 pl-2 pr-6">
                          <Link
                            href={`/dashboard/expenses/${row.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                  <tr>
                    <td colSpan={4} className="py-3 pl-6 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Totals</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-slate-900">{fmt(totals.net)}</td>
                    <td className="px-4 py-3" />
                    <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-slate-900">{fmt(totals.vat)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold tabular-nums text-rose-700">{fmt(totals.gross)}</td>
                    <td className="pr-6" />
                  </tr>
                </tfoot>
              </table>
            </div>
            <Pagination
              currentPage={pageNum}
              totalPages={totalPages}
              totalDocs={totalDocs}
              pageSize={PAGE_SIZE}
              basePath="/dashboard/expenses"
              sort={sortOrder}
            />
          </>
        )}
      </div>
    </div>
  )
}
