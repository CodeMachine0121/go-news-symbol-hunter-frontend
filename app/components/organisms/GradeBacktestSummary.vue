<script setup lang="ts">
import AppCard from '~/components/atoms/AppCard.vue'
import AppStat from '~/components/atoms/AppStat.vue'
import type { GradeBacktestDto } from '~/domain/models/dto/grade-backtest-dto'

defineProps<{
  gradeBacktest: GradeBacktestDto
}>()
</script>

<template>
  <div class="grade-backtest-summary">
    <div class="grade-backtest-summary__stats">
      <AppStat
        label="整體命中率"
        :value="gradeBacktest.overall.hitRateText"
        :caption="`${gradeBacktest.randomBaselineText}・命中 ${gradeBacktest.overall.hitCount} / 沒命中 ${gradeBacktest.overall.missCount}`"
      />
      <AppStat
        label="中性評等平均漲跌幅"
        :value="gradeBacktest.neutralAverageChangeRateText"
      />
      <AppStat
        v-for="outcomeCount in gradeBacktest.outcomeCounts"
        :key="outcomeCount.outcome.value"
        :label="outcomeCount.outcome.label"
        :value="String(outcomeCount.count)"
        caption="筆"
      />
    </div>
    <div class="grade-backtest-summary__groups">
      <AppCard
        v-for="group in [
          { title: '依市場類別', hitRates: gradeBacktest.byCategory },
          { title: '依評等', hitRates: gradeBacktest.byGrade },
          { title: '依信心分組', hitRates: gradeBacktest.byConfidenceBand },
          { title: '依來源', hitRates: gradeBacktest.bySource },
        ]"
        :key="group.title"
        :title="group.title"
      >
        <table class="grade-backtest-summary__table">
          <thead>
            <tr>
              <th>分組</th>
              <th>命中率</th>
              <th>命中</th>
              <th>沒命中</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="hitRate in group.hitRates"
              :key="hitRate.group.value"
            >
              <td>{{ hitRate.group.label }}</td>
              <td>{{ hitRate.hitRateText }}</td>
              <td>{{ hitRate.hitCount }}</td>
              <td>{{ hitRate.missCount }}</td>
            </tr>
          </tbody>
        </table>
      </AppCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.grade-backtest-summary {
  display: flex;
  flex-direction: column;
  gap: spacing('md');

  &__stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: spacing('sm');

    @include respond-to('lg') {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__groups {
    display: grid;
    gap: spacing('md');

    @include respond-to('lg') {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: font-size('sm');

    th {
      @include caption;

      padding: spacing('xs') 0;
      text-align: left;
      border-bottom: 1px solid color('border');
    }

    td {
      padding: spacing('xs') 0;
      border-bottom: 1px solid color('border');
    }
  }
}
</style>
