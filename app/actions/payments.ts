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

export async function getPayments() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
    
  const { data, error } = await supabase
    .from('payments')
    .select('*, clients(company_name), invoices(invoice_number)')
    .order('created_at', { ascending: false })
    
  if (error) throw new Error(error.message)
  return data
}

export async function createPayment(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const amount = Number(formData.get('amount'))
  const invoice_id = formData.get('invoice_id') as string || null
  
  const payment = {
    payment_number: `RCPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    client_id: formData.get('client_id') as string,
    invoice_id,
    amount,
    payment_date: formData.get('payment_date') as string,
    payment_method: formData.get('payment_method') as string,
    transaction_id: formData.get('transaction_id') as string || null,
    notes: formData.get('notes') as string || null,
    created_by: user.id
  }
  
  const { error } = await supabase.from('payments').insert(payment)
  if (error) throw new Error(error.message)
  
  // If payment is linked to an invoice, we should update the invoice amount_paid
  if (invoice_id) {
    // 1. Fetch current invoice
    const { data: inv } = await supabase.from('invoices').select('amount_paid, amount_due, total').eq('id', invoice_id).single()
    
    if (inv) {
      const new_amount_paid = Number(inv.amount_paid) + amount
      const new_amount_due = Math.max(0, Number(inv.total) - new_amount_paid)
      const new_status = new_amount_due <= 0 ? 'paid' : 'partial'
      
      await supabase
        .from('invoices')
        .update({ 
          amount_paid: new_amount_paid, 
          amount_due: new_amount_due,
          status: new_status
        })
        .eq('id', invoice_id)
    }
  }
  
  revalidatePath('/payments')
  revalidatePath('/invoices')
}
