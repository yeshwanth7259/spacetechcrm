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

export type QuotationInput = {
  client_id: string
  quotation_date: string
  valid_until: string
  subtotal: number
  discount: number
  tax_enabled: boolean
  tax_rate: number
  tax_amount: number
  total_amount: number
  payment_terms?: string
  terms_conditions?: string
  notes?: string
  status: 'draft' | 'generated'
  items: Array<{
    description: string
    quantity?: number
    unit_price?: number
    amount: number
    discount?: number
    total: number
    pricing_mode: 'manual' | 'calculated'
  }>
}

export async function createQuotation(data: QuotationInput) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
    
  // Generate quotation number ST-QT-YYYY-XXXX
  const quotation_number = `ST-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  
  const { items, ...quotationData } = data
  
  // Insert Quotation
  const { data: quotation, error: qError } = await supabase
    .from('quotations')
    .insert({
      ...quotationData,
      quotation_number,
      created_by: user.id
    })
    .select()
    .single()
    
  if (qError) throw new Error(qError.message)
  
  // Insert Items
  const itemsToInsert = items.map((item, index) => ({
    ...item,
    quotation_id: quotation.id,
    sort_order: index
  }))
  
  const { error: iError } = await supabase
    .from('quotation_items')
    .insert(itemsToInsert)
    
  if (iError) {
    // Ideally rollback quotation here, but Supabase JS doesn't support transactions via REST
    // We would use an RPC or just let it be for V1
    throw new Error(iError.message)
  }
  
  revalidatePath('/quotations')
  return quotation
}
