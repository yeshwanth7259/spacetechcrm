'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function getProjects() {
  const supabase = await createClient()
  
  // Need to get current user to filter if employee
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
    
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  
  let query = supabase
    .from('projects')
    .select('*, clients(company_name)')
    .order('created_at', { ascending: false })
    
  if (!isAdmin) {
    // If not admin, maybe only show projects assigned to them or their department
    // But for V1, let's just let employees see all projects they have tasks in, or just all projects if it's a small agency.
    // We'll let them see all active projects for now.
    query = query.eq('status', 'active')
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const project = {
    client_id: formData.get('client_id') as string,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    status: formData.get('status') as string || 'planning',
    start_date: formData.get('start_date') as string || null,
    end_date: formData.get('end_date') as string || null,
    budget: formData.get('budget') ? Number(formData.get('budget')) : null
  }
  
  const { error } = await supabase.from('projects').insert(project)
  if (error) throw new Error(error.message)
  
  revalidatePath('/projects')
}
