'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCompanySettings } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SettingsForm({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setMessage(null)
    
    try {
      await updateCompanySettings(formData)
      setMessage({ type: 'success', text: 'Settings updated successfully!' })
      router.refresh()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update settings' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-4xl">
      {message && (
        <div className={`p-4 rounded-md font-medium text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing & Quotations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Your public company information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input id="company_name" name="company_name" required defaultValue={initialData?.company_name} placeholder="SpaceTec Solutions" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                <Input id="logo_url" name="logo_url" defaultValue={initialData?.logo_url} placeholder="https://example.com/logo.png" />
                <p className="text-xs text-gray-500">Paste an image link for your logo. We will add direct file upload later.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Public Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={initialData?.email} placeholder="contact@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" defaultValue={initialData?.phone} placeholder="+91 98765 43210" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" type="url" defaultValue={initialData?.website} placeholder="https://www.example.com" />
              </div>

              <div className="space-y-2 pt-4">
                <h3 className="text-sm font-medium">Address Information</h3>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Textarea id="address" name="address" defaultValue={initialData?.address} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" defaultValue={initialData?.city} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" defaultValue={initialData?.state} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" name="country" defaultValue={initialData?.country || 'India'} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Quotations</CardTitle>
              <CardDescription>Configure how your generated PDFs look and the default terms.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gst_number">GST Number (Optional)</Label>
                <Input id="gst_number" name="gst_number" defaultValue={initialData?.gst_number} placeholder="22AAAAA0000A1Z5" />
                <p className="text-xs text-gray-500">This will be printed on all Quotations and Invoices.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default_quotation_terms">Default Terms & Conditions</Label>
                <Textarea 
                  id="default_quotation_terms" 
                  name="default_quotation_terms" 
                  defaultValue={initialData?.default_quotation_terms} 
                  className="h-32"
                  placeholder="1. Validity of this quotation is 30 days.&#10;2. 50% advance payment required..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_payment_terms">Default Bank / Payment Details</Label>
                <Textarea 
                  id="default_payment_terms" 
                  name="default_payment_terms" 
                  defaultValue={initialData?.default_payment_terms} 
                  className="h-24"
                  placeholder="Bank: HDFC Bank&#10;Account No: 123456789&#10;IFSC: HDFC0001234"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 px-8">
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  )
}
