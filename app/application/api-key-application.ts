import type { ApiKeyAccessDto } from '~/domain/models/dto/api-key-access-dto'
import type { IssueApiKeyDto } from '~/domain/models/dto/issue-api-key-dto'
import type { IssuedApiKeyDto } from '~/domain/models/dto/issued-api-key-dto'
import type { ApiKeyService } from '~/domain/service/api-key-service'

export class ApiKeyApplication {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  getApiKeyAccess(): Promise<ApiKeyAccessDto> {
    return this.apiKeyService.getApiKeyAccess()
  }

  issueApiKey(issueApiKeyDto: IssueApiKeyDto): Promise<IssuedApiKeyDto> {
    return this.apiKeyService.issueApiKey(issueApiKeyDto)
  }

  useApiKey(apiKey: string): Promise<ApiKeyAccessDto> {
    return this.apiKeyService.useApiKey(apiKey)
  }

  forgetApiKey(): ApiKeyAccessDto {
    return this.apiKeyService.forgetApiKey()
  }

  revokeApiKey(): Promise<ApiKeyAccessDto> {
    return this.apiKeyService.revokeApiKey()
  }
}
