import { RecentAnalysisDto } from '~/domain/models/dto/recent-analysis-dto'
import { MarketCategoryDomain } from '~/domain/models/domains/market-category-domain'
import { TimestampDomain } from '~/domain/models/domains/timestamp-domain'

export class RecentAnalysis {
  constructor(
    readonly analysisEventId: number,
    readonly symbol: string,
    readonly category: string,
    readonly startedAt: Date,
  ) {}

  toDto(): RecentAnalysisDto {
    return new RecentAnalysisDto(
      this.analysisEventId,
      this.symbol,
      new MarketCategoryDomain(this.category).toDto(),
      new TimestampDomain(this.startedAt).toDateTimeText(),
    )
  }
}
