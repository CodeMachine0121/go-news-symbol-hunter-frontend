<script setup lang="ts">
import AppCard from '~/components/atoms/AppCard.vue'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import BacktestQueryForm from '~/components/organisms/BacktestQueryForm.vue'
import GradeBacktestSummary from '~/components/organisms/GradeBacktestSummary.vue'
import GradeBacktestTable from '~/components/organisms/GradeBacktestTable.vue'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'
import { GRADE_BACKTEST_APPLICATION } from '~/composables/application-injection-keys'
import { useApplication } from '~/composables/use-application'
import { useRequest } from '~/composables/use-request'
import type { GradeBacktestQueryDto } from '~/domain/models/dto/grade-backtest-query-dto'

const gradeBacktestApplication = useApplication(GRADE_BACKTEST_APPLICATION)
const categories = gradeBacktestApplication.listMarketCategories()
const gradeBacktest = useRequest((gradeBacktestQueryDto: GradeBacktestQueryDto) => gradeBacktestApplication.getGradeBacktest(gradeBacktestQueryDto))
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
          :loading="gradeBacktest.isRunning.value"
          @submit="gradeBacktest.run"
        />
      </AppCard>
      <RequestErrorAlert
        v-if="gradeBacktest.error.value"
        :error="gradeBacktest.error.value"
        @retry="gradeBacktest.retry"
      />
      <template v-if="gradeBacktest.data.value">
        <GradeBacktestSummary :grade-backtest="gradeBacktest.data.value" />
        <GradeBacktestTable :analyses="gradeBacktest.data.value.analyses" />
      </template>
    </ApiKeyGate>
  </ConsolePageLayout>
</template>
