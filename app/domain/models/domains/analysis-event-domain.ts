import { AnalysisEventDto } from '~/domain/models/dto/analysis-event-dto'
import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import type { AnalysisEvent } from '~/domain/models/entities/analysis-event'
import { MarketCategoryDomain } from '~/domain/models/domains/market-category-domain'
import { TimestampDomain } from '~/domain/models/domains/timestamp-domain'

export const POLLING_LIMIT_MILLISECONDS = 15 * 60 * 1000

const STATUSES: Record<string, LabelledValueDto> = {
  running: new LabelledValueDto('running', '分析中', 'info'),
  succeeded: new LabelledValueDto('succeeded', '已完成', 'positive'),
  failed: new LabelledValueDto('failed', '失敗', 'negative'),
}

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
    const resultDto = status.value === 'succeeded' && result ? result.toDto() : undefined
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
