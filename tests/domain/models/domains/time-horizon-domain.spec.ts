import { describe, expect, it } from 'vitest'
import { TimeHorizonDomain } from '~/domain/models/domains/time-horizon-domain'

describe('TimeHorizonDomain', () => {
  it.each([
    { timeHorizon: 'short', label: '短期（兩週內）' },
    { timeHorizon: 'mid', label: '中期（三個月內）' },
    { timeHorizon: 'long', label: '短期（兩週內）' },
  ])('time horizon $timeHorizon → $label', ({ timeHorizon, label }) => {
    expect(new TimeHorizonDomain(timeHorizon).toDto().label).toBe(label)
  })
})
