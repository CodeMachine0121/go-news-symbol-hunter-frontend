import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import type { SessionSlotDto } from '~/domain/models/dto/session-slot-dto'

export class TrackedSymbolGradeDto {
  constructor(
    readonly symbol: string,
    readonly category: LabelledValueDto,
    readonly tradingDay: string,
    readonly grade: LabelledValueDto,
    readonly combinedScoreText: string,
    readonly confidence: number,
    readonly updatedAtText: string,
    readonly sessionSlots: SessionSlotDto[],
  ) {}
}
