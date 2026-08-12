import { getInvoiceById } from '@/app/actions/invoices'
import { getClients } from '@/app/actions/clients'
import { getProjects } from '@/app/actions/projects'
import EditInvoiceForm from '@/components/invoices/edit-invoice-form'
import { notFound } from 'next/navigation'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const invoice = await getInvoiceById(id)
    if (!invoice) return notFound()
      
    const [clients, projects] = await Promise.all([
      getClients(),
      getProjects()
    ])

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Invoice</h1>
          <p className="text-sm text-gray-500 mt-1">Make changes to invoice {invoice.invoice_number}</p>
        </div>
        
        <EditInvoiceForm 
          invoice={invoice} 
          clients={clients} 
          projects={projects} 
        />
      </div>
    )
  } catch (err) {
    return notFound()
  }
}
