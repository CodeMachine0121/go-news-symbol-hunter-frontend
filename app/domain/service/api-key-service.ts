import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import type { IApiKeyProxy } from '~/domain/interface/i-api-key-proxy'
import type { IApiKeyStorageProxy } from '~/domain/interface/i-api-key-storage-proxy'
import { ApiKeyAccessDomain } from '~/domain/models/domains/api-key-access-domain'
import { ApiKeyNameDomain } from '~/domain/models/domains/api-key-name-domain'
import type { ApiKeyAccessDto } from '~/domain/models/dto/api-key-access-dto'
import type { IssueApiKeyDto } from '~/domain/models/dto/issue-api-key-dto'
import { IssuedApiKeyDto } from '~/domain/models/dto/issued-api-key-dto'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'

export class ApiKeyService {
  constructor(
    private readonly apiKeyProxy: IApiKeyProxy,
    private readonly apiKeyStorageProxy: IApiKeyStorageProxy,
  ) {}

  async getApiKeyAccess(): Promise<ApiKeyAccessDto> {
    const apiKey = this.apiKeyStorageProxy.read()
    if (apiKey === undefined) {
      return new ApiKeyAccessDomain(undefined, undefined).toDto()
    }
    const statusOrFailure = await this.apiKeyProxy.getApiKeyStatus(apiKey)
      .catch((error: unknown) => error instanceof Error ? error : new Error(String(error)))
    return new ApiKeyAccessDomain(apiKey, statusOrFailure).toDto()
  }

  async issueApiKey(issueApiKeyDto: IssueApiKeyDto): Promise<IssuedApiKeyDto> {
    const apiKeyName = new ApiKeyNameDomain(issueApiKeyDto.name)
    const issuedApiKey = await this.apiKeyProxy.issueApiKey(apiKeyName.name)
    this.apiKeyStorageProxy.save(issuedApiKey.apiKey)
    const access = new ApiKeyAccessDomain(issuedApiKey.apiKey, new ApiKeyStatus(issuedApiKey.name, issuedApiKey.status)).toDto()
    return new IssuedApiKeyDto(issuedApiKey.apiKey, access)
  }

  async useApiKey(rawApiKey: string): Promise<ApiKeyAccessDto> {
    const apiKey = rawApiKey.trim()
    const apiKeyStatus = await this.apiKeyProxy.getApiKeyStatus(apiKey)
    this.apiKeyStorageProxy.save(apiKey)
    return new ApiKeyAccessDomain(apiKey, apiKeyStatus).toDto()
  }

  forgetApiKey(): ApiKeyAccessDto {
    this.apiKeyStorageProxy.clear()
    return new ApiKeyAccessDomain(undefined, undefined).toDto()
  }

  async revokeApiKey(): Promise<ApiKeyAccessDto> {
    const apiKey = this.apiKeyStorageProxy.read()
    if (apiKey !== undefined) {
      await this.apiKeyProxy.revokeApiKey(apiKey)
    }
    this.apiKeyStorageProxy.clear()
    return new ApiKeyAccessDomain(undefined, undefined).toDto()
  }

  requireApiKey(): string {
    const apiKey = this.apiKeyStorageProxy.read()
    if (apiKey === undefined) {
      throw new BackendRejectionError('api_key_missing', '需要提供 API key')
    }
    return apiKey
  }
}
