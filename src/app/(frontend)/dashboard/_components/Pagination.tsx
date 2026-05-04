import Link from 'next/link'
import React from 'react'

type Props = {
  currentPage: number
  totalPages: number
  totalDocs: number
  pageSize: number
  basePath: string
  sort: string
}

export function Pagination({ currentPage, totalPages, totalDocs, pageSize, basePath, sort }: Props) {
  if (totalPages <= 1) return null

  const buildUrl = (page: number) => {
    const params = new URLSearchParams({ sort })
    if (page > 1) params.set('page', String(page))
    return `${basePath}?${params}`
  }

  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, totalDocs)

  const pages: (number | 'el' | 'er')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('el')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('er')
    pages.push(totalPages)
  }

  const btn = 'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-sm font-medium transition-colors'

  const chevronLeft = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
  const chevronRight = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:px-6">
      <p className="text-sm text-slate-500">
        Showing{' '}
        <span className="font-medium text-slate-700">{from}–{to}</span>
        {' '}of{' '}
        <span className="font-medium text-slate-700">{totalDocs}</span>
      </p>
      <div className="flex items-center gap-1">
        {currentPage > 1 ? (
          <Link href={buildUrl(currentPage - 1)} className={`${btn} text-slate-600 hover:bg-slate-100`}>
            {chevronLeft}
          </Link>
        ) : (
          <span className={`${btn} cursor-not-allowed text-slate-300`}>{chevronLeft}</span>
        )}

        {pages.map((p, i) =>
          typeof p === 'string' ? (
            <span key={`${p}-${i}`} className={`${btn} cursor-default text-slate-400`}>…</span>
          ) : (
            <Link
              key={p}
              href={buildUrl(p)}
              className={`${btn} ${
                p === currentPage
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </Link>
          ),
        )}

        {currentPage < totalPages ? (
          <Link href={buildUrl(currentPage + 1)} className={`${btn} text-slate-600 hover:bg-slate-100`}>
            {chevronRight}
          </Link>
        ) : (
          <span className={`${btn} cursor-not-allowed text-slate-300`}>{chevronRight}</span>
        )}
      </div>
    </div>
  )
}
