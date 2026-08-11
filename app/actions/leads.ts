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
        getAll() {
          return cookieStore.getAll()
        },
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

export async function getLeads() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (error) throw new Error(error.message)
  return data
}

export async function createLead(formData: FormData) {
  const supabase = await createClient()
  
  // Extract user info
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Generate a lead number
  const lead_number = `LD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  
  const lead = {
    lead_number,
    name: formData.get('name') as string,
    company_name: formData.get('company_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    status: 'new',
    assigned_to: user.id
  }
  
  const { error } = await supabase.from('leads').insert(lead)
  if (error) throw new Error(error.message)
  
  revalidatePath('/leads')
}

export async function convertLeadToClient(leadId: string) {
  const supabase = await createClient()
  
  // 1. Fetch Lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()
    
  if (leadError || !lead) throw new Error('Lead not found')
  
  // 2. Generate Client Code
  const client_code = `CL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  
  // 3. Create Client
  const client = {
    client_code,
    company_name: lead.company_name || lead.name,
    contact_name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: 'active'
  }
  
  const { data: newClient, error: clientError } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single()
    
  if (clientError) throw new Error(clientError.message)
  
  // 4. Update Lead Status
  await supabase
    .from('leads')
    .update({ status: 'won' })
    .eq('id', leadId)
    
  revalidatePath('/leads')
  revalidatePath('/clients')
  
  return newClient
}

export async function markLeadLost(leadId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('leads')
    .update({ status: 'lost' })
    .eq('id', leadId)
    
  if (error) throw new Error(error.message)
  
  revalidatePath('/leads')
}

export async function bulkUploadLeads(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  const text = await file.text()
  
  // Basic CSV parser (split by newline and comma)
  const rows = text.split('\n').filter(row => row.trim().length > 0)
  if (rows.length < 2) throw new Error('CSV must contain a header row and data')

  const headers = rows[0].split(',').map(h => h.trim().toLowerCase())
  
  // Expected headers: phone, company_name, name, email (optional)
  
  const leadsToInsert = []
  
  for (let i = 1; i < rows.length; i++) {
    // Basic comma split (doesn't handle commas inside quotes, but good for MVP)
    const values = rows[i].split(',').map(v => v.trim())
    const rowData: any = {}
    
    headers.forEach((header, index) => {
      rowData[header] = values[index] || ''
    })
    
    if (rowData.phone && rowData.company_name && rowData.name) {
      const lead_number = `LD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${i}`
      leadsToInsert.push({
        lead_number,
        phone: rowData.phone,
        company_name: rowData.company_name,
        name: rowData.name,
        email: rowData.email || null,
        status: 'new',
        assigned_to: user.id
      })
    }
  }

  if (leadsToInsert.length > 0) {
    const { error } = await supabase.from('leads').insert(leadsToInsert)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/leads')
  return { success: true, count: leadsToInsert.length }
}
