import type { InjectionKey } from 'vue'
import type { ApiKeyAccessState } from '~/composables/api-key-access-state'
import type { ApiKeyApplication } from '~/application/api-key-application'
import type { NewsSearchApplication } from '~/application/news-search-application'

export const API_KEY_APPLICATION: InjectionKey<ApiKeyApplication> = Symbol('ApiKeyApplication')
export const NEWS_SEARCH_APPLICATION: InjectionKey<NewsSearchApplication> = Symbol('NewsSearchApplication')
export const API_KEY_ACCESS_STATE: InjectionKey<ApiKeyAccessState> = Symbol('ApiKeyAccessState')
