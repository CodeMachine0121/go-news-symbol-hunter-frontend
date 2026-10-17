import { describe, expect, it } from 'vitest'
import { ConfidenceBandDomain } from '~/domain/models/domains/confidence-band-domain'

describe('ConfidenceBandDomain', () => {
  it.each([
    { band: 'low', label: '低信心（0–49）' },
    { band: 'medium', label: '中信心（50–74）' },
    { band: 'high', label: '高信心（75–100）' },
    { band: 'extreme', label: 'extreme' },
  ])('confidence band $band → $label', ({ band, label }) => {
    expect(new ConfidenceBandDomain(band).toDto().label).toBe(label)
  })
})
