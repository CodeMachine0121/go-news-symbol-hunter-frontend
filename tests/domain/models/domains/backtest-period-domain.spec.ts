import { describe, expect, it } from 'vitest'
import { InvalidInputError } from '~/domain/errors/invalid-input-error'
import { BacktestPeriodDomain } from '~/domain/models/domains/backtest-period-domain'

describe('BacktestPeriodDomain', () => {
  it.each([
    { from: '', to: '', completedFrom: undefined, completedTo: undefined },
    { from: '2026-10-01', to: '', completedFrom: '2026-10-01', completedTo: undefined },
    { from: '', to: '2026-10-31', completedFrom: undefined, completedTo: '2026-10-31' },
    { from: '2026-10-01', to: '2026-10-01', completedFrom: '2026-10-01', completedTo: '2026-10-01' },
    { from: ' 2026-10-01 ', to: ' 2026-10-31 ', completedFrom: '2026-10-01', completedTo: '2026-10-31' },
  ])('accepts from "$from" to "$to"', ({ from, to, completedFrom, completedTo }) => {
    expect(new BacktestPeriodDomain(from, to)).toMatchObject({ completedFrom, completedTo })
  })

  it.each([
    { from: '2026-10-10', to: '2026-10-01' },
    { from: '2026/10/01', to: '' },
    { from: '', to: 'yesterday' },
    { from: 'x2026-10-01', to: '' },
    { from: '', to: '2026-10-31x' },
  ])('rejects from "$from" to "$to" as 期間不正確', ({ from, to }) => {
    expect(() => new BacktestPeriodDomain(from, to)).toThrow(new InvalidInputError('期間不正確'))
  })
})
