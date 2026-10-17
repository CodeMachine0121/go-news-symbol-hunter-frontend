<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import type { TrackedSymbolGradeDto } from '~/domain/models/dto/tracked-symbol-grade-dto'

const trackedSymbolGradeApplication = useApplication(TRACKED_SYMBOL_GRADE_APPLICATION)
const { apiKeyAccess, refresh } = useApiKeyAccess()
const categories = trackedSymbolGradeApplication.listMarketCategories()

const trackedSymbolGrades = ref<TrackedSymbolGradeDto[]>()
const lastQuery = ref(new SymbolQueryDto('', ''))
const isLoading = ref(false)
const loadError = ref<Error>()

const load = async (symbolQueryDto: SymbolQueryDto): Promise<void> => {
  lastQuery.value = symbolQueryDto
  isLoading.value = true
  loadError.value = undefined
  try {
    trackedSymbolGrades.value = await trackedSymbolGradeApplication.getTrackedSymbolGrades(symbolQueryDto)
  }
  catch (error: unknown) {
    trackedSymbolGrades.value = undefined
    loadError.value = error instanceof Error ? error : new Error(String(error))
    if (error instanceof BackendRejectionError && error.isApiKeyProblem) {
      void refresh()
    }
  }
  finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (apiKeyAccess.value === undefined) {
    await refresh()
  }
  if (apiKeyAccess.value?.isUsable) {
    await load(lastQuery.value)
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
          :loading="isLoading"
          @submit="load"
        />
      </AppCard>
      <RequestErrorAlert
        v-if="loadError"
        :error="loadError"
        @retry="load(lastQuery)"
      />
      <AppSpinner v-if="isLoading && !trackedSymbolGrades" />
      <TrackedSymbolGradeTable
        v-if="trackedSymbolGrades"
        :tracked-symbol-grades="trackedSymbolGrades"
      />
    </ApiKeyGate>
  </ConsolePageLayout>
</template>
