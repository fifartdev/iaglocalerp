import type { CollectionConfig } from 'payload'

export const IncomeCategories: CollectionConfig = {
  slug: 'income-categories',
  admin: {
    useAsTitle: 'name',
    group: 'Configuration',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
