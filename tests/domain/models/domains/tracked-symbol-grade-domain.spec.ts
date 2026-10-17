import { describe, expect, it } from 'vitest'
import { createTrackedSymbolGrade } from '../../../fixtures/entity-fixtures'

describe('TrackedSymbolGradeDomain', () => {
  it('summarizes the daily combined grade of a tracked symbol', () => {
    const trackedSymbolGrade = createTrackedSymbolGrade().toDomain().toDto()

    expect(trackedSymbolGrade).toMatchObject({ symbol: '2330', tradingDay: '2026-10-16', combinedScoreText: '0.85', confidence: 70, updatedAtText: '2026-10-16 13:00' })
    expect(trackedSymbolGrade.category.label).toBe('台股')
    expect(trackedSymbolGrade.grade.label).toBe('看多')
  })

  it('lays out the three sessions in order and marks missing ones as not produced', () => {
    const sessionSlots = createTrackedSymbolGrade(['intraday', 'preMarket']).toDomain().toDto().sessionSlots

    expect(sessionSlots.map(sessionSlot => sessionSlot.session.label)).toEqual(['盤前', '盤中', '盤後'])
    expect(sessionSlots[0]?.sessionGrade).toMatchObject({ confidence: 70, reason: 'preMarket 理由', riskFactors: ['風險'], keyEvents: [{ title: 'preMarket 事件', link: 'https://news.example/preMarket' }] })
    expect(sessionSlots[1]?.sessionGrade?.grade.label).toBe('看多')
    expect(sessionSlots[2]?.sessionGrade).toBeUndefined()
    expect(sessionSlots[2]?.emptyText).toBe('尚未產生')
  })
})
