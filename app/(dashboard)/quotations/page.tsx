import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getQuotations() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() }
      }
    }
  )
  
  const { data, error } = await supabase
    .from('quotations')
    .select('*, clients(company_name)')
    .order('created_at', { ascending: false })
    
  if (error) throw new Error(error.message)
  return data
}

export default async function QuotationsPage() {
  const quotations = await getQuotations()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quotations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your agency quotations.</p>
        </div>
        <Link href="/quotations/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> New Quotation
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 uppercase font-medium text-xs">
            <tr>
              <th className="px-6 py-4">Quotation #</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quotations?.map(quotation => (
              <tr key={quotation.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                <td className="px-6 py-4 font-medium text-blue-600">{quotation.quotation_number}</td>
                <td className="px-6 py-4">
                  {/* @ts-ignore - Supabase join typing */}
                  {quotation.clients?.company_name || 'Unknown Client'}
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(quotation.quotation_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right font-medium">₹ {quotation.total_amount.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    quotation.status === 'accepted' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                    quotation.status === 'draft' ? 'bg-gray-50 text-gray-700 ring-gray-600/20' : 
                    'bg-blue-50 text-blue-700 ring-blue-600/20'
                  }`}>
                    {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
            {(!quotations || quotations.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No quotations found. Create a new quotation to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
