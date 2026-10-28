<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '~/components/atoms/AppButton.vue'
import AppSpinner from '~/components/atoms/AppSpinner.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import AnalysisReportDocument from '~/components/organisms/AnalysisReportDocument.vue'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import ReportLayout from '~/components/templates/ReportLayout.vue'
import { ANALYSIS_REPORT_APPLICATION } from '~/composables/application-injection-keys'
import { useApiKeyAccess } from '~/composables/use-api-key-access'
import { useApplication } from '~/composables/use-application'
import { useRequest } from '~/composables/use-request'
import type { AnalysisReportDto } from '~/domain/models/dto/analysis-report-dto'

definePageMeta({ layout: false })

const route = useRoute()
const analysisEventId = Number(route.params.analysisEventId)
const analysisReportApplication = useApplication(ANALYSIS_REPORT_APPLICATION)
const analysisReport = useRequest(() => analysisReportApplication.getAnalysisReport(analysisEventId))
const { apiKeyAccess } = useApiKeyAccess()
const printAnalysisReport = (report: AnalysisReportDto): void => analysisReportApplication.printAnalysisReport(report)
let isPrintedOnArrival = false
const printOnArrival = (report: AnalysisReportDto): void => {
  if (!isPrintedOnArrival) {
    isPrintedOnArrival = true
    printAnalysisReport(report)
  }
}

onMounted(() => analysisReport.run())
</script>

<template>
  <ReportLayout>
    <template #toolbar>
      <NuxtLink :to="`/analysis-events/${analysisEventId}`">
        返回分析事件
      </NuxtLink>
      <AppButton
        v-if="analysisReport.data.value && apiKeyAccess?.isUsable"
        @click="printAnalysisReport(analysisReport.data.value)"
      >
        匯出 PDF
      </AppButton>
    </template>
    <ApiKeyGate>
      <RequestErrorAlert
        v-if="analysisReport.error.value"
        :error="analysisReport.error.value"
        @retry="analysisReport.retry"
      />
      <AppSpinner v-else-if="!analysisReport.data.value" />
      <AnalysisReportDocument
        v-else
        :report="analysisReport.data.value"
        @vue:mounted="printOnArrival(analysisReport.data.value)"
      />
    </ApiKeyGate>
  </ReportLayout>
</template>
