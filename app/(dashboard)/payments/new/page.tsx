import { getClients } from '@/app/actions/clients'
import { getInvoices } from '@/app/actions/invoices'
import NewPaymentForm from '@/components/payments/new-payment-form'

export default async function NewPaymentPage() {
  const clients = await getClients()
  const allInvoices = await getInvoices()
  
  // Filter invoices to only those that are not fully paid
  const pendingInvoices = allInvoices?.filter(i => i.status !== 'paid') || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Record Payment</h1>
        <p className="text-sm text-gray-500 mt-1">Log a new payment and optionally link it to an invoice.</p>
      </div>

      <NewPaymentForm clients={clients} invoices={pendingInvoices} />
    </div>
  )
}
