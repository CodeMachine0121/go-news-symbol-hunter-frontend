import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import type { SessionGradeDto } from '~/domain/models/dto/session-grade-dto'

export class SessionSlotDto {
  constructor(
    readonly session: LabelledValueDto,
    readonly sessionGrade: SessionGradeDto | undefined,
    readonly emptyText: string,
  ) {}
}
