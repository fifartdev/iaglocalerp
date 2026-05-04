import type { CollectionConfig, PayloadRequest } from 'payload'

async function calculateVat({
  data,
  req,
  originalDoc,
}: {
  data?: Record<string, unknown>
  req: PayloadRequest
  originalDoc?: Record<string, unknown>
}) {
  if (!data) return data

  let vatRate = data.vatRate ?? originalDoc?.vatRate

  if (vatRate === undefined || vatRate === null) {
    const settings = await req.payload.findGlobal({ slug: 'settings' })
    vatRate = (settings as { defaultVatRate?: number })?.defaultVatRate ?? 0
    data.vatRate = vatRate
  }

  const net = Number(data.netAmount ?? originalDoc?.netAmount) || 0
  const rate = Number(vatRate) || 0
  data.vatAmount = parseFloat((net * (rate / 100)).toFixed(2))
  data.totalGross = parseFloat((net + (data.vatAmount as number)).toFixed(2))

  return data
}

export const Incomes: CollectionConfig = {
  slug: 'incomes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['referenceNumber', 'name', 'netAmount', 'vatRate', 'totalGross', 'category'],
    group: 'Finance',
  },
  hooks: {
    beforeValidate: [calculateVat],
  },
  fields: [
    {
      name: 'referenceNumber',
      type: 'text',
      required: true,
      unique: true,
      label: 'Reference Number',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Date',
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
      },
    },
    {
      name: 'name',
      type: 'text',
      label: 'Description',
      required: true,
    },
    {
      name: 'netAmount',
      type: 'number',
      label: 'Net Amount',
      required: true,
      min: 0,
    },
    {
      name: 'vatRate',
      type: 'number',
      label: 'VAT Rate (%)',
      required: true,
      min: 0,
      max: 100,
    },
    {
      name: 'vatAmount',
      type: 'number',
      label: 'VAT Amount',
      admin: {
        readOnly: true,
        description: 'Calculated: Net × VAT Rate — server-side only',
      },
    },
    {
      name: 'totalGross',
      type: 'number',
      label: 'Total Gross',
      admin: {
        readOnly: true,
        description: 'Calculated: Net + VAT — server-side only',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'income-categories',
      label: 'Category',
      required: true,
    },
    {
      name: 'document',
      type: 'relationship',
      relationTo: 'media',
      label: 'Supporting Document',
    },
  ],
}
