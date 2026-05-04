import { getPayload } from 'payload'
import config from '@payload-config'
import { OverviewDashboard, type DashboardTx } from './_components/OverviewDashboard'

export default async function DashboardPage() {
  const payload = await getPayload({ config })

  const [{ docs: incomes }, { docs: expenses }] = await Promise.all([
    payload.find({ collection: 'incomes', limit: 500, depth: 1 }),
    payload.find({ collection: 'expenses', limit: 500, depth: 1 }),
  ])

  function mapDoc(
    d: Record<string, unknown>,
    type: 'income' | 'expense',
  ): DashboardTx {
    const category = d.category && typeof d.category === 'object'
      ? (d.category as { name?: string }).name ?? null
      : null
    const docUrl = d.document && typeof d.document === 'object'
      ? (d.document as { url?: string }).url ?? null
      : null

    return {
      id: String(d.id),
      type,
      referenceNumber: String(d.referenceNumber ?? ''),
      name: d.name ? String(d.name) : undefined,
      netAmount: Number(d.netAmount) || 0,
      vatAmount: Number(d.vatAmount) || 0,
      totalGross: Number(d.totalGross) || 0,
      vatRate: d.vatRate != null ? Number(d.vatRate) : undefined,
      category,
      docUrl,
      // Use the explicit date field; fall back to createdAt for legacy records
      date: String(d.date || d.createdAt),
    }
  }

  const transactions: DashboardTx[] = [
    ...incomes.map((d) => mapDoc(d as unknown as Record<string, unknown>, 'income')),
    ...expenses.map((d) => mapDoc(d as unknown as Record<string, unknown>, 'expense')),
  ]

  return <OverviewDashboard transactions={transactions} />
}
