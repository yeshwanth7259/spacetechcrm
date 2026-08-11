import { getClients } from '@/app/actions/clients'
import { getProjects } from '@/app/actions/projects'
import NewInvoiceForm from '@/components/invoices/new-invoice-form'

export default async function NewInvoicePage() {
  const clients = await getClients()
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Invoice</h1>
        <p className="text-sm text-gray-500 mt-1">Generate a new invoice for a client or project.</p>
      </div>

      <NewInvoiceForm clients={clients} projects={projects} />
    </div>
  )
}
