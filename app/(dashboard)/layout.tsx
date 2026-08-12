import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen print:h-auto bg-gray-50 print:bg-white overflow-hidden print:overflow-visible">
      <div className="print:hidden">
        <Sidebar role={profile?.role} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible print:block">
        <div className="print:hidden">
          <Header profile={profile} />
        </div>
        <main className="flex-1 overflow-y-auto print:overflow-visible p-6 print:p-0">
          {children}
        </main>
      </div>
    </div>
  )
}
