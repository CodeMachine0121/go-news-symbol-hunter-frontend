import { AnalysisEventDto } from '~/domain/models/dto/analysis-event-dto'
import { AnalysisResultDto } from '~/domain/models/dto/analysis-result-dto'
import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import { PriceAtAnalysisDto } from '~/domain/models/dto/price-at-analysis-dto'
import type { AnalysisEvent } from '~/domain/models/entities/analysis-event'
import { GradeDomain } from '~/domain/models/domains/grade-domain'
import { MarketCategoryDomain } from '~/domain/models/domains/market-category-domain'
import { TimeHorizonDomain } from '~/domain/models/domains/time-horizon-domain'
import { TimestampDomain } from '~/domain/models/domains/timestamp-domain'

export const POLLING_LIMIT_MILLISECONDS = 15 * 60 * 1000

const STATUSES: Record<string, LabelledValueDto> = {
  running: new LabelledValueDto('running', '分析中', 'info'),
  succeeded: new LabelledValueDto('succeeded', '已完成', 'positive'),
  failed: new LabelledValueDto('failed', '失敗', 'negative'),
}

const PRICE_NOT_OBTAINED = '未取得'

export class AnalysisEventDomain {
  constructor(private readonly analysisEvent: AnalysisEvent) {}

  toDto(now: Date): AnalysisEventDto {
    const status = STATUSES[this.analysisEvent.status] ?? new LabelledValueDto('failed', '失敗', 'negative')
    const isRunning = status.value === 'running'
    const isOverdue = now.getTime() - this.analysisEvent.startedAt.getTime() > POLLING_LIMIT_MILLISECONDS
    const failureMessage = status.value === 'failed'
      ? `分析失敗：${this.analysisEvent.failureReason ?? '未知原因'}`
      : undefined
    const result = this.analysisEvent.result
    const price = result?.priceAtAnalysis
    const priceAtAnalysis = price
      ? new PriceAtAnalysisDto(`${price.price.toFixed()} ${price.currency}`, price.source, new TimestampDomain(price.pricedAt).toDateTimeText())
      : new PriceAtAnalysisDto(PRICE_NOT_OBTAINED, PRICE_NOT_OBTAINED, PRICE_NOT_OBTAINED)
    const resultDto = status.value === 'succeeded' && result
      ? new AnalysisResultDto(
          new GradeDomain(result.grade).toDto(),
          result.confidence,
          new TimeHorizonDomain(result.timeHorizon).toDto(),
          result.reason,
          result.keyEvents.map(keyEvent => keyEvent.toDto()),
          result.riskFactors,
          result.evidence.map(evidence => evidence.toDto()),
          priceAtAnalysis,
          new TimestampDomain(result.createdAt).toDateTimeText(),
        )
      : undefined
    return new AnalysisEventDto(
      this.analysisEvent.analysisEventId,
      this.analysisEvent.symbol,
      new MarketCategoryDomain(this.analysisEvent.category).toDto(),
      status,
      failureMessage,
      new TimestampDomain(this.analysisEvent.startedAt).toDateTimeText(),
      isRunning && !isOverdue,
      isRunning && isOverdue,
      resultDto,
    )
  }
}
