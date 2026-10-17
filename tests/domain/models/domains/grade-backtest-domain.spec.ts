import Decimal from 'decimal.js'
import { describe, expect, it } from 'vitest'
import { AnalysisBacktest } from '~/domain/models/entities/analysis-backtest'
import { GradeBacktest } from '~/domain/models/entities/grade-backtest'
import { HitRate } from '~/domain/models/entities/hit-rate'

const createAnalysisBacktest = (overrides: { outcome?: string, entryPrice?: Decimal | null, checkpointPrice?: Decimal, priceChangeRate?: Decimal, checkpointDate?: string } = {}): AnalysisBacktest =>
  new AnalysisBacktest(42, '2330', 'twStock', 'bullish', 80, 'short', new Date('2026-10-01T02:00:00Z'), overrides.entryPrice === null ? undefined : overrides.entryPrice ?? new Decimal('1000'), overrides.checkpointDate, overrides.checkpointPrice, overrides.priceChangeRate, overrides.outcome ?? 'pending')

const createGradeBacktest = (overrides: { overall?: HitRate, byConfidenceBand?: Map<string, HitRate>, neutralAverageChangeRate?: Decimal, analyses?: AnalysisBacktest[] } = {}): GradeBacktest =>
  new GradeBacktest(
    0.5,
    overrides.overall ?? new HitRate(26, 14, 0.65),
    new Map([['twStock', new HitRate(3, 1, 0.75)]]),
    new Map([['bullish', new HitRate(2, 1, 2 / 3)]]),
    overrides.byConfidenceBand ?? new Map([['high', new HitRate(0, 0, undefined)]]),
    overrides.neutralAverageChangeRate,
    new Map([['hit', 26], ['pending', 3]]),
    overrides.analyses ?? [],
  )

describe('GradeBacktestDomain', () => {
  it('shows the overall hit rate next to the random baseline', () => {
    const gradeBacktest = createGradeBacktest().toDomain().toDto()

    expect(gradeBacktest.overall).toMatchObject({ hitCount: 26, missCount: 14, hitRateText: '65%', group: { value: 'overall', label: '整體' } })
    expect(gradeBacktest.randomBaselineText).toBe('隨機 50%')
  })

  it('shows 沒有資料 rather than 0% for a group with nothing to judge', () => {
    const high = createGradeBacktest().toDomain().toDto().byConfidenceBand.find(hitRate => hitRate.group.value === 'high')

    expect(high?.hitRateText).toBe('沒有資料')
  })

  it('lists every group in a fixed order, filling missing groups with no data', () => {
    const gradeBacktest = createGradeBacktest().toDomain().toDto()

    expect(gradeBacktest.byCategory.map(hitRate => [hitRate.group.label, hitRate.hitRateText])).toEqual([['台股', '75%'], ['美股', '沒有資料'], ['加密貨幣', '沒有資料']])
    expect(gradeBacktest.byGrade.map(hitRate => hitRate.group.label)).toEqual(['強烈看多', '看多', '中性', '看空', '強烈看空'])
    expect(gradeBacktest.byGrade[1]?.hitRateText).toBe('66.67%')
    expect(gradeBacktest.byConfidenceBand.map(hitRate => hitRate.group.label)).toEqual(['低信心（0–49）', '中信心（50–74）', '高信心（75–100）'])
  })

  it('counts every backtest outcome', () => {
    const outcomeCounts = createGradeBacktest().toDomain().toDto().outcomeCounts

    expect(outcomeCounts.map(outcomeCount => [outcomeCount.outcome.label, outcomeCount.count])).toEqual([['命中', 26], ['沒命中', 0], ['中性', 0], ['尚未到期', 3], ['無法評估', 0]])
  })

  it.each([
    { neutralAverageChangeRate: new Decimal('0.03'), text: '+3%' },
    { neutralAverageChangeRate: new Decimal('-0.0125'), text: '-1.25%' },
    { neutralAverageChangeRate: new Decimal('0.012345'), text: '+1.2345%' },
    { neutralAverageChangeRate: new Decimal('-0.000012345678'), text: '-0.0012345678%' },
    { neutralAverageChangeRate: new Decimal('0'), text: '0%' },
    { neutralAverageChangeRate: undefined, text: '—' },
  ])('shows the neutral average change rate $text', ({ neutralAverageChangeRate, text }) => {
    expect(createGradeBacktest({ neutralAverageChangeRate }).toDomain().toDto().neutralAverageChangeRateText).toBe(text)
  })

  it('shows dashes for a not-yet-due analysis', () => {
    const analysis = createGradeBacktest({ analyses: [createAnalysisBacktest()] }).toDomain().toDto().analyses[0]

    expect(analysis).toMatchObject({ checkpointDateText: '—', checkpointPriceText: '—', priceChangeRateText: '—', entryPriceText: '1000' })
    expect(analysis?.outcome.label).toBe('尚未到期')
  })

  it('shows a dash for an analysis the price service cannot evaluate', () => {
    const analysis = createGradeBacktest({ analyses: [createAnalysisBacktest({ outcome: 'unevaluable', entryPrice: null })] }).toDomain().toDto().analyses[0]

    expect(analysis?.entryPriceText).toBe('—')
    expect(analysis?.outcome.label).toBe('無法評估')
  })

  it('shows the price change rate of an analysis exactly as the service gives it', () => {
    const analysis = createGradeBacktest({
      analyses: [createAnalysisBacktest({ outcome: 'hit', checkpointPrice: new Decimal('1012.345'), priceChangeRate: new Decimal('0.012345') })],
    }).toDomain().toDto().analyses[0]

    expect(analysis?.priceChangeRateText).toBe('+1.2345%')
  })

  it('shows the checkpoint figures of an evaluated analysis', () => {
    const analysis = createGradeBacktest({
      analyses: [createAnalysisBacktest({ outcome: 'hit', checkpointDate: '2026-10-15', checkpointPrice: new Decimal('1050'), priceChangeRate: new Decimal('0.05') })],
    }).toDomain().toDto().analyses[0]

    expect(analysis).toMatchObject({ analysisEventId: 42, checkpointDateText: '2026-10-15', checkpointPriceText: '1050', priceChangeRateText: '+5%' })
    expect(analysis?.outcome).toMatchObject({ label: '命中', tone: 'positive' })
    expect(analysis?.grade.label).toBe('看多')
    expect(analysis?.timeHorizon.label).toBe('短期（兩週內）')
  })
})
