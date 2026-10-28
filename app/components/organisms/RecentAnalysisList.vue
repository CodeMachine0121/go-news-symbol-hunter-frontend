<script setup lang="ts">
import AppCard from '~/components/atoms/AppCard.vue'
import AppEmptyState from '~/components/atoms/AppEmptyState.vue'
import type { RecentAnalysisDto } from '~/domain/models/dto/recent-analysis-dto'

defineProps<{
  recentAnalyses: RecentAnalysisDto[]
}>()
</script>

<template>
  <AppCard
    title="我發起過的分析"
    description="只記住這個瀏覽器最近 20 筆。"
  >
    <AppEmptyState v-if="recentAnalyses.length === 0">
      還沒有發起過分析
    </AppEmptyState>
    <ul
      v-else
      class="recent-analysis-list"
    >
      <li
        v-for="recentAnalysis in recentAnalyses"
        :key="recentAnalysis.analysisEventId"
      >
        <NuxtLink
          class="recent-analysis-list__link"
          :to="`/analysis-events/${recentAnalysis.analysisEventId}`"
        >
          <span class="recent-analysis-list__symbol">{{ recentAnalysis.category.label }} {{ recentAnalysis.symbolLabel }}</span>
          <span class="recent-analysis-list__time">{{ recentAnalysis.startedAtText }}</span>
        </NuxtLink>
      </li>
    </ul>
  </AppCard>
</template>

<style scoped lang="scss">
.recent-analysis-list {
  display: flex;
  flex-direction: column;

  &__link {
    display: flex;
    gap: spacing('md');
    justify-content: space-between;
    padding: spacing('sm') 0;
    border-bottom: 1px solid color('border');
    text-decoration: none;

    &:hover {
      color: color('info');
    }
  }

  &__symbol {
    min-width: 0;
    font-weight: font-weight('medium');
    overflow-wrap: anywhere;
  }

  &__time {
    flex-shrink: 0;
    color: color('text-muted');
    font-size: font-size('sm');
  }
}
</style>
