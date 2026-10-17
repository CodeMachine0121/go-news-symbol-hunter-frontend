import { ApiKeyApplication } from '~/application/api-key-application'
import { BackendHealthApplication } from '~/application/backend-health-application'
import { NewsSearchApplication } from '~/application/news-search-application'
import { ApiKeyAccessState } from '~/composables/api-key-access-state'
import {
  API_KEY_ACCESS_STATE,
  API_KEY_APPLICATION,
  BACKEND_HEALTH_APPLICATION,
  NEWS_SEARCH_APPLICATION,
} from '~/composables/application-injection-keys'
import { ApiKeyService } from '~/domain/service/api-key-service'
import { BackendHealthService } from '~/domain/service/backend-health-service'
import { MarketCategoryService } from '~/domain/service/market-category-service'
import { NewsSearchService } from '~/domain/service/news-search-service'
import { ApiKeyProxy } from '~/infrastructure/proxy/api-key-proxy'
import { BackendHealthProxy } from '~/infrastructure/proxy/backend-health-proxy'
import { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'
import { LocalStorageApiKeyStorageProxy } from '~/infrastructure/proxy/local-storage-api-key-storage-proxy'
import { NewsProxy } from '~/infrastructure/proxy/news-proxy'

export default defineNuxtPlugin((nuxtApp) => {
  const backendHttpProxy = new BackendHttpProxy(useRuntimeConfig().public.backendBaseUrl)
  const apiKeyService = new ApiKeyService(new ApiKeyProxy(backendHttpProxy), new LocalStorageApiKeyStorageProxy())
  const marketCategoryService = new MarketCategoryService()

  nuxtApp.vueApp.provide(API_KEY_ACCESS_STATE, new ApiKeyAccessState())
  nuxtApp.vueApp.provide(API_KEY_APPLICATION, new ApiKeyApplication(apiKeyService))
  nuxtApp.vueApp.provide(NEWS_SEARCH_APPLICATION, new NewsSearchApplication(
    new NewsSearchService(new NewsProxy(backendHttpProxy), apiKeyService),
    marketCategoryService,
  ))
  nuxtApp.vueApp.provide(BACKEND_HEALTH_APPLICATION, new BackendHealthApplication(
    new BackendHealthService(new BackendHealthProxy(backendHttpProxy)),
  ))
})
