'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuotationCalculation } from '@/lib/calculations/quotation'
import { amountInWords } from '@/lib/utils/currency'
import { createQuotation } from '@/app/actions/quotations'

export function QuotationForm({ clients }: { clients: any[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm({
    defaultValues: {
      client_id: '',
      quotation_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        { description: '', pricing_mode: 'manual', amount: 0, quantity: 1, unit_price: 0, discount: 0 }
      ],
      discount: 0,
      tax_enabled: false,
      tax_rate: 18,
      notes: '',
      terms_conditions: '1. 50% advance payment.\n2. Remaining payment on completion.',
      payment_terms: '50% Advance / 50% Completion'
    }
  })

  const { control, register, handleSubmit, watch, setValue } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  const calculations = useQuotationCalculation({ control })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await createQuotation({
        ...data,
        ...calculations,
        status: 'draft'
      })
      router.push('/quotations')
    } catch (error) {
      console.error(error)
      alert('Failed to save quotation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const taxEnabled = watch('tax_enabled')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Select Client</Label>
            <Select onValueChange={(val) => setValue('client_id', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment Terms</Label>
            <Select defaultValue="50% Advance / 50% Completion" onValueChange={(val) => setValue('payment_terms', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50% Advance / 50% Completion">50% Advance / 50% Completion</SelectItem>
                <SelectItem value="100% Advance">100% Advance</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quotation Date</Label>
            <Input type="date" {...register('quotation_date')} />
          </div>
          <div className="space-y-2">
            <Label>Valid Until</Label>
            <Input type="date" {...register('valid_until')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services & Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Mode</div>
            <div className="col-span-2 text-right">Rate / Qty</div>
            <div className="col-span-3 text-right">Amount (₹)</div>
            <div className="col-span-1"></div>
          </div>
          
          {fields.map((field, index) => {
            const mode = watch(`items.${index}.pricing_mode`)
            return (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border-b md:border-0 pb-4 md:pb-0">
                <div className="col-span-1 md:col-span-4 space-y-2">
                  <Input placeholder="Service description" {...register(`items.${index}.description` as const, { required: true })} />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Select 
                    value={mode} 
                    onValueChange={(val: any) => setValue(`items.${index}.pricing_mode` as const, val)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Amount</SelectItem>
                      <SelectItem value="calculated">Qty × Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {mode === 'calculated' ? (
                  <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Qty" {...register(`items.${index}.quantity` as const)} />
                    <Input type="number" placeholder="Price" {...register(`items.${index}.unit_price` as const)} />
                  </div>
                ) : (
                  <div className="col-span-1 md:col-span-2">
                    <div className="h-10 flex items-center text-sm text-gray-400 italic px-2">Not applicable</div>
                  </div>
                )}
                
                <div className="col-span-1 md:col-span-3 space-y-2">
                  {mode === 'manual' ? (
                     <Input type="number" placeholder="Amount" {...register(`items.${index}.amount` as const)} className="text-right" />
                  ) : (
                     <div className="h-10 flex items-center justify-end px-3 bg-gray-50 border rounded-md font-medium">
                       ₹ {calculations.items[index]?.amount.toLocaleString('en-IN') || 0}
                     </div>
                  )}
                </div>
                
                <div className="col-span-1 flex items-center justify-end md:justify-center pt-2 md:pt-0">
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
          
          <div className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => append({ description: '', pricing_mode: 'manual', amount: 0, quantity: 1, unit_price: 0, discount: 0 })}
              className="w-full md:w-auto border-dashed text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-50"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                  {...register('terms_conditions')}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                  {...register('notes')}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-6">
            <CardHeader className="pb-4 border-b">
              <CardTitle>Calculation Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-500">Subtotal</span>
                <span>₹ {calculations.subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Discount (₹)</span>
                <Input type="number" className="w-32 text-right h-8" {...register('discount')} />
              </div>

              {Number(watch('discount')) > 0 && (
                <div className="flex justify-between items-center text-sm font-medium pt-2 border-t border-dashed">
                  <span className="text-gray-500">Taxable Amount</span>
                  <span>₹ {calculations.taxableAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="tax_enabled" 
                      checked={taxEnabled} 
                      onCheckedChange={(c) => setValue('tax_enabled', c as boolean)} 
                    />
                    <label htmlFor="tax_enabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Apply GST
                    </label>
                  </div>
                  
                  {taxEnabled && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Rate %</span>
                      <Input type="number" className="w-20 text-right h-8" {...register('tax_rate')} />
                    </div>
                  )}
                </div>

                {taxEnabled && (
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="text-gray-500">GST Amount</span>
                    <span>₹ {calculations.tax_amount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-lg font-bold pt-4 border-t border-gray-200">
                <span>GRAND TOTAL</span>
                <span className="text-blue-600">₹ {calculations.total_amount.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="text-xs text-right font-medium text-gray-500 italic">
                {amountInWords(calculations.total_amount)}
              </div>
              
              <div className="pt-6 grid grid-cols-2 gap-4">
                <Button type="button" variant="outline" className="w-full">
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Draft'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
