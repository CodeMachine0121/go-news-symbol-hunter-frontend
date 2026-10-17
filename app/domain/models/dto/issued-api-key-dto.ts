import type { ApiKeyAccessDto } from '~/domain/models/dto/api-key-access-dto'

export class IssuedApiKeyDto {
  constructor(
    readonly apiKey: string,
    readonly access: ApiKeyAccessDto,
  ) {}
}
