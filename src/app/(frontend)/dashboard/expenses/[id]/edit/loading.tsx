import React from 'react'

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Pulse className="h-9 w-9 rounded-lg" />
        <div className="space-y-1.5">
          <Pulse className="h-6 w-36" />
          <Pulse className="h-3 w-28" />
        </div>
      </div>

      {/* Form card */}
      <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {/* Ref + Date */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Pulse className="h-3 w-32" />
              <Pulse className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        {/* Description */}
        <div className="space-y-2">
          <Pulse className="h-3 w-24" />
          <Pulse className="h-10 w-full rounded-lg" />
        </div>
        {/* Net + VAT preset */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Pulse className="h-3 w-24" />
              <Pulse className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        {/* VAT rate + Category */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Pulse className="h-3 w-20" />
              <Pulse className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        {/* Gross preview */}
        <Pulse className="h-16 w-full rounded-xl" />
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Pulse className="h-10 w-24 rounded-lg" />
          <Pulse className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
