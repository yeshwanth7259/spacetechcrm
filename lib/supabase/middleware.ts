import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, restrict access based on role
  if (user && !request.nextUrl.pathname.startsWith('/login')) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || 'employee'
    const isAdmin = role === 'admin' || role === 'super_admin'

    // Routes that are strictly for admins
    const adminRoutes = ['/leads', '/quotations', '/clients', '/invoices', '/payments', '/analytics', '/team', '/settings']
    
    // If employee tries to access an admin route, redirect to projects
    if (!isAdmin) {
      const isTryingToAccessAdminRoute = adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))
      // Also restrict the main /dashboard route since it has financial metrics
      const isDashboardRoot = request.nextUrl.pathname === '/dashboard' || request.nextUrl.pathname === '/'
      
      if (isTryingToAccessAdminRoute || isDashboardRoot) {
        const url = request.nextUrl.clone()
        url.pathname = '/projects'
        return NextResponse.redirect(url)
      }
    }
    
    // If Admin hits root, redirect to dashboard
    if (isAdmin && request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  if (
    user &&
    request.nextUrl.pathname.startsWith('/login')
  ) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
    const url = request.nextUrl.clone()
    url.pathname = isAdmin ? '/dashboard' : '/projects'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
