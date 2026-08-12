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

export async function getInvoices() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
    
  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(company_name), projects(name)')
    .order('created_at', { ascending: false })
    
  if (error) throw new Error(error.message)
  return data
}

export async function createInvoice(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  if (!formData.get('client_id')) return { error: 'Client is required' }
  
  const subtotal = Number(formData.get('subtotal')) || 0
  const discount = Number(formData.get('discount')) || 0
  const amount_paid = Number(formData.get('amount_paid')) || 0
  const tax_enabled = formData.get('tax_enabled') === 'on'
  const tax_rate = tax_enabled ? Number(formData.get('tax_rate')) : 0
  
  const amount_after_discount = subtotal - discount
  const tax_amount = tax_enabled ? (amount_after_discount * tax_rate) / 100 : 0
  const total = amount_after_discount + tax_amount
  const amount_due = Math.max(0, total - amount_paid)
  
  const invoice = {
    invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    client_id: formData.get('client_id') as string,
    project_id: formData.get('project_id') ? formData.get('project_id') as string : null,
    invoice_date: formData.get('invoice_date') as string,
    due_date: formData.get('due_date') as string,
    subtotal,
    discount,
    tax_enabled,
    tax_rate,
    tax_amount,
    total,
    amount_due,
    amount_paid,
    status: amount_due === 0 ? 'paid' : (amount_paid > 0 ? 'partial' : 'draft')
  }
  
  const { data: insertedInvoice, error } = await supabase.from('invoices').insert(invoice).select().single()
  if (error) return { error: error.message }
  
  if (amount_paid > 0 && insertedInvoice) {
    const payment = {
      payment_number: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      invoice_id: insertedInvoice.id,
      client_id: invoice.client_id,
      amount: amount_paid,
      payment_date: invoice.invoice_date,
      payment_method: 'Advance',
      notes: 'Initial payment upon invoice creation'
    }
    await supabase.from('payments').insert(payment)
  }
  
  revalidatePath('/invoices')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getInvoiceById(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
    
  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(*), projects(*)')
    .eq('id', id)
    .single()
    
  if (error) throw new Error(error.message)
  return data
}

export async function updateInvoice(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  if (!formData.get('client_id')) return { error: 'Client is required' }
  
  const subtotal = Number(formData.get('subtotal')) || 0
  const discount = Number(formData.get('discount')) || 0
  
  // Note: amount_paid is handled during creation. For updates, we usually don't 
  // let them edit amount_paid directly unless we sync payments table too.
  // For simplicity, we just keep the existing amount_paid on the invoice.
  const { data: existingInvoice } = await supabase.from('invoices').select('amount_paid').eq('id', id).single()
  const amount_paid = existingInvoice?.amount_paid || 0
  
  const tax_enabled = formData.get('tax_enabled') === 'on'
  const tax_rate = tax_enabled ? Number(formData.get('tax_rate')) : 0
  
  const amount_after_discount = subtotal - discount
  const tax_amount = tax_enabled ? (amount_after_discount * tax_rate) / 100 : 0
  const total = amount_after_discount + tax_amount
  const amount_due = Math.max(0, total - amount_paid)
  
  const updates = {
    client_id: formData.get('client_id') as string,
    project_id: formData.get('project_id') ? formData.get('project_id') as string : null,
    invoice_date: formData.get('invoice_date') as string,
    due_date: formData.get('due_date') as string,
    subtotal,
    discount,
    tax_enabled,
    tax_rate,
    tax_amount,
    total,
    amount_due,
    status: amount_due === 0 ? 'paid' : (amount_paid > 0 ? 'partial' : 'draft')
  }
  
  const { error } = await supabase.from('invoices').update(updates).eq('id', id)
  if (error) return { error: error.message }
  
  revalidatePath('/invoices')
  revalidatePath(`/invoices/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}
