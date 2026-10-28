import { AnalysisResultDto } from '~/domain/models/dto/analysis-result-dto'
import { PriceAtAnalysisDto } from '~/domain/models/dto/price-at-analysis-dto'
import type { AnalysisEvidence } from '~/domain/models/entities/analysis-evidence'
import type { KeyEvent } from '~/domain/models/entities/key-event'
import type { PriceAtAnalysis } from '~/domain/models/entities/price-at-analysis'
import { GradeDomain } from '~/domain/models/domains/grade-domain'
import { TimeHorizonDomain } from '~/domain/models/domains/time-horizon-domain'
import { TimestampDomain } from '~/domain/models/domains/timestamp-domain'

const PRICE_NOT_OBTAINED = '未取得'

export class AnalysisResult {
  constructor(
    readonly grade: string,
    readonly confidence: number,
    readonly timeHorizon: string,
    readonly reason: string,
    readonly keyEvents: KeyEvent[],
    readonly riskFactors: string[],
    readonly evidence: AnalysisEvidence[],
    readonly priceAtAnalysis: PriceAtAnalysis | undefined,
    readonly createdAt: Date,
  ) {}

  toDto(): AnalysisResultDto {
    const price = this.priceAtAnalysis
    const priceAtAnalysis = price
      ? new PriceAtAnalysisDto(`${price.price.toFixed()} ${price.currency}`, price.source, new TimestampDomain(price.pricedAt).toDateTimeText())
      : new PriceAtAnalysisDto(PRICE_NOT_OBTAINED, PRICE_NOT_OBTAINED, PRICE_NOT_OBTAINED)
    return new AnalysisResultDto(
      new GradeDomain(this.grade).toDto(),
      this.confidence,
      new TimeHorizonDomain(this.timeHorizon).toDto(),
      this.reason,
      this.keyEvents.map(keyEvent => keyEvent.toDto()),
      this.riskFactors,
      this.evidence.map(evidence => evidence.toDto()),
      priceAtAnalysis,
      new TimestampDomain(this.createdAt).toDateTimeText(),
    )
  }
}
