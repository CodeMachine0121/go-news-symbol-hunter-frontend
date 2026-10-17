import type { InjectionKey } from 'vue'
import type { ApiKeyAccessState } from '~/composables/api-key-access-state'
import type { ApiKeyApplication } from '~/application/api-key-application'
import type { NewsSearchApplication } from '~/application/news-search-application'
import type { SymbolAnalysisApplication } from '~/application/symbol-analysis-application'

export const API_KEY_APPLICATION: InjectionKey<ApiKeyApplication> = Symbol('ApiKeyApplication')
export const NEWS_SEARCH_APPLICATION: InjectionKey<NewsSearchApplication> = Symbol('NewsSearchApplication')
export const SYMBOL_ANALYSIS_APPLICATION: InjectionKey<SymbolAnalysisApplication> = Symbol('SymbolAnalysisApplication')
export const API_KEY_ACCESS_STATE: InjectionKey<ApiKeyAccessState> = Symbol('ApiKeyAccessState')
