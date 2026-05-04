import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import { CategoryManager } from '../../_components/CategoryManager'

export default async function ExpenseCategoriesPage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'expense-categories', limit: 200, depth: 0 })

  const items = docs.map((d) => ({ id: String(d.id), name: String(d.name ?? '') }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Expense Categories</h1>
        <p className="mt-1 text-sm text-slate-500">Manage the categories used to classify expense entries.</p>
      </div>
      <CategoryManager apiPath="/api/expense-categories" initialItems={items} />
    </div>
  )
}
