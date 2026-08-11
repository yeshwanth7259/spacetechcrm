import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getDashboardData() {
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

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user?.id).single()

  // Fetch actual counts
  const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true })
  const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { data: quotations } = await supabase.from('quotations').select('total_amount, status')
  const { data: payments } = await supabase.from('payments').select('amount')

  const totalQuotationsCount = quotations?.length || 0
  const totalQuotationsValue = quotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0
  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  return {
    profile,
    leadsCount: leadsCount || 0,
    projectsCount: projectsCount || 0,
    totalQuotationsCount,
    totalQuotationsValue,
    totalRevenue
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Good evening, {data.profile?.full_name?.split(' ')[0] || 'User'} 👋</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="text-3xl font-bold tracking-tight">₹{data.totalRevenue.toLocaleString('en-IN')}</h2>
          </div>
          <p className="mt-2 text-xs font-medium text-green-600 flex items-center">
            ↑ 0% from last year
          </p>
        </div>

        {/* Total Quotations Value */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quoted Value</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="text-3xl font-bold tracking-tight">₹{data.totalQuotationsValue.toLocaleString('en-IN')}</h2>
          </div>
          <p className="mt-2 text-xs font-medium text-gray-400 flex items-center">
            Based on {data.totalQuotationsCount} generated quotes
          </p>
        </div>

        {/* Pending Invoices Dummy for now since we don't have invoices yet */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Invoices</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="text-3xl font-bold tracking-tight">₹0</h2>
          </div>
          <p className="mt-2 text-xs font-medium text-red-500 flex items-center">
            0 invoices overdue
          </p>
        </div>

        {/* Active Projects */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Projects</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{data.projectsCount}</h2>
          </div>
          <p className="mt-2 text-xs font-medium text-gray-400 flex items-center">
            0 due soon
          </p>
        </div>
        
        {/* New Leads */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Leads</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{data.leadsCount}</h2>
          </div>
        </div>

        {/* Quotations Count */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quotations</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{data.totalQuotationsCount}</h2>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white shadow-sm flex items-center justify-center min-h-[300px]">
          <span className="text-gray-400 font-medium">Revenue Chart (Awaiting actual data over time)</span>
        </div>
        <div className="rounded-xl border bg-white shadow-sm flex items-center justify-center min-h-[300px]">
          <span className="text-gray-400 font-medium">Sales Funnel (Awaiting more leads)</span>
        </div>
      </div>
    </div>
  )
}
