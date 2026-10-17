import { ApiKeyApplication } from '~/application/api-key-application'
import { ApiKeyAccessState } from '~/composables/api-key-access-state'
import { API_KEY_ACCESS_STATE, API_KEY_APPLICATION } from '~/composables/application-injection-keys'
import { ApiKeyService } from '~/domain/service/api-key-service'
import { mockApiKeyProxy, mockApiKeyStorageProxy } from './proxy-mocks'

export const createApplicationStack = (storedApiKey?: string) => {
  const apiKeyProxy = mockApiKeyProxy()
  const apiKeyService = new ApiKeyService(apiKeyProxy, mockApiKeyStorageProxy(storedApiKey))
  const provide = {
    [API_KEY_ACCESS_STATE]: new ApiKeyAccessState(),
    [API_KEY_APPLICATION]: new ApiKeyApplication(apiKeyService),
  }
  return { apiKeyProxy, provide }
}
