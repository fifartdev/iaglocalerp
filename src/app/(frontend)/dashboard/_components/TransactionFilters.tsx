'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

type Props = {
  categories: { id: string; name: string }[]
  basePath: string
}

export function TransactionFilters({ categories, basePath }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  const sort = params.get('sort') ?? 'desc'
  const [q, setQ] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState(params.get('category') ?? '')
  const categoryRef = useRef(params.get('category') ?? '')
  const mounted = useRef(false)

  function buildUrl(searchQ: string, cat: string) {
    const p = new URLSearchParams({ sort })
    if (searchQ.trim()) p.set('q', searchQ.trim())
    if (cat) p.set('category', cat)
    return `${basePath}?${p}`
  }

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const t = setTimeout(() => {
      router.push(buildUrl(q, categoryRef.current))
    }, 400)
    return () => clearTimeout(t)
  }, [q])

  function handleCategory(val: string) {
    setCategory(val)
    categoryRef.current = val
    router.push(buildUrl(q, val))
  }

  function handleClear() {
    setQ('')
    setCategory('')
    categoryRef.current = ''
    router.push(`${basePath}?sort=${sort}`)
  }

  const hasFilter = Boolean(q || category)

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
      {/* Description search */}
      <div className="relative min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search description…"
          className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Category dropdown */}
      <select
        value={category}
        onChange={(e) => handleCategory(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Clear */}
      {hasFilter && (
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  )
}
