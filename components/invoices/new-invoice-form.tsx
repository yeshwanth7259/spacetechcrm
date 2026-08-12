'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInvoice } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewInvoiceForm({ clients, projects }: { clients: any[], projects: any[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // States for real-time calculation
  const [subtotal, setSubtotal] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [amountPaid, setAmountPaid] = useState<number>(0)
  const [taxEnabled, setTaxEnabled] = useState(false)
  const [taxRate, setTaxRate] = useState<number>(18)

  const amountAfterDiscount = Math.max(0, subtotal - discount)
  const taxAmount = taxEnabled ? (amountAfterDiscount * taxRate) / 100 : 0
  const totalAmount = amountAfterDiscount + taxAmount
  const balanceDue = Math.max(0, totalAmount - amountPaid)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    
    try {
      if (taxEnabled) {
        formData.append('tax_enabled', 'on')
      }
      await createInvoice(formData)
      router.push('/invoices')
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Invoice</CardTitle>
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
            <Label htmlFor="project_id">Project (Optional)</Label>
            <Select name="project_id">
              <SelectTrigger><SelectValue placeholder="Select a project..." /></SelectTrigger>
              <SelectContent>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_date">Invoice Date *</Label>
              <Input id="invoice_date" name="invoice_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input id="due_date" name="due_date" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtotal">Subtotal Amount (₹) *</Label>
              <Input id="subtotal" name="subtotal" type="number" required placeholder="50000" value={subtotal || ''} onChange={(e) => setSubtotal(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount Amount (₹)</Label>
              <Input id="discount" name="discount" type="number" value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value))} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="amount_paid">Amount Paid Now (₹)</Label>
              <Input id="amount_paid" name="amount_paid" type="number" value={amountPaid || ''} onChange={(e) => setAmountPaid(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="tax_enabled" 
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              checked={taxEnabled}
              onChange={(e) => setTaxEnabled(e.target.checked)}
            />
            <Label htmlFor="tax_enabled">Apply Tax (GST)</Label>
          </div>

          {taxEnabled && (
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input id="tax_rate" name="tax_rate" type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border space-y-2 mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {taxEnabled && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>GST ({taxRate}%):</span>
                <span>+₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium pt-2 border-t">
              <span>Total Invoice Amount:</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            {amountPaid > 0 && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>Amount Paid Now:</span>
                <span>-₹{amountPaid.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Balance Due:</span>
              <span className={balanceDue === 0 ? 'text-green-600' : 'text-red-600'}>
                ₹{balanceDue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
