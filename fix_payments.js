import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixPayments() {
  // Find invoices that have amount_paid > 0
  const { data: invoices, error: invError } = await supabase
    .from('invoices')
    .select('*')
    .gt('amount_paid', 0)

  if (invError) {
    console.error('Error fetching invoices:', invError)
    return
  }

  for (const inv of invoices) {
    // Check if a payment already exists
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('id')
      .eq('invoice_id', inv.id)

    if (existingPayments && existingPayments.length === 0) {
      console.log(`Creating missing payment for invoice ${inv.invoice_number}...`)
      const payment = {
        payment_number: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_id: inv.id,
        client_id: inv.client_id,
        amount: inv.amount_paid,
        payment_date: inv.invoice_date,
        payment_method: 'Advance',
        notes: 'Backfilled initial payment'
      }
      const { error: payError } = await supabase.from('payments').insert(payment)
      if (payError) console.error('Error creating payment:', payError)
      else console.log('Successfully created payment for', inv.invoice_number)
    }
  }
  console.log('Done fixing payments!')
}

fixPayments()
