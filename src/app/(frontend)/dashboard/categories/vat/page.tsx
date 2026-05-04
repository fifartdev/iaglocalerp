import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import { CategoryManager } from '../../_components/CategoryManager'

export default async function VatCategoriesPage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'vat-categories', limit: 200, depth: 0 })

  const items = docs.map((d) => ({
    id: String(d.id),
    name: String(d.name ?? ''),
    rate: typeof d.rate === 'number' ? d.rate : undefined,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">VAT Rates</h1>
        <p className="mt-1 text-sm text-slate-500">
          Define named VAT rate presets (e.g. Standard 23%, Reduced 13.5%, Zero 0%).
        </p>
      </div>
      <CategoryManager apiPath="/api/vat-categories" initialItems={items} hasRate />
    </div>
  )
}
