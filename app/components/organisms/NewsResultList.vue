<script setup lang="ts">
import AppAlert from '~/components/atoms/AppAlert.vue'
import AppCard from '~/components/atoms/AppCard.vue'
import AppEmptyState from '~/components/atoms/AppEmptyState.vue'
import NewsListItem from '~/components/molecules/NewsListItem.vue'
import type { SymbolNewsDto } from '~/domain/models/dto/symbol-news-dto'

defineProps<{
  symbolNews: SymbolNewsDto
}>()
</script>

<template>
  <AppCard
    :title="`${symbolNews.category.label} ${symbolNews.symbol}`"
    :description="`近 7 天，共 ${symbolNews.news.length} 則`"
  >
    <AppAlert
      v-if="symbolNews.failedNewsProvidersText"
      tone="warning"
    >
      {{ symbolNews.failedNewsProvidersText }}
    </AppAlert>
    <AppEmptyState v-if="symbolNews.news.length === 0">
      近 7 天沒有新聞
    </AppEmptyState>
    <div v-else>
      <NewsListItem
        v-for="news in symbolNews.news"
        :key="news.link"
        :news="news"
      />
    </div>
  </AppCard>
</template>
