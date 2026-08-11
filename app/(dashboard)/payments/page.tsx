import { getPayments } from '@/app/actions/payments'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PaymentsPage() {
  const payments = await getPayments()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage received payments from clients.</p>
        </div>
        <Link href="/payments/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 uppercase font-medium text-xs">
            <tr>
              <th className="px-6 py-4">Receipt #</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Invoice</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments?.map(payment => (
              <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{payment.payment_number}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {/* @ts-ignore */}
                  {payment.clients?.company_name || 'N/A'}
                </td>
                <td className="px-6 py-4 text-blue-600">
                  {/* @ts-ignore */}
                  {payment.invoices?.invoice_number || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {payment.payment_method}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-green-600">₹{payment.amount.toLocaleString()}</td>
              </tr>
            ))}
            {(!payments || payments.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No payments found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Record a new payment to see it listed here.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
