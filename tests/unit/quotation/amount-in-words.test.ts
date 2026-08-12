import { describe, it, expect } from 'vitest'
import { amountInWords } from '../../../lib/utils/currency'

describe('amountInWords', () => {
  it('converts exact hundreds/thousands correctly', () => {
    expect(amountInWords(100)).toContain('One Hundred')
    expect(amountInWords(1000)).toContain('One Thousand')
    expect(amountInWords(10000)).toContain('Ten Thousand')
    expect(amountInWords(50000)).toContain('Fifty Thousand')
    expect(amountInWords(80000)).toContain('Eighty Thousand')
    expect(amountInWords(100000)).toContain('One Lakh')
    expect(amountInWords(1000000)).toContain('Ten Lakh')
  })

  it('converts complex numbers in Indian numbering system', () => {
    expect(amountInWords(80500)).toContain('Eighty Thousand Five Hundred')
    expect(amountInWords(125000)).toContain('One Lakh Twenty Five Thousand')
    expect(amountInWords(1050000)).toContain('Ten Lakh Fifty Thousand')
  })

  it('handles zero and edge cases', () => {
    expect(amountInWords(0)).toBe('Zero Rupees Only')
    // Should safely handle undefined or NaN
    expect(amountInWords(NaN)).toBe('Zero Rupees Only')
  })
})
