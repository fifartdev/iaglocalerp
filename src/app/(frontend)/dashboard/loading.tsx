import React from 'react'

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Pulse className="h-7 w-52" />
          <Pulse className="h-4 w-64" />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {[...Array(5)].map((_, i) => <Pulse key={i} className="h-7 w-12 rounded-md" />)}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <Pulse className="h-3 w-28" />
                <Pulse className="h-9 w-36" />
                <Pulse className="h-3 w-40" />
              </div>
              <Pulse className="h-10 w-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1.5">
            <Pulse className="h-4 w-44" />
            <Pulse className="h-3 w-32" />
          </div>
        </div>
        <Pulse className="h-56 w-full rounded-xl" />
        <div className="mt-4 flex justify-center gap-6">
          <Pulse className="h-3 w-20" />
          <Pulse className="h-3 w-20" />
        </div>
      </div>

      {/* Transactions table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <Pulse className="h-4 w-36" />
          <Pulse className="h-5 w-5 rounded-full" />
        </div>
        <div className="divide-y divide-slate-50">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5">
              <Pulse className="h-3 w-24" />
              <Pulse className="h-5 w-16 rounded-full" />
              <Pulse className="h-3 w-24" />
              <Pulse className="h-3 w-20" />
              <Pulse className="ml-auto h-3 w-16" />
              <Pulse className="h-3 w-16" />
              <Pulse className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
