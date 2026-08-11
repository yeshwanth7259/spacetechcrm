'use client'

import { useState } from 'react'
import { bulkUploadLeads } from '@/app/actions/leads'
import { Button } from '@/components/ui/button'
import { Upload, FileUp, CheckCircle, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function BulkUploadLeads() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null)

  async function handleUpload(formData: FormData) {
    setIsSubmitting(true)
    setResult(null)
    
    try {
      const res = await bulkUploadLeads(formData)
      setResult(res)
      if (res.success) {
        setTimeout(() => setIsOpen(false), 2000)
      }
    } catch (err: any) {
      setResult({ error: err.message || 'Failed to upload CSV' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="outline" className="border-dashed bg-white" />}>
        <Upload className="mr-2 h-4 w-4" /> Bulk Import CSV
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Import Leads</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md border">
            <p className="font-medium text-gray-700 mb-2">CSV Format Requirements:</p>
            <p>Your Excel/CSV file must have these exact column headers in row 1:</p>
            <code className="block mt-2 font-mono bg-white p-2 rounded border">phone, company_name, name, email</code>
            <p className="mt-2 text-xs text-gray-400">*email is optional</p>
          </div>

          {result?.success && (
            <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Successfully imported {result.count} leads!
            </div>
          )}

          {result?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {result.error}
            </div>
          )}

          <form action={handleUpload} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="csv">Upload CSV File</Label>
              <Input id="csv" name="file" type="file" accept=".csv" required />
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Processing...' : (
                <>
                  <FileUp className="mr-2 h-4 w-4" /> Upload and Import
                </>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
