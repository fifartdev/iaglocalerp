import React from 'react'

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Pulse className="h-7 w-28" />
          <Pulse className="h-3 w-20" />
        </div>
        <Pulse className="h-10 w-36 rounded-lg" />
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <Pulse className="h-3 w-20" />
            <Pulse className="mt-3 h-8 w-36" />
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-6 py-4">
          <Pulse className="h-4 w-44" />
        </div>
        {/* Filter bar */}
        <div className="flex gap-3 border-b border-slate-100 px-6 py-3">
          <Pulse className="h-8 flex-1 rounded-lg" />
          <Pulse className="h-8 w-44 rounded-lg" />
        </div>
        {/* Table rows */}
        <div className="divide-y divide-slate-50">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3">
              <Pulse className="h-3 w-20" />
              <Pulse className="h-3 w-20" />
              <Pulse className="h-3 w-36" />
              <Pulse className="h-3 w-24" />
              <Pulse className="ml-auto h-3 w-16" />
              <Pulse className="h-3 w-10" />
              <Pulse className="h-3 w-16" />
              <Pulse className="h-3 w-20" />
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <Pulse className="h-3 w-44" />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => <Pulse key={i} className="h-8 w-8 rounded-md" />)}
          </div>
        </div>
      </div>
    </div>
  )
}
