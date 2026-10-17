<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppCard from '~/components/atoms/AppCard.vue'
import GradeBadge from '~/components/molecules/GradeBadge.vue'
import KeyEventList from '~/components/molecules/KeyEventList.vue'
import RiskFactorList from '~/components/molecules/RiskFactorList.vue'
import type { TrackedSymbolGradeDto } from '~/domain/models/dto/tracked-symbol-grade-dto'

defineProps<{
  trackedSymbolGrade: TrackedSymbolGradeDto
}>()

const isExpanded = ref(false)
</script>

<template>
  <AppCard>
    <div class="tracked-symbol-grade-card__summary">
      <div class="tracked-symbol-grade-card__identity">
        <strong class="tracked-symbol-grade-card__symbol">{{ trackedSymbolGrade.symbol }}</strong>
        <span class="tracked-symbol-grade-card__muted">{{ trackedSymbolGrade.category.label }}・交易日 {{ trackedSymbolGrade.tradingDay }}</span>
      </div>
      <dl class="tracked-symbol-grade-card__figures">
        <div>
          <dt>綜合評等</dt>
          <dd><GradeBadge :value="trackedSymbolGrade.grade" /></dd>
        </div>
        <div>
          <dt>綜合分數</dt>
          <dd>{{ trackedSymbolGrade.combinedScoreText }}</dd>
        </div>
        <div>
          <dt>信心指數</dt>
          <dd>{{ trackedSymbolGrade.confidence }}</dd>
        </div>
        <div>
          <dt>更新時間</dt>
          <dd>{{ trackedSymbolGrade.updatedAtText }}</dd>
        </div>
      </dl>
      <AppButton
        variant="ghost"
        size="small"
        :aria-expanded="isExpanded"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? '收合時段評等' : '展開時段評等' }}
      </AppButton>
    </div>
    <div
      v-if="isExpanded"
      class="tracked-symbol-grade-card__sessions"
    >
      <section
        v-for="sessionSlot in trackedSymbolGrade.sessionSlots"
        :key="sessionSlot.session.value"
        class="tracked-symbol-grade-card__session"
      >
        <h3 class="tracked-symbol-grade-card__session-title">
          {{ sessionSlot.session.label }}
        </h3>
        <p
          v-if="!sessionSlot.sessionGrade"
          class="tracked-symbol-grade-card__muted"
        >
          {{ sessionSlot.emptyText }}
        </p>
        <template v-else>
          <p class="tracked-symbol-grade-card__session-verdict">
            <GradeBadge :value="sessionSlot.sessionGrade.grade" />
            <span>信心 {{ sessionSlot.sessionGrade.confidence }}</span>
          </p>
          <p>{{ sessionSlot.sessionGrade.reason }}</p>
          <KeyEventList :key-events="sessionSlot.sessionGrade.keyEvents" />
          <RiskFactorList :risk-factors="sessionSlot.sessionGrade.riskFactors" />
        </template>
      </section>
    </div>
  </AppCard>
</template>

<style scoped lang="scss">
.tracked-symbol-grade-card {
  &__summary {
    display: grid;
    gap: spacing('md');
    align-items: center;

    @include respond-to('lg') {
      grid-template-columns: size('category-field') 1fr auto;
    }
  }

  &__identity {
    display: flex;
    flex-direction: column;
  }

  &__symbol {
    font-size: font-size('xl');
  }

  &__muted {
    color: color('text-muted');
    font-size: font-size('sm');
  }

  &__figures {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: spacing('sm');

    @include respond-to('md') {
      grid-template-columns: repeat(4, 1fr);
    }

    dt {
      @include caption;
    }
  }

  &__sessions {
    display: grid;
    gap: spacing('md');
    padding-top: spacing('md');
    border-top: 1px solid color('border');

    @include respond-to('lg') {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__session {
    display: flex;
    flex-direction: column;
    gap: spacing('xs');
  }

  &__session-title {
    font-size: font-size('md');
    font-weight: font-weight('semibold');
  }

  &__session-verdict {
    display: flex;
    gap: spacing('xs');
    align-items: center;
  }
}
</style>
