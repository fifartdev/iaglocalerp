import type { CollectionConfig } from 'payload'

export const ExpenseCategories: CollectionConfig = {
  slug: 'expense-categories',
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
