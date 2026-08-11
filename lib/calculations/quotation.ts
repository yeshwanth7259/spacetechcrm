import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

export function useQuotationCalculation({ control }: { control: any }) {
  const items = useWatch({ control, name: 'items' }) || []
  const discount = useWatch({ control, name: 'discount' }) || 0
  const tax_enabled = useWatch({ control, name: 'tax_enabled' }) || false
  const tax_rate = useWatch({ control, name: 'tax_rate' }) || 0

  const calculations = useMemo(() => {
    let subtotal = 0
    
    // First, map over items to calculate individual totals
    const calculatedItems = items.map((item: any) => {
      let amount = Number(item.amount) || 0
      
      if (item.pricing_mode === 'calculated') {
        const qty = Number(item.quantity) || 0
        const price = Number(item.unit_price) || 0
        amount = qty * price
      }
      
      const itemDiscount = Number(item.discount) || 0
      const total = amount - itemDiscount
      
      subtotal += total
      
      return { ...item, amount, total }
    })
    
    const numDiscount = Number(discount) || 0
    const taxableAmount = Math.max(0, subtotal - numDiscount)
    
    let tax_amount = 0
    if (tax_enabled) {
      tax_amount = (taxableAmount * Number(tax_rate)) / 100
    }
    
    const total_amount = taxableAmount + tax_amount
    
    return {
      items: calculatedItems,
      subtotal,
      discount: numDiscount,
      taxableAmount,
      tax_amount,
      total_amount
    }
  }, [items, discount, tax_enabled, tax_rate])

  return calculations
}
