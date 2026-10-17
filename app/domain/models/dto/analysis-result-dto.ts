import type { EvidenceDto } from '~/domain/models/dto/evidence-dto'
import type { KeyEventDto } from '~/domain/models/dto/key-event-dto'
import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import type { PriceAtAnalysisDto } from '~/domain/models/dto/price-at-analysis-dto'

export class AnalysisResultDto {
  constructor(
    readonly grade: LabelledValueDto,
    readonly confidence: number,
    readonly timeHorizon: LabelledValueDto,
    readonly reason: string,
    readonly keyEvents: KeyEventDto[],
    readonly riskFactors: string[],
    readonly evidence: EvidenceDto[],
    readonly priceAtAnalysis: PriceAtAnalysisDto,
    readonly createdAtText: string,
  ) {}
}
