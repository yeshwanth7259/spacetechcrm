import { getLeads, convertLeadToClient, markLeadLost } from '@/app/actions/leads'
import { BulkUploadLeads } from '@/components/leads/bulk-upload'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function LeadsPage() {
  const leads = await getLeads()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and convert your leads.</p>
        </div>
        <div className="flex items-center gap-3">
          <BulkUploadLeads />
          <Link href="/leads/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> New Lead
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 uppercase font-medium text-xs">
            <tr>
              <th className="px-6 py-4">Lead Number</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads?.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{lead.lead_number}</td>
                <td className="px-6 py-4">{lead.name}</td>
                <td className="px-6 py-4">{lead.company_name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    lead.status === 'won' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                    lead.status === 'lost' ? 'bg-red-50 text-red-700 ring-red-600/20' : 
                    'bg-blue-50 text-blue-700 ring-blue-600/20'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {lead.status !== 'won' && lead.status !== 'lost' && (
                    <div className="flex items-center justify-end gap-2">
                      <form action={async () => {
                        'use server'
                        await markLeadLost(lead.id)
                      }}>
                        <Button type="submit" size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          Not Interested
                        </Button>
                      </form>
                      <form action={async () => {
                        'use server'
                        await convertLeadToClient(lead.id)
                      }}>
                        <Button type="submit" size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                          Convert to Client <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {(!leads || leads.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No leads found. Create your first lead to start the sales funnel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
