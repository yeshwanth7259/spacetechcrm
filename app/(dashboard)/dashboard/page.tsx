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

  // Fetch actual counts in parallel to prevent waterfall
  const [
    { count: leadsCount },
    { count: projectsCount },
    { data: quotations },
    { data: payments },
    { data: invoices }
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('quotations').select('total_amount, status'),
    supabase.from('payments').select('amount'),
    supabase.from('invoices').select('amount_due, due_date').neq('status', 'paid')
  ])

  const totalQuotationsCount = quotations?.length || 0
  const totalQuotationsValue = quotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0
  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  
  // Calculate pending invoices
  const pendingInvoicesAmount = invoices?.reduce((sum, inv) => sum + (inv.amount_due || 0), 0) || 0
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdueCount = invoices?.filter(inv => {
    if (!inv.due_date) return false
    return new Date(inv.due_date) < today
  }).length || 0

  return {
    profile,
    leadsCount: leadsCount || 0,
    projectsCount: projectsCount || 0,
    totalQuotationsCount,
    totalQuotationsValue,
    totalRevenue,
    pendingInvoicesAmount,
    overdueCount
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

        {/* Pending Invoices */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Invoices</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="text-3xl font-bold tracking-tight">₹{data.pendingInvoicesAmount.toLocaleString('en-IN')}</h2>
          </div>
          <p className={`mt-2 text-xs font-medium flex items-center ${data.overdueCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
            {data.overdueCount} {data.overdueCount === 1 ? 'invoice' : 'invoices'} overdue
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
