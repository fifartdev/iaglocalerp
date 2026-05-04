import React from 'react'

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Pulse className="h-7 w-56" />
        <Pulse className="h-4 w-80" />
      </div>

      {/* Add form card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Pulse className="mb-4 h-4 w-20" />
        <div className="flex gap-3">
          <Pulse className="h-10 flex-1 rounded-lg" />
          <Pulse className="h-10 w-20 rounded-lg" />
        </div>
      </div>

      {/* List card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-6 py-3">
          <Pulse className="h-4 w-16" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-3">
              <Pulse className="h-4 w-40" />
              <div className="flex gap-2">
                <Pulse className="h-7 w-12 rounded-md" />
                <Pulse className="h-7 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
