import { describe, expect, it } from 'vitest'
import { BacktestOutcomeDomain } from '~/domain/models/domains/backtest-outcome-domain'

describe('BacktestOutcomeDomain', () => {
  it.each([
    { outcome: 'hit', label: '命中', tone: 'positive' },
    { outcome: 'miss', label: '沒命中', tone: 'negative' },
    { outcome: 'neutral', label: '中性', tone: 'neutral' },
    { outcome: 'pending', label: '尚未到期', tone: 'info' },
    { outcome: 'unevaluable', label: '無法評估', tone: 'warning' },
    { outcome: 'other', label: '無法評估', tone: 'warning' },
  ])('backtest outcome $outcome → $label', ({ outcome, label, tone }) => {
    expect(new BacktestOutcomeDomain(outcome).toDto()).toMatchObject({ label, tone })
  })
})
