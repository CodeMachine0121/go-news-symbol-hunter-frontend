import { onScopeDispose, ref } from 'vue'
import { SYMBOL_ANALYSIS_APPLICATION } from '~/composables/application-injection-keys'
import { useApplication } from '~/composables/use-application'
import type { AnalysisEventDto } from '~/domain/models/dto/analysis-event-dto'

export const POLLING_INTERVAL_MILLISECONDS = 3000

export function useAnalysisEventPolling(analysisEventId: number) {
  const symbolAnalysisApplication = useApplication(SYMBOL_ANALYSIS_APPLICATION)
  const analysisEvent = ref<AnalysisEventDto>()
  const error = ref<Error>()
  let timer: ReturnType<typeof setTimeout> | undefined
  let isDisposed = false

  const load = async (): Promise<void> => {
    clearTimeout(timer)
    try {
      analysisEvent.value = await symbolAnalysisApplication.getAnalysisEvent(analysisEventId)
      error.value = undefined
    }
    catch (caught: unknown) {
      error.value = caught instanceof Error ? caught : new Error(String(caught))
      return
    }
    if (analysisEvent.value.keepPolling && !isDisposed) {
      timer = setTimeout(load, POLLING_INTERVAL_MILLISECONDS)
    }
  }

  onScopeDispose(() => {
    isDisposed = true
    clearTimeout(timer)
  })

  return { analysisEvent, error, load }
}
