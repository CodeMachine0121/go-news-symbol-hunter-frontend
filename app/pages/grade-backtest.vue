<script setup lang="ts">
import { ref } from 'vue'
import AppCard from '~/components/atoms/AppCard.vue'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import BacktestQueryForm from '~/components/organisms/BacktestQueryForm.vue'
import GradeBacktestSummary from '~/components/organisms/GradeBacktestSummary.vue'
import GradeBacktestTable from '~/components/organisms/GradeBacktestTable.vue'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'
import { GRADE_BACKTEST_APPLICATION } from '~/composables/application-injection-keys'
import { useApiKeyAccess } from '~/composables/use-api-key-access'
import { useApplication } from '~/composables/use-application'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import type { GradeBacktestDto } from '~/domain/models/dto/grade-backtest-dto'
import type { GradeBacktestQueryDto } from '~/domain/models/dto/grade-backtest-query-dto'

const gradeBacktestApplication = useApplication(GRADE_BACKTEST_APPLICATION)
const { refresh } = useApiKeyAccess()
const categories = gradeBacktestApplication.listMarketCategories()

const gradeBacktest = ref<GradeBacktestDto>()
const lastQuery = ref<GradeBacktestQueryDto>()
const isLoading = ref(false)
const loadError = ref<Error>()

const load = async (gradeBacktestQueryDto: GradeBacktestQueryDto): Promise<void> => {
  lastQuery.value = gradeBacktestQueryDto
  isLoading.value = true
  loadError.value = undefined
  try {
    gradeBacktest.value = await gradeBacktestApplication.getGradeBacktest(gradeBacktestQueryDto)
  }
  catch (error: unknown) {
    gradeBacktest.value = undefined
    loadError.value = error instanceof Error ? error : new Error(String(error))
    if (error instanceof BackendRejectionError && error.isApiKeyProblem) {
      void refresh()
    }
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <ConsolePageLayout>
    <AppPageHeader
      title="評等回測"
      description="比較分析完成時的價格與檢查點收盤價，檢驗評等方向是否優於隨機猜測。"
    />
    <ApiKeyGate>
      <AppCard>
        <BacktestQueryForm
          :categories="categories"
          :loading="isLoading"
          @submit="load"
        />
      </AppCard>
      <RequestErrorAlert
        v-if="loadError"
        :error="loadError"
        @retry="lastQuery && load(lastQuery)"
      />
      <template v-if="gradeBacktest">
        <GradeBacktestSummary :grade-backtest="gradeBacktest" />
        <GradeBacktestTable :analyses="gradeBacktest.analyses" />
      </template>
    </ApiKeyGate>
  </ConsolePageLayout>
</template>
