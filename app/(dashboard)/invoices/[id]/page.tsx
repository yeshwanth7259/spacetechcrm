'use client'

import { useEffect, useState } from 'react'
import { getInvoiceById } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Printer, Edit, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { use } from 'react'

export default function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getInvoiceById(id)
        setInvoice(data)
      } catch (err: any) {
        console.error(err)
        setErrorMsg(err.message || 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading invoice details...</div>
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Invoice Not Found</h2>
        {errorMsg && <p className="mb-4 text-gray-700">{errorMsg}</p>}
        <Button onClick={() => router.push('/invoices')}>Back to Invoices</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mb-24">
      {/* Action Bar - Hidden when printing */}
      <div className="print:hidden flex items-center justify-between mb-8 pb-4 border-b">
        <Button variant="ghost" onClick={() => router.push('/invoices')} className="text-gray-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex space-x-3">
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="mr-2 h-4 w-4" /> Download PDF / Print
          </Button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white p-12 rounded-xl shadow-sm border print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-gray-900 mb-2">INVOICE</h1>
            <p className="text-gray-500 font-medium">#{invoice.invoice_number}</p>
          </div>
          <div className="text-right text-gray-600 text-sm space-y-1">
            <p className="font-semibold text-gray-900 text-lg">SpaceTec Business Portal</p>
            <p>123 Tech Avenue</p>
            <p>Bangalore, Karnataka 560001</p>
            <p>contact@spacetech.com</p>
          </div>
        </div>

        {/* Client & Dates Info */}
        <div className="grid grid-cols-2 gap-8 mb-12 pb-8 border-b">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Billed To</p>
            <p className="font-semibold text-gray-900">{invoice.clients?.company_name}</p>
            {invoice.clients?.contact_name && <p className="text-gray-600 text-sm">{invoice.clients.contact_name}</p>}
            {invoice.clients?.email && <p className="text-gray-600 text-sm">{invoice.clients.email}</p>}
            {invoice.clients?.address && <p className="text-gray-600 text-sm mt-1">{invoice.clients.address}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Invoice Date</p>
              <p className="font-medium text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Due Date</p>
              <p className="font-medium text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
            {invoice.projects?.name && (
              <div className="col-span-2 mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Project</p>
                <p className="font-medium text-gray-900">{invoice.projects.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Totals Table */}
        <div className="mb-12">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-900">Description</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-900">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-4 px-4 text-gray-800">
                  Services rendered as per agreement
                  {invoice.projects?.name && ` for project: ${invoice.projects.name}`}
                </td>
                <td className="py-4 px-4 text-right text-gray-900 font-medium">
                  ₹{invoice.subtotal?.toLocaleString('en-IN') || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end">
          <div className="w-1/2 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-medium text-gray-900">₹{invoice.subtotal?.toLocaleString('en-IN') || 0}</span>
            </div>
            
            {invoice.discount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount:</span>
                <span className="font-medium text-green-600">-₹{invoice.discount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            {invoice.tax_enabled && (
              <div className="flex justify-between text-gray-600">
                <span>GST ({invoice.tax_rate}%):</span>
                <span className="font-medium text-gray-900">+₹{invoice.tax_amount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between font-semibold text-base py-3 border-y border-gray-200">
              <span className="text-gray-900">Total Amount:</span>
              <span className="text-gray-900">₹{invoice.total?.toLocaleString('en-IN') || 0}</span>
            </div>
            
            {invoice.amount_paid > 0 && (
              <div className="flex justify-between text-gray-600 pt-2">
                <span>Amount Paid:</span>
                <span className="font-medium text-gray-900">-₹{invoice.amount_paid?.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold text-lg pt-2">
              <span className="text-gray-900">Balance Due:</span>
              <span className={invoice.amount_due === 0 ? 'text-green-600' : 'text-blue-600'}>
                ₹{invoice.amount_due?.toLocaleString('en-IN') || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-16 pt-8 border-t text-sm text-gray-500">
          <p className="font-semibold text-gray-700 mb-1">Terms & Conditions</p>
          <p>Please make payment within the due date. For any questions concerning this invoice, contact us.</p>
          <p className="mt-4 text-xs text-center text-gray-400">Thank you for your business!</p>
        </div>

      </div>
    </div>
  )
}
