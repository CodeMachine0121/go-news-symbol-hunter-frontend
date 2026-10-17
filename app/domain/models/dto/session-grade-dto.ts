import type { KeyEventDto } from '~/domain/models/dto/key-event-dto'
import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export class SessionGradeDto {
  constructor(
    readonly grade: LabelledValueDto,
    readonly confidence: number,
    readonly reason: string,
    readonly keyEvents: KeyEventDto[],
    readonly riskFactors: string[],
    readonly createdAtText: string,
  ) {}
}
