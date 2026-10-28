<script setup lang="ts">
import AppBadge from '~/components/atoms/AppBadge.vue'
import AppCard from '~/components/atoms/AppCard.vue'
import AppEmptyState from '~/components/atoms/AppEmptyState.vue'
import GradeBadge from '~/components/molecules/GradeBadge.vue'
import type { AnalysisBacktestDto } from '~/domain/models/dto/analysis-backtest-dto'

defineProps<{
  analyses: AnalysisBacktestDto[]
}>()
</script>

<template>
  <AppCard
    title="逐筆明細"
    :description="`共 ${analyses.length} 筆評等紀錄`"
  >
    <AppEmptyState v-if="analyses.length === 0">
      這段期間沒有評等紀錄
    </AppEmptyState>
    <div
      v-else
      class="grade-backtest-table"
    >
      <table class="grade-backtest-table__table">
        <thead>
          <tr>
            <th>標的</th>
            <th>來源</th>
            <th>評等</th>
            <th>信心</th>
            <th>時間範圍</th>
            <th>建立時間</th>
            <th>交易日</th>
            <th>起點價格</th>
            <th>檢查日</th>
            <th>檢查點價格</th>
            <th>漲跌幅</th>
            <th>回測結果</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="analysis in analyses"
            :key="analysis.gradeRecordId"
          >
            <td>
              <NuxtLink
                v-if="analysis.linksToAnalysisEvent"
                class="grade-backtest-table__link"
                :to="`/analysis-events/${analysis.analysisEventId}`"
              >
                {{ analysis.category.label }} {{ analysis.symbol }}
              </NuxtLink>
              <template v-else>
                {{ analysis.category.label }} {{ analysis.symbol }}
              </template>
            </td>
            <td>{{ analysis.source.label }}</td>
            <td><GradeBadge :value="analysis.grade" /></td>
            <td>{{ analysis.confidence }}</td>
            <td>{{ analysis.timeHorizon.label }}</td>
            <td>{{ analysis.completedAtText }}</td>
            <td>{{ analysis.tradingDayText }}</td>
            <td>{{ analysis.entryPriceText }}</td>
            <td>{{ analysis.checkpointDateText }}</td>
            <td>{{ analysis.checkpointPriceText }}</td>
            <td>{{ analysis.priceChangeRateText }}</td>
            <td>
              <AppBadge :tone="analysis.outcome.tone">
                {{ analysis.outcome.label }}
              </AppBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppCard>
</template>

<style scoped lang="scss">
.grade-backtest-table {
  overflow-x: auto;

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: font-size('sm');
    white-space: nowrap;

    th {
      @include caption;

      padding: spacing('xs') spacing('sm') spacing('xs') 0;
      text-align: left;
      border-bottom: 1px solid color('border');
    }

    td {
      padding: spacing('sm') spacing('sm') spacing('sm') 0;
      border-bottom: 1px solid color('border');
    }
  }

  &__link {
    font-weight: font-weight('medium');
  }
}
</style>
