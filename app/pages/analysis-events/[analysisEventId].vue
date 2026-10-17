<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'
import AppSpinner from '~/components/atoms/AppSpinner.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import AnalysisEventStatusPanel from '~/components/organisms/AnalysisEventStatusPanel.vue'
import AnalysisResultReport from '~/components/organisms/AnalysisResultReport.vue'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'
import { SYMBOL_ANALYSIS_APPLICATION } from '~/composables/application-injection-keys'
import { useAnalysisEventPolling } from '~/composables/use-analysis-event-polling'
import { useApplication } from '~/composables/use-application'
import { useRequest } from '~/composables/use-request'
import type { AnalysisEventDto } from '~/domain/models/dto/analysis-event-dto'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'

const route = useRoute()
const router = useRouter()
const analysisEventId = Number(route.params.analysisEventId)
const symbolAnalysisApplication = useApplication(SYMBOL_ANALYSIS_APPLICATION)
const { analysisEvent, error, load } = useAnalysisEventPolling(analysisEventId)
const symbolAnalysisRestart = useRequest(async (failedAnalysisEvent: AnalysisEventDto) => {
  const startedSymbolAnalysis = await symbolAnalysisApplication.startSymbolAnalysis(
    new SymbolQueryDto(failedAnalysisEvent.symbol, failedAnalysisEvent.category.value),
  )
  await router.push(`/analysis-events/${startedSymbolAnalysis.analysisEvent.analysisEventId}`)
})

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
        v-if="symbolAnalysisRestart.error.value"
        :error="symbolAnalysisRestart.error.value"
        @retry="symbolAnalysisRestart.retry"
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
          @restart="symbolAnalysisRestart.run(analysisEvent)"
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
