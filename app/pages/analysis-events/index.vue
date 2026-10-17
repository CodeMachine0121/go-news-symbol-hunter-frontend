<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppCard from '~/components/atoms/AppCard.vue'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import SymbolQueryForm from '~/components/molecules/SymbolQueryForm.vue'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import RecentAnalysisList from '~/components/organisms/RecentAnalysisList.vue'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'
import { SYMBOL_ANALYSIS_APPLICATION } from '~/composables/application-injection-keys'
import { useApplication } from '~/composables/use-application'
import { useRequest } from '~/composables/use-request'
import type { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'

const router = useRouter()
const symbolAnalysisApplication = useApplication(SYMBOL_ANALYSIS_APPLICATION)
const categories = symbolAnalysisApplication.listMarketCategories()
const recentAnalyses = symbolAnalysisApplication.getRecentAnalyses()
const symbolAnalysisStart = useRequest(async (symbolQueryDto: SymbolQueryDto) => {
  const startedSymbolAnalysis = await symbolAnalysisApplication.startSymbolAnalysis(symbolQueryDto)
  await router.push(`/analysis-events/${startedSymbolAnalysis.analysisEvent.analysisEventId}`)
})
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
          :loading="symbolAnalysisStart.isRunning.value"
          @submit="symbolAnalysisStart.run"
        />
      </AppCard>
      <RequestErrorAlert
        v-if="symbolAnalysisStart.error.value"
        :error="symbolAnalysisStart.error.value"
        @retry="symbolAnalysisStart.retry"
      />
    </ApiKeyGate>
    <RecentAnalysisList :recent-analyses="recentAnalyses" />
  </ConsolePageLayout>
</template>
