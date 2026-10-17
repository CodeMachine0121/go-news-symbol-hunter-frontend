import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export type ApiKeyAccessState = 'missing' | 'inactive' | 'invalid' | 'active' | 'unavailable'

export class ApiKeyAccessDto {
  constructor(
    readonly state: ApiKeyAccessState,
    readonly status: LabelledValueDto,
    readonly name: string | undefined,
    readonly maskedApiKey: string | undefined,
    readonly guidance: string | undefined,
    readonly isUsable: boolean,
    readonly canRecheck: boolean,
    readonly needsSettings: boolean,
    readonly hasApiKey: boolean,
  ) {}
}
