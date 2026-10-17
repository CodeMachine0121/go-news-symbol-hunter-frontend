import { describe, expect, it } from 'vitest'
import { GradeDomain } from '~/domain/models/domains/grade-domain'

describe('GradeDomain', () => {
  it.each([
    { grade: 'strongBullish', label: '強烈看多', tone: 'positive' },
    { grade: 'bullish', label: '看多', tone: 'positive' },
    { grade: 'neutral', label: '中性', tone: 'neutral' },
    { grade: 'bearish', label: '看空', tone: 'negative' },
    { grade: 'strongBearish', label: '強烈看空', tone: 'negative' },
    { grade: 'moon', label: '中性', tone: 'neutral' },
  ])('grade $grade → $label ($tone)', ({ grade, label, tone }) => {
    expect(new GradeDomain(grade).toDto()).toMatchObject({ label, tone })
  })
})
