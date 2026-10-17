<script setup lang="ts">
import AppCard from '~/components/atoms/AppCard.vue'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import SymbolQueryForm from '~/components/molecules/SymbolQueryForm.vue'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import NewsResultList from '~/components/organisms/NewsResultList.vue'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'
import { NEWS_SEARCH_APPLICATION } from '~/composables/application-injection-keys'
import { useApplication } from '~/composables/use-application'
import { useRequest } from '~/composables/use-request'
import type { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'

const newsSearchApplication = useApplication(NEWS_SEARCH_APPLICATION)
const categories = newsSearchApplication.listMarketCategories()
const newsSearch = useRequest((symbolQueryDto: SymbolQueryDto) => newsSearchApplication.searchSymbolNews(symbolQueryDto))
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
          :loading="newsSearch.isRunning.value"
          @submit="newsSearch.run"
        />
      </AppCard>
      <RequestErrorAlert
        v-if="newsSearch.error.value"
        :error="newsSearch.error.value"
        @retry="newsSearch.retry"
      />
      <NewsResultList
        v-if="newsSearch.data.value"
        :symbol-news="newsSearch.data.value"
      />
    </ApiKeyGate>
  </ConsolePageLayout>
</template>
