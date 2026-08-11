import { getClients } from '@/app/actions/clients'
import { QuotationForm } from '@/components/quotations/quotation-form'

export default async function NewQuotationPage() {
  const clients = await getClients()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create New Quotation</h1>
        <p className="text-sm text-gray-500 mt-1">Generate a professional SpaceTec quotation.</p>
      </div>
      
      <QuotationForm clients={clients} />
    </div>
  )
}
