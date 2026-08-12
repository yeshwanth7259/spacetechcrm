import { describe, it, expect } from 'vitest'
import { calculateQuotationTotals } from '../../../lib/calculations/quotation'

describe('calculateQuotationTotals', () => {
  it('calculates subtotal for a single manual item', () => {
    const result = calculateQuotationTotals({
      items: [{ pricing_mode: 'manual', amount: 40000 }],
      discount: 0,
      tax_enabled: false,
      tax_rate: 0
    })
    expect(result.subtotal).toBe(40000)
    expect(result.total_amount).toBe(40000)
  })

  it('calculates subtotal for multiple manual items', () => {
    const result = calculateQuotationTotals({
      items: [
        { pricing_mode: 'manual', amount: 40000 },
        { pricing_mode: 'manual', amount: 15000 },
        { pricing_mode: 'manual', amount: 5000 }
      ],
      discount: 0,
      tax_enabled: false,
      tax_rate: 0
    })
    expect(result.subtotal).toBe(60000)
    expect(result.total_amount).toBe(60000)
  })

  it('calculates item total for qty * price mode', () => {
    const result = calculateQuotationTotals({
      items: [
        { pricing_mode: 'calculated', quantity: 10, unit_price: 1500 }
      ],
      discount: 0,
      tax_enabled: false,
      tax_rate: 0
    })
    expect(result.subtotal).toBe(15000)
    expect(result.items[0].amount).toBe(15000)
  })

  it('calculates combinations of manual and calculated items', () => {
    const result = calculateQuotationTotals({
      items: [
        { pricing_mode: 'manual', amount: 10000 },
        { pricing_mode: 'calculated', quantity: 5, unit_price: 2000 }
      ],
      discount: 0,
      tax_enabled: false,
      tax_rate: 0
    })
    expect(result.subtotal).toBe(20000)
  })

  it('applies global discount correctly', () => {
    const result = calculateQuotationTotals({
      items: [{ pricing_mode: 'manual', amount: 60000 }],
      discount: 10000,
      tax_enabled: false,
      tax_rate: 0
    })
    expect(result.taxableAmount).toBe(50000)
    expect(result.total_amount).toBe(50000)
  })

  it('calculates GST correctly when enabled (18%)', () => {
    const result = calculateQuotationTotals({
      items: [{ pricing_mode: 'manual', amount: 60000 }],
      discount: 10000, // taxable = 50000
      tax_enabled: true,
      tax_rate: 18
    })
    expect(result.taxableAmount).toBe(50000)
    expect(result.tax_amount).toBe(9000)
    expect(result.total_amount).toBe(59000)
  })

  it('calculates GST correctly for different rates (5%, 12%, 28%)', () => {
    const baseInput = {
      items: [{ pricing_mode: 'manual', amount: 100000 }],
      discount: 0,
      tax_enabled: true,
    }
    
    expect(calculateQuotationTotals({ ...baseInput, tax_rate: 5 }).tax_amount).toBe(5000)
    expect(calculateQuotationTotals({ ...baseInput, tax_rate: 12 }).tax_amount).toBe(12000)
    expect(calculateQuotationTotals({ ...baseInput, tax_rate: 28 }).tax_amount).toBe(28000)
    expect(calculateQuotationTotals({ ...baseInput, tax_rate: 0 }).tax_amount).toBe(0)
  })

  it('does not apply GST when tax_enabled is false', () => {
    const result = calculateQuotationTotals({
      items: [{ pricing_mode: 'manual', amount: 100000 }],
      discount: 0,
      tax_enabled: false,
      tax_rate: 18
    })
    expect(result.tax_amount).toBe(0)
    expect(result.total_amount).toBe(100000)
  })

  it('handles discount > subtotal gracefully (no negative totals)', () => {
    const result = calculateQuotationTotals({
      items: [{ pricing_mode: 'manual', amount: 5000 }],
      discount: 10000, // Discount is more than subtotal
      tax_enabled: true,
      tax_rate: 18
    })
    expect(result.taxableAmount).toBe(0)
    expect(result.tax_amount).toBe(0)
    expect(result.total_amount).toBe(0)
  })

  it('handles edge cases (empty amount, undefined, 0)', () => {
    const result = calculateQuotationTotals({
      items: [
        { pricing_mode: 'manual', amount: "" }, // Empty string
        { pricing_mode: 'manual', amount: undefined }, // Undefined
        { pricing_mode: 'manual', amount: 0 }, // Zero
        { pricing_mode: 'calculated', quantity: 0, unit_price: 1500 } // Zero qty
      ],
      discount: 0,
      tax_enabled: false,
      tax_rate: 0
    })
    expect(result.subtotal).toBe(0)
    expect(result.total_amount).toBe(0)
  })

  it('handles decimal values accurately', () => {
    const result = calculateQuotationTotals({
      items: [{ pricing_mode: 'calculated', quantity: 2, unit_price: 10.55 }],
      discount: 0,
      tax_enabled: true,
      tax_rate: 18
    })
    // 21.1 subtotal
    // tax = 21.1 * 0.18 = 3.798
    expect(result.subtotal).toBe(21.1)
    expect(result.tax_amount).toBeCloseTo(3.798)
    expect(result.total_amount).toBeCloseTo(24.898)
  })
})
