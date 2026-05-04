'use client'

import React, { useState } from 'react'

export type CategoryItem = { id: string; name: string; rate?: number }

type Props = {
  apiPath: string
  initialItems: CategoryItem[]
  hasRate?: boolean
}

const inputCls =
  'rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

export function CategoryManager({ apiPath, initialItems, hasRate = false }: Props) {
  const [items, setItems] = useState<CategoryItem[]>(initialItems)

  // Create state
  const [name, setName] = useState('')
  const [rate, setRate] = useState('')
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState('')

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editRate, setEditRate] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function startEdit(item: CategoryItem) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditRate(item.rate != null ? String(item.rate) : '')
    setEditError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError('')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setCreateError('')
    try {
      const body: Record<string, unknown> = { name: name.trim() }
      if (hasRate) body.rate = parseFloat(rate)

      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { errors?: { message: string }[] })?.errors?.[0]?.message ?? 'Failed to create')
      }

      const { doc } = await res.json()
      setItems((prev) => [...prev, { id: String(doc.id), name: doc.name, rate: doc.rate }])
      setName('')
      setRate('')
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    setEditSaving(true)
    setEditError('')
    try {
      const body: Record<string, unknown> = { name: editName.trim() }
      if (hasRate) body.rate = parseFloat(editRate)

      const rawId = Number.isInteger(Number(editingId)) ? Number(editingId) : editingId
      const res = await fetch(`${apiPath}/${rawId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { errors?: { message: string }[] })?.errors?.[0]?.message ?? 'Failed to update')
      }

      const { doc } = await res.json()
      setItems((prev) =>
        prev.map((i) => (i.id === editingId ? { id: String(doc.id), name: doc.name, rate: doc.rate } : i)),
      )
      setEditingId(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const rawId = Number.isInteger(Number(id)) ? Number(id) : id
      await fetch(`${apiPath}/${rawId}`, { method: 'DELETE', credentials: 'include' })
      setItems((prev) => prev.filter((i) => i.id !== id))
      if (editingId === id) setEditingId(null)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Add New</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Name"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {hasRate && (
            <input
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Rate %"
              className="w-28 rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add'}
          </button>
        </form>
        {createError && <p className="mt-3 text-sm text-rose-600">{createError}</p>}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
          <span className="text-sm font-semibold text-slate-900">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            No items yet. Add the first one above.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) =>
              editingId === item.id ? (
                /* ── Inline edit row ── */
                <li key={item.id} className="px-4 py-3 sm:px-6">
                  <form onSubmit={handleEdit} className="flex flex-wrap items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      autoFocus
                      className={`min-w-0 flex-1 ${inputCls}`}
                    />
                    {hasRate && (
                      <input
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        required
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Rate %"
                        className={`w-24 ${inputCls}`}
                      />
                    )}
                    <button
                      type="submit"
                      disabled={editSaving}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {editSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    {editError && (
                      <p className="w-full text-xs text-rose-600">{editError}</p>
                    )}
                  </form>
                </li>
              ) : (
                /* ── Normal row ── */
                <li
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50/60 sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-900">{item.name}</span>
                    {item.rate != null && (
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                        {item.rate}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(item)}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
                    >
                      {deletingId === item.id ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
