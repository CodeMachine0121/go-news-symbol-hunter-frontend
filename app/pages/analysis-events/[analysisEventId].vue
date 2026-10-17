<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'
import AppSpinner from '~/components/atoms/AppSpinner.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import AnalysisEventStatusPanel from '~/components/organisms/AnalysisEventStatusPanel.vue'
import AnalysisResultReport from '~/components/organisms/AnalysisResultReport.vue'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'
import { SYMBOL_ANALYSIS_APPLICATION } from '~/composables/application-injection-keys'
import { useAnalysisEventPolling } from '~/composables/use-analysis-event-polling'
import { useApiKeyAccess } from '~/composables/use-api-key-access'
import { useApplication } from '~/composables/use-application'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'

const route = useRoute()
const analysisEventId = Number(route.params.analysisEventId)
const symbolAnalysisApplication = useApplication(SYMBOL_ANALYSIS_APPLICATION)
const { refresh } = useApiKeyAccess()
const { analysisEvent, error, load } = useAnalysisEventPolling(analysisEventId)

const isRestarting = ref(false)
const restartError = ref<Error>()

const restart = async (): Promise<void> => {
  if (analysisEvent.value === undefined) {
    return
  }
  isRestarting.value = true
  restartError.value = undefined
  try {
    const startedSymbolAnalysis = await symbolAnalysisApplication.startSymbolAnalysis(
      new SymbolQueryDto(analysisEvent.value.symbol, analysisEvent.value.category.value),
    )
    await navigateTo(`/analysis-events/${startedSymbolAnalysis.analysisEvent.analysisEventId}`)
  }
  catch (caught: unknown) {
    restartError.value = caught instanceof Error ? caught : new Error(String(caught))
    if (caught instanceof BackendRejectionError && caught.isApiKeyProblem) {
      void refresh()
    }
  }
  finally {
    isRestarting.value = false
  }
}

onMounted(() => load())
</script>

<template>
  <ConsolePageLayout>
    <AppPageHeader
      :title="analysisEvent ? `${analysisEvent.category.label} ${analysisEvent.symbol} 分析` : '分析事件'"
      :description="`分析事件 #${analysisEventId}`"
    >
      <template #actions>
        <NuxtLink to="/analysis-events">
          返回標的分析
        </NuxtLink>
      </template>
    </AppPageHeader>
    <ApiKeyGate>
      <RequestErrorAlert
        v-if="error"
        :error="error"
        @retry="load"
      />
      <RequestErrorAlert
        v-if="restartError"
        :error="restartError"
        @retry="restart"
      />
      <AppSpinner v-if="!analysisEvent && !error" />
      <div
        v-if="analysisEvent"
        class="analysis-event-page"
      >
        <div class="analysis-event-page__result">
          <AnalysisResultReport
            v-if="analysisEvent.result"
            :result="analysisEvent.result"
          />
        </div>
        <AnalysisEventStatusPanel
          class="analysis-event-page__status"
          :analysis-event="analysisEvent"
          @refresh="load"
          @restart="restart"
        />
      </div>
    </ApiKeyGate>
  </ConsolePageLayout>
</template>

<style scoped lang="scss">
.analysis-event-page {
  display: grid;
  gap: spacing('md');
  align-items: start;

  @include respond-to('lg') {
    grid-template-columns: 1fr size('sidebar');
  }

  &__status {
    @include respond-to('lg') {
      position: sticky;
      top: spacing('lg');
      grid-row: 1;
      grid-column: 2;
    }
  }
}
</style>
