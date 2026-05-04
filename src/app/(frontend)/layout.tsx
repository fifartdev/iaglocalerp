import React from 'react'
import './globals.css'

export const metadata = {
  description: 'Financial tracking and VAT management',
  title: 'IAG Local ERP',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  )
}
