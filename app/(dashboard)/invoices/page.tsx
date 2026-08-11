import { getInvoices } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your client invoices.</p>
        </div>
        <Link href="/invoices/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 uppercase font-medium text-xs">
            <tr>
              <th className="px-6 py-4">Invoice #</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices?.map(invoice => (
              <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoice_number}</td>
                <td className="px-6 py-4">
                  {/* @ts-ignore */}
                  {invoice.clients?.company_name || 'N/A'}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {/* @ts-ignore */}
                  {invoice.projects?.name || '-'}
                </td>
                <td className="px-6 py-4 font-medium">₹{invoice.total.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(invoice.due_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    invoice.status === 'paid' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                    invoice.status === 'draft' ? 'bg-gray-50 text-gray-700 ring-gray-600/20' : 
                    invoice.status === 'overdue' ? 'bg-red-50 text-red-700 ring-red-600/20' : 
                    'bg-blue-50 text-blue-700 ring-blue-600/20'
                  }`}>
                    {invoice.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {(!invoices || invoices.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No invoices yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new invoice.
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
