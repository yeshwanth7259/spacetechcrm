import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IndianRupee, Users, TrendingUp, CheckCircle } from 'lucide-react'

export default async function AnalyticsPage() {
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

  // Fetch aggregate data
  const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true })
  const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true })
  const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })
  const { data: payments } = await supabase.from('payments').select('amount')
  const { data: invoices } = await supabase.from('invoices').select('amount_due, total')

  const totalRevenue = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
  const totalInvoiced = invoices?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0
  const outstandingAmount = invoices?.reduce((acc, curr) => acc + Number(curr.amount_due), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics & Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Detailed overview of your agency's performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Based on received payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Dues</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{outstandingAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Pending from unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Funnel</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsCount} <span className="text-sm font-normal text-gray-500">Clients</span></div>
            <p className="text-xs text-gray-500 mt-1">From {leadsCount} total leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectsCount}</div>
            <p className="text-xs text-gray-500 mt-1">Total projects in pipeline</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-white shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Advanced Charts Coming Soon</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
            We will be adding detailed monthly revenue graphs and lead conversion charts here in the future.
          </p>
        </div>
      </div>
    </div>
  )
}
