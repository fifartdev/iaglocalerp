'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string }
type VatPreset = { id: string; name: string; rate: number }

export type TransactionInitialValues = {
  referenceNumber: string
  date: string
  name: string
  netAmount: string
  vatRate: string
  categoryId: string
  documentId?: string
  documentUrl?: string
}

type Props = {
  collection: 'incomes' | 'expenses'
  categories: Category[]
  vatPresets: VatPreset[]
  redirectTo: string
  editId?: string
  initialValues?: TransactionInitialValues
}

const inputCls =
  'w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

export function TransactionForm({
  collection,
  categories,
  vatPresets,
  redirectTo,
  editId,
  initialValues,
}: Props) {
  const router = useRouter()
  const isEdit = Boolean(editId)
  const isIncome = collection === 'incomes'

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [refNum, setRefNum] = useState(initialValues?.referenceNumber ?? '')
  const [date, setDate] = useState(initialValues?.date ?? new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState(initialValues?.name ?? '')
  const [netAmount, setNetAmount] = useState(initialValues?.netAmount ?? '')
  const [vatRate, setVatRate] = useState(initialValues?.vatRate ?? '')
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '')
  const [file, setFile] = useState<File | null>(null)

  function applyVatPreset(presetId: string) {
    const preset = vatPresets.find((v) => v.id === presetId)
    if (preset) setVatRate(String(preset.rate))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryId) {
      setError('Please select a category.')
      return
    }
    setSaving(true)
    setError('')

    try {
      const n = Number(categoryId)
      const catValue = Number.isInteger(n) ? n : categoryId

      const body: Record<string, unknown> = {
        referenceNumber: refNum.trim(),
        date: new Date(date).toISOString(),
        name: description.trim(),
        netAmount: parseFloat(netAmount),
        vatRate: parseFloat(vatRate),
        category: catValue,
      }

      // Upload document if a file was selected
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('_payload', JSON.stringify({ alt: file.name }))
        const uploadRes = await fetch('/api/media', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
        if (!uploadRes.ok) throw new Error('Failed to upload document')
        const { doc } = await uploadRes.json()
        const docId = Number(doc.id)
        body.document = Number.isInteger(docId) ? docId : String(doc.id)
      } else if (initialValues?.documentId) {
        const docId = Number(initialValues.documentId)
        body.document = Number.isInteger(docId) ? docId : initialValues.documentId
      }

      const url = isEdit ? `/api/${collection}/${editId}` : `/api/${collection}`
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          (data as { errors?: { message: string }[] })?.errors?.[0]?.message ?? 'Failed to save',
        )
      }

      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const accent = isIncome ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
  const grossPreview =
    netAmount && vatRate
      ? `VAT: €${(parseFloat(netAmount) * (parseFloat(vatRate) / 100)).toFixed(2)} · Gross: €${(parseFloat(netAmount) * (1 + parseFloat(vatRate) / 100)).toFixed(2)}`
      : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Details card */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <h2 className="mb-5 text-sm font-semibold text-slate-900">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Reference Number <span className="text-rose-500">*</span>
            </label>
            <input
              value={refNum}
              onChange={(e) => setRefNum(e.target.value)}
              required
              placeholder="e.g. INV-001"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description <span className="text-rose-500">*</span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Short description"
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Category <span className="text-rose-500">*</span>
            </label>
            {categories.length === 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-700">
                No categories yet — add some under{' '}
                <strong>Configuration &rsaquo; {isIncome ? 'Income' : 'Expense'} Categories</strong> first.
              </p>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className={inputCls}
              >
                <option value="">— Select a category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Document upload */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Supporting Document
            </label>

            {initialValues?.documentUrl && !file && (
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <a
                  href={initialValues.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  View current document
                </a>
                <span className="text-sky-400">· Upload a new file below to replace it</span>
              </div>
            )}

            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {file && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {file.name}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-400">PDF, Word, Excel, or image. Max size depends on storage config.</p>
          </div>
        </div>
      </div>

      {/* Amounts card */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <h2 className="mb-5 text-sm font-semibold text-slate-900">Amounts</h2>
        <div className="grid gap-4 sm:grid-cols-2">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Net Amount (€) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={netAmount}
              onChange={(e) => setNetAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              VAT Rate (%) <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                required
                min="0"
                max="100"
                step="0.01"
                placeholder="0"
                className={inputCls}
              />
              {vatPresets.length > 0 && (
                <select
                  onChange={(e) => applyVatPreset(e.target.value)}
                  defaultValue=""
                  className="rounded-lg border border-slate-200 px-2 py-2.5 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Presets</option>
                  {vatPresets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.rate}%)
                    </option>
                  ))}
                </select>
              )}
            </div>
            {grossPreview && (
              <p className="mt-1.5 text-xs text-slate-400">{grossPreview}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push(redirectTo)}
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || categories.length === 0}
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${accent}`}
        >
          {saving ? 'Saving…' : isEdit ? `Update ${isIncome ? 'Income' : 'Expense'}` : `Save ${isIncome ? 'Income' : 'Expense'}`}
        </button>
      </div>
    </form>
  )
}
