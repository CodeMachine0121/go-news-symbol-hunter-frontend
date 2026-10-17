<script setup lang="ts">
import { ref } from 'vue'
import AppCard from '~/components/atoms/AppCard.vue'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import SymbolQueryForm from '~/components/molecules/SymbolQueryForm.vue'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import RecentAnalysisList from '~/components/organisms/RecentAnalysisList.vue'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'
import { SYMBOL_ANALYSIS_APPLICATION } from '~/composables/application-injection-keys'
import { useApiKeyAccess } from '~/composables/use-api-key-access'
import { useApplication } from '~/composables/use-application'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import type { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'

const symbolAnalysisApplication = useApplication(SYMBOL_ANALYSIS_APPLICATION)
const { refresh } = useApiKeyAccess()
const categories = symbolAnalysisApplication.listMarketCategories()
const recentAnalyses = symbolAnalysisApplication.getRecentAnalyses()

const lastQuery = ref<SymbolQueryDto>()
const isStarting = ref(false)
const startError = ref<Error>()

const start = async (symbolQueryDto: SymbolQueryDto): Promise<void> => {
  lastQuery.value = symbolQueryDto
  isStarting.value = true
  startError.value = undefined
  try {
    const startedSymbolAnalysis = await symbolAnalysisApplication.startSymbolAnalysis(symbolQueryDto)
    await navigateTo(`/analysis-events/${startedSymbolAnalysis.analysisEvent.analysisEventId}`)
  }
  catch (error: unknown) {
    startError.value = error instanceof Error ? error : new Error(String(error))
    if (error instanceof BackendRejectionError && error.isApiKeyProblem) {
      void refresh()
    }
  }
  finally {
    isStarting.value = false
  }
}
</script>

<template>
  <ConsolePageLayout>
    <AppPageHeader
      title="標的分析"
      description="AI 讀取標的近期新聞，產出評等、理由與佐證。同一標的 6 小時內會直接重用既有分析。"
    />
    <ApiKeyGate>
      <AppCard
        title="發起分析"
        description="分析通常需要數十秒，完成前會自動更新。"
      >
        <SymbolQueryForm
          :categories="categories"
          submit-label="發起分析"
          :loading="isStarting"
          @submit="start"
        />
      </AppCard>
      <RequestErrorAlert
        v-if="startError"
        :error="startError"
        @retry="lastQuery && start(lastQuery)"
      />
    </ApiKeyGate>
    <RecentAnalysisList :recent-analyses="recentAnalyses" />
  </ConsolePageLayout>
</template>
