'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPayment } from '@/app/actions/payments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export default function NewPaymentForm({ clients, invoices }: { clients: any[], invoices: any[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    
    try {
      await createPayment(formData)
      router.push('/payments')
    } catch (err: any) {
      setError(err.message || 'Failed to record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="client_id">Client *</Label>
            <Select name="client_id" required>
              <SelectTrigger><SelectValue placeholder="Select a client..." /></SelectTrigger>
              <SelectContent>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_id">Link to Invoice (Optional)</Label>
            <Select name="invoice_id">
              <SelectTrigger><SelectValue placeholder="Select an invoice..." /></SelectTrigger>
              <SelectContent>
                {invoices?.map((i) => (
                  <SelectItem key={i.id} value={i.id}>{i.invoice_number} (Due: ₹{i.amount_due})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Linking an invoice will automatically update its paid amount.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Received (₹) *</Label>
              <Input id="amount" name="amount" type="number" required placeholder="50000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input id="payment_date" name="payment_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select name="payment_method" defaultValue="NEFT/IMPS">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEFT/IMPS">NEFT / IMPS</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_id">Transaction / Reference ID</Label>
              <Input id="transaction_id" name="transaction_id" placeholder="Optional" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Any internal notes about this payment..." />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? 'Saving...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
