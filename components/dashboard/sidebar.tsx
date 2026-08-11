'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  CreditCard, 
  PieChart, 
  Settings,
  LogOut,
  Building2,
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'

const adminRoutes = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', group: 'Overview' },
  
  { label: 'Leads', icon: Users, href: '/leads', group: 'Sales' },
  { label: 'Quotations', icon: FileText, href: '/quotations', group: 'Sales' },
  
  { label: 'Clients', icon: Building2, href: '/clients', group: 'Clients' },
  
  { label: 'Projects', icon: Briefcase, href: '/projects', group: 'Projects' },
  { label: 'Tasks', icon: CheckSquare, href: '/tasks', group: 'Projects' },
  
  { label: 'Invoices', icon: FileSpreadsheet, href: '/invoices', group: 'Finance' },
  { label: 'Payments', icon: CreditCard, href: '/payments', group: 'Finance' },
  
  { label: 'Analytics', icon: PieChart, href: '/analytics', group: 'Analytics' },
  
  { label: 'Team', icon: ShieldCheck, href: '/team', group: 'Admin' },
  { label: 'Settings', icon: Settings, href: '/settings', group: 'Settings' },
]

const employeeRoutes = [
  { label: 'Projects', icon: Briefcase, href: '/projects', group: 'Projects' },
  { label: 'Tasks', icon: CheckSquare, href: '/tasks', group: 'Projects' },
]

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname()

  const isAdmin = role === 'admin' || role === 'super_admin'
  const routes = isAdmin ? adminRoutes : employeeRoutes

  // Group routes by their group property
  const groupedRoutes = routes.reduce((acc, route) => {
    if (!acc[route.group]) {
      acc[route.group] = []
    }
    acc[route.group].push(route)
    return acc
  }, {} as Record<string, typeof routes>)

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white transition-all duration-300">
      <div className="flex h-16 items-center px-6 font-bold text-xl tracking-wider">
        SPACETEC <span className="text-blue-500 ml-1">PORTAL</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        {Object.entries(groupedRoutes).map(([group, groupRoutes]) => (
          <div key={group} className="mb-6">
            <h3 className="px-6 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {group}
            </h3>
            <ul className="space-y-1">
              {groupRoutes.map((route) => {
                const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`)
                
                return (
                  <li key={route.href}>
                    <Link
                      href={route.href}
                      className={cn(
                        'flex items-center px-6 py-2.5 text-sm font-medium transition-colors hover:bg-gray-800 hover:text-white',
                        isActive ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'text-gray-300'
                      )}
                    >
                      <route.icon className="mr-3 h-5 w-5" />
                      {route.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-800 p-4">
        <form action={logout}>
          <button type="submit" className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </form>
      </div>
    </div>
  )
}
