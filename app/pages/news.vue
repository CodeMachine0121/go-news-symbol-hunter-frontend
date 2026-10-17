<script setup lang="ts">
import { ref } from 'vue'
import AppCard from '~/components/atoms/AppCard.vue'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import SymbolQueryForm from '~/components/molecules/SymbolQueryForm.vue'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import NewsResultList from '~/components/organisms/NewsResultList.vue'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'
import { NEWS_SEARCH_APPLICATION } from '~/composables/application-injection-keys'
import { useApiKeyAccess } from '~/composables/use-api-key-access'
import { useApplication } from '~/composables/use-application'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import type { SymbolNewsDto } from '~/domain/models/dto/symbol-news-dto'
import type { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'

const newsSearchApplication = useApplication(NEWS_SEARCH_APPLICATION)
const { refresh } = useApiKeyAccess()
const categories = newsSearchApplication.listMarketCategories()

const symbolNews = ref<SymbolNewsDto>()
const lastQuery = ref<SymbolQueryDto>()
const isSearching = ref(false)
const searchError = ref<Error>()

const search = async (symbolQueryDto: SymbolQueryDto): Promise<void> => {
  lastQuery.value = symbolQueryDto
  isSearching.value = true
  searchError.value = undefined
  try {
    symbolNews.value = await newsSearchApplication.searchSymbolNews(symbolQueryDto)
  }
  catch (error: unknown) {
    symbolNews.value = undefined
    searchError.value = error instanceof Error ? error : new Error(String(error))
    if (error instanceof BackendRejectionError && error.isApiKeyProblem) {
      void refresh()
    }
  }
  finally {
    isSearching.value = false
  }
}
</script>

<template>
  <ConsolePageLayout>
    <AppPageHeader
      title="新聞搜尋"
      description="依市場類別與標的，搜尋近 7 天的新聞。"
    />
    <ApiKeyGate>
      <AppCard>
        <SymbolQueryForm
          :categories="categories"
          submit-label="搜尋"
          :loading="isSearching"
          @submit="search"
        />
      </AppCard>
      <RequestErrorAlert
        v-if="searchError"
        :error="searchError"
        @retry="lastQuery && search(lastQuery)"
      />
      <NewsResultList
        v-if="symbolNews"
        :symbol-news="symbolNews"
      />
    </ApiKeyGate>
  </ConsolePageLayout>
</template>
