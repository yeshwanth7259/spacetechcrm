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

export async function getCompanySettings() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .limit(1)
    .single()
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    throw new Error(error.message)
  }
  
  return data
}

export async function updateCompanySettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const settings = {
    company_name: formData.get('company_name') as string,
    logo_url: formData.get('logo_url') as string || null,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    website: formData.get('website') as string || null,
    address: formData.get('address') as string || null,
    city: formData.get('city') as string || null,
    state: formData.get('state') as string || null,
    country: formData.get('country') as string || 'India',
    gst_number: formData.get('gst_number') as string || null,
    default_quotation_terms: formData.get('default_quotation_terms') as string || null,
    default_payment_terms: formData.get('default_payment_terms') as string || null,
    updated_by: user.id,
    updated_at: new Date().toISOString()
  }

  // Check if settings already exist
  const existing = await getCompanySettings()
  
  let result
  if (existing) {
    result = await supabase
      .from('company_settings')
      .update(settings)
      .eq('id', existing.id)
  } else {
    result = await supabase
      .from('company_settings')
      .insert([settings])
  }

  if (result.error) {
    throw new Error(result.error.message)
  }

  revalidatePath('/settings')
  return { success: true }
}
