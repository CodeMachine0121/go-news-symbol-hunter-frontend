<script setup lang="ts">
import AppCard from '~/components/atoms/AppCard.vue'
import AppEmptyState from '~/components/atoms/AppEmptyState.vue'
import AppStat from '~/components/atoms/AppStat.vue'
import GradeBadge from '~/components/molecules/GradeBadge.vue'
import KeyEventList from '~/components/molecules/KeyEventList.vue'
import RiskFactorList from '~/components/molecules/RiskFactorList.vue'
import type { AnalysisResultDto } from '~/domain/models/dto/analysis-result-dto'

defineProps<{
  result: AnalysisResultDto
}>()
</script>

<template>
  <div class="analysis-result-report">
    <AppCard title="分析結論">
      <div class="analysis-result-report__verdict">
        <GradeBadge :value="result.grade" />
        <span class="analysis-result-report__horizon">{{ result.timeHorizon.label }}</span>
      </div>
      <div class="analysis-result-report__stats">
        <AppStat
          label="信心指數"
          :value="String(result.confidence)"
          caption="0–100"
        />
        <AppStat
          label="分析時價格"
          :value="result.priceAtAnalysis.priceText"
          :caption="`${result.priceAtAnalysis.sourceText}・${result.priceAtAnalysis.pricedAtText}`"
        />
      </div>
      <p class="analysis-result-report__reason">
        {{ result.reason }}
      </p>
    </AppCard>
    <AppCard title="關鍵事件">
      <KeyEventList
        v-if="result.keyEvents.length > 0"
        :key-events="result.keyEvents"
      />
      <AppEmptyState v-else>
        沒有關鍵事件
      </AppEmptyState>
    </AppCard>
    <AppCard title="風險因子">
      <RiskFactorList
        v-if="result.riskFactors.length > 0"
        :risk-factors="result.riskFactors"
      />
      <AppEmptyState v-else>
        沒有風險因子
      </AppEmptyState>
    </AppCard>
    <AppCard
      title="分析佐證"
      :description="`本次分析參考的 ${result.evidence.length} 則新聞`"
    >
      <ul class="analysis-result-report__evidence">
        <li
          v-for="evidence in result.evidence"
          :key="evidence.link"
          class="analysis-result-report__evidence-item"
        >
          <a
            :href="evidence.link"
            target="_blank"
            rel="noopener noreferrer"
          >{{ evidence.title }}</a>
          <span class="analysis-result-report__evidence-meta">{{ evidence.providerName }}・{{ evidence.publishedAtText }}</span>
        </li>
      </ul>
    </AppCard>
  </div>
</template>

<style scoped lang="scss">
.analysis-result-report {
  display: flex;
  flex-direction: column;
  gap: spacing('md');

  &__verdict {
    display: flex;
    gap: spacing('sm');
    align-items: center;
  }

  &__horizon {
    color: color('text-muted');
  }

  &__stats {
    display: grid;
    gap: spacing('sm');

    @include respond-to('sm') {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__reason {
    white-space: pre-line;
  }

  &__evidence {
    display: flex;
    flex-direction: column;
    gap: spacing('xs');
  }

  &__evidence-item {
    display: flex;
    flex-direction: column;
  }

  &__evidence-meta {
    color: color('text-muted');
    font-size: font-size('xs');
  }
}
</style>
