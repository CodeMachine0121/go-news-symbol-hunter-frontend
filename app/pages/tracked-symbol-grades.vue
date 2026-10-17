<script setup lang="ts">
import { onMounted } from 'vue'
import AppCard from '~/components/atoms/AppCard.vue'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'
import AppSpinner from '~/components/atoms/AppSpinner.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import SymbolQueryForm from '~/components/molecules/SymbolQueryForm.vue'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import TrackedSymbolGradeTable from '~/components/organisms/TrackedSymbolGradeTable.vue'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'
import { TRACKED_SYMBOL_GRADE_APPLICATION } from '~/composables/application-injection-keys'
import { useApiKeyAccess } from '~/composables/use-api-key-access'
import { useApplication } from '~/composables/use-application'
import { useRequest } from '~/composables/use-request'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'

const trackedSymbolGradeApplication = useApplication(TRACKED_SYMBOL_GRADE_APPLICATION)
const { apiKeyAccess, refresh } = useApiKeyAccess()
const categories = trackedSymbolGradeApplication.listMarketCategories()
const trackedSymbolGrades = useRequest((symbolQueryDto: SymbolQueryDto) => trackedSymbolGradeApplication.getTrackedSymbolGrades(symbolQueryDto))

onMounted(async () => {
  if (apiKeyAccess.value === undefined) {
    await refresh()
  }
  if (apiKeyAccess.value?.isUsable) {
    await trackedSymbolGrades.run(new SymbolQueryDto('', ''))
  }
})
</script>

<template>
  <ConsolePageLayout>
    <AppPageHeader
      title="追蹤標的評等"
      description="追蹤標的最新一天的綜合評等，以及盤前、盤中、盤後各時段評等。"
    />
    <ApiKeyGate>
      <AppCard>
        <SymbolQueryForm
          :categories="categories"
          submit-label="查詢"
          optional
          :loading="trackedSymbolGrades.isRunning.value"
          @submit="trackedSymbolGrades.run"
        />
      </AppCard>
      <RequestErrorAlert
        v-if="trackedSymbolGrades.error.value"
        :error="trackedSymbolGrades.error.value"
        @retry="trackedSymbolGrades.retry"
      />
      <AppSpinner v-if="trackedSymbolGrades.isRunning.value && !trackedSymbolGrades.data.value" />
      <TrackedSymbolGradeTable
        v-if="trackedSymbolGrades.data.value"
        :tracked-symbol-grades="trackedSymbolGrades.data.value"
      />
    </ApiKeyGate>
  </ConsolePageLayout>
</template>
