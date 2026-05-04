import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Global Settings',
  admin: {
    group: 'Configuration',
  },
  fields: [
    {
      name: 'defaultVatRate',
      type: 'number',
      label: 'Default VAT Rate (%)',
      defaultValue: 20,
      required: true,
      min: 0,
      max: 100,
    },
  ],
}
