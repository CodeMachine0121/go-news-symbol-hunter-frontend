import type { IApiKeyProxy } from '~/domain/interface/i-api-key-proxy'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'
import { IssuedApiKey } from '~/domain/models/entities/issued-api-key'
import type { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'

type IssuedApiKeyWire = {
  name: string
  apiKey: string
  status: string
}

type ApiKeyStatusWire = {
  name: string
  status: string
}

export class ApiKeyProxy implements IApiKeyProxy {
  constructor(private readonly backendHttpProxy: BackendHttpProxy) {}

  async issueApiKey(name: string): Promise<IssuedApiKey> {
    const response = await this.backendHttpProxy.request<IssuedApiKeyWire>('POST', '/api-keys', { body: { name } })
    return new IssuedApiKey(response.body.name, response.body.apiKey, response.body.status)
  }

  async getApiKeyStatus(apiKey: string): Promise<ApiKeyStatus> {
    const response = await this.backendHttpProxy.request<ApiKeyStatusWire>('GET', '/api-keys/me', { apiKey })
    return new ApiKeyStatus(response.body.name, response.body.status)
  }

  async revokeApiKey(apiKey: string): Promise<void> {
    await this.backendHttpProxy.request<undefined>('DELETE', '/api-keys/me', { apiKey })
  }
}
