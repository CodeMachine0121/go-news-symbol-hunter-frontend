<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppCard from '~/components/atoms/AppCard.vue'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import SymbolCandidateList from '~/components/molecules/SymbolCandidateList.vue'
import SymbolQueryForm from '~/components/molecules/SymbolQueryForm.vue'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import RecentAnalysisList from '~/components/organisms/RecentAnalysisList.vue'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'
import { SYMBOL_ANALYSIS_APPLICATION } from '~/composables/application-injection-keys'
import { useApplication } from '~/composables/use-application'
import { useRequest } from '~/composables/use-request'
import { SymbolAmbiguousError } from '~/domain/errors/symbol-ambiguous-error'
import type { SymbolCandidateDto } from '~/domain/models/dto/symbol-candidate-dto'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'

const router = useRouter()
const symbolAnalysisApplication = useApplication(SYMBOL_ANALYSIS_APPLICATION)
const categories = symbolAnalysisApplication.listMarketCategories()
const recentAnalyses = symbolAnalysisApplication.getRecentAnalyses()
let startedCategory = ''
const symbolAnalysisStart = useRequest(async (symbolQueryDto: SymbolQueryDto) => {
  startedCategory = symbolQueryDto.category
  const startedSymbolAnalysis = await symbolAnalysisApplication.startSymbolAnalysis(symbolQueryDto)
  await router.push(`/analysis-events/${startedSymbolAnalysis.analysisEvent.analysisEventId}`)
})
// kept while a chosen candidate is being started, so the list stays in place with its buttons disabled
const symbolCandidates = shallowRef<SymbolCandidateDto[]>([])
watch(symbolAnalysisStart.isRunning, (isRunning) => {
  if (!isRunning) {
    const error = symbolAnalysisStart.error.value
    symbolCandidates.value = error instanceof SymbolAmbiguousError ? error.toCandidateDtos() : []
  }
})
const startCandidateAnalysis = (symbol: string): Promise<void> => symbolAnalysisStart.run(new SymbolQueryDto(symbol, startedCategory))
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
          symbol-placeholder="例如 2330、台積電、AAPL、Bitcoin"
          :loading="symbolAnalysisStart.isRunning.value"
          @submit="symbolAnalysisStart.run"
        />
      </AppCard>
      <RequestErrorAlert
        v-if="symbolAnalysisStart.error.value"
        :error="symbolAnalysisStart.error.value"
        @retry="symbolAnalysisStart.retry"
      />
      <SymbolCandidateList
        v-if="symbolCandidates.length > 0"
        :candidates="symbolCandidates"
        :loading="symbolAnalysisStart.isRunning.value"
        @choose="startCandidateAnalysis"
      />
    </ApiKeyGate>
    <RecentAnalysisList :recent-analyses="recentAnalyses" />
  </ConsolePageLayout>
</template>
