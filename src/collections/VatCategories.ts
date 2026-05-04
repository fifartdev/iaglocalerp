import type { CollectionConfig } from 'payload'

export const VatCategories: CollectionConfig = {
  slug: 'vat-categories',
  admin: {
    useAsTitle: 'name',
    group: 'Configuration',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'rate',
      type: 'number',
      required: true,
      label: 'VAT Rate (%)',
      min: 0,
      max: 100,
    },
  ],
}
