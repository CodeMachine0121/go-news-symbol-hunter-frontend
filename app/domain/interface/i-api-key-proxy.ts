import type { ApiKeyStatus } from '~/domain/models/entities/api-key-status'
import type { IssuedApiKey } from '~/domain/models/entities/issued-api-key'

export interface IApiKeyProxy {
  issueApiKey(name: string): Promise<IssuedApiKey>
  getApiKeyStatus(apiKey: string): Promise<ApiKeyStatus>
  revokeApiKey(apiKey: string): Promise<void>
}
