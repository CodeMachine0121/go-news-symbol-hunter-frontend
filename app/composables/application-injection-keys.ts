import type { InjectionKey } from 'vue'
import type { ApiKeyAccessState } from '~/composables/api-key-access-state'
import type { ApiKeyApplication } from '~/application/api-key-application'
import type { BackendHealthApplication } from '~/application/backend-health-application'
import type { GradeBacktestApplication } from '~/application/grade-backtest-application'
import type { NewsSearchApplication } from '~/application/news-search-application'
import type { SymbolAnalysisApplication } from '~/application/symbol-analysis-application'
import type { TrackedSymbolGradeApplication } from '~/application/tracked-symbol-grade-application'

export const API_KEY_APPLICATION: InjectionKey<ApiKeyApplication> = Symbol('ApiKeyApplication')
export const NEWS_SEARCH_APPLICATION: InjectionKey<NewsSearchApplication> = Symbol('NewsSearchApplication')
export const SYMBOL_ANALYSIS_APPLICATION: InjectionKey<SymbolAnalysisApplication> = Symbol('SymbolAnalysisApplication')
export const TRACKED_SYMBOL_GRADE_APPLICATION: InjectionKey<TrackedSymbolGradeApplication> = Symbol('TrackedSymbolGradeApplication')
export const GRADE_BACKTEST_APPLICATION: InjectionKey<GradeBacktestApplication> = Symbol('GradeBacktestApplication')
export const BACKEND_HEALTH_APPLICATION: InjectionKey<BackendHealthApplication> = Symbol('BackendHealthApplication')
export const API_KEY_ACCESS_STATE: InjectionKey<ApiKeyAccessState> = Symbol('ApiKeyAccessState')
