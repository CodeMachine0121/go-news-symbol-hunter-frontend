import { AnalysisReportUnavailableError } from '~/domain/errors/analysis-report-unavailable-error'
import { AnalysisEventDto } from '~/domain/models/dto/analysis-event-dto'
import { AnalysisReportDto } from '~/domain/models/dto/analysis-report-dto'
import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import type { AnalysisEvent } from '~/domain/models/entities/analysis-event'
import type { AnalysisResult } from '~/domain/models/entities/analysis-result'
import { MarketCategoryDomain } from '~/domain/models/domains/market-category-domain'
import { TimestampDomain } from '~/domain/models/domains/timestamp-domain'

export const POLLING_LIMIT_MILLISECONDS = 15 * 60 * 1000

const STATUSES: Record<string, LabelledValueDto> = {
  running: new LabelledValueDto('running', '分析中', 'info'),
  succeeded: new LabelledValueDto('succeeded', '已完成', 'positive'),
  failed: new LabelledValueDto('failed', '失敗', 'negative'),
}

const INVESTMENT_DISCLAIMER = '本報告僅供資訊參考，不構成任何投資建議'

export class AnalysisEventDomain {
  constructor(private readonly analysisEvent: AnalysisEvent) {}

  toDto(now: Date): AnalysisEventDto {
    const status = STATUSES[this.analysisEvent.status] ?? new LabelledValueDto('failed', '失敗', 'negative')
    const isRunning = status.value === 'running'
    const isOverdue = now.getTime() - this.analysisEvent.startedAt.getTime() > POLLING_LIMIT_MILLISECONDS
    const failureMessage = status.value === 'failed'
      ? `分析失敗：${this.analysisEvent.failureReason ?? '未知原因'}`
      : undefined
    const resultDto = this.exportableResult?.toDto()
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
      resultDto !== undefined,
    )
  }

  toReportDto(exportedAt: Date): AnalysisReportDto {
    const result = this.exportableResult
    if (result === undefined) {
      throw new AnalysisReportUnavailableError()
    }
    const category = new MarketCategoryDomain(this.analysisEvent.category).toDto()
    return new AnalysisReportDto(
      this.analysisEvent.analysisEventId,
      this.analysisEvent.symbol,
      category,
      `${category.label}-${this.analysisEvent.symbol}-分析-${new TimestampDomain(result.createdAt).toDateText()}`,
      new TimestampDomain(exportedAt).toDateTimeText(),
      INVESTMENT_DISCLAIMER,
      result.toDto(),
    )
  }

  private get exportableResult(): AnalysisResult | undefined {
    return this.analysisEvent.status === 'succeeded' ? this.analysisEvent.result : undefined
  }
}
