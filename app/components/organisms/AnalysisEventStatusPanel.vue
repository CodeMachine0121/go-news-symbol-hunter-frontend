<script setup lang="ts">
import AppAlert from '~/components/atoms/AppAlert.vue'
import AppBadge from '~/components/atoms/AppBadge.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppCard from '~/components/atoms/AppCard.vue'
import AppSpinner from '~/components/atoms/AppSpinner.vue'
import type { AnalysisEventDto } from '~/domain/models/dto/analysis-event-dto'

defineProps<{
  analysisEvent: AnalysisEventDto
}>()

defineEmits<{ refresh: [], restart: [] }>()
</script>

<template>
  <AppCard title="分析狀態">
    <dl class="analysis-event-status-panel">
      <div class="analysis-event-status-panel__row">
        <dt>標的</dt>
        <dd>{{ analysisEvent.category.label }} {{ analysisEvent.symbol }}</dd>
      </div>
      <div class="analysis-event-status-panel__row">
        <dt>狀態</dt>
        <dd>
          <AppBadge :tone="analysisEvent.status.tone">
            {{ analysisEvent.status.label }}
          </AppBadge>
        </dd>
      </div>
      <div class="analysis-event-status-panel__row">
        <dt>開始時間</dt>
        <dd>{{ analysisEvent.startedAtText }}</dd>
      </div>
    </dl>
    <AppSpinner v-if="analysisEvent.keepPolling">
      分析中，每 3 秒自動更新
    </AppSpinner>
    <AppAlert
      v-if="analysisEvent.pollingExpired"
      tone="warning"
    >
      等候時間過長，請稍後手動重新整理
      <template #actions>
        <AppButton
          variant="secondary"
          size="small"
          @click="$emit('refresh')"
        >
          重新整理
        </AppButton>
      </template>
    </AppAlert>
    <AppAlert
      v-if="analysisEvent.failureMessage"
      tone="negative"
    >
      {{ analysisEvent.failureMessage }}
      <template #actions>
        <AppButton
          variant="secondary"
          size="small"
          @click="$emit('restart')"
        >
          重新發起
        </AppButton>
      </template>
    </AppAlert>
  </AppCard>
</template>

<style scoped lang="scss">
.analysis-event-status-panel {
  display: grid;
  gap: spacing('sm');

  &__row {
    display: flex;
    flex-direction: column;
    gap: spacing('3xs');

    dt {
      @include caption;
    }
  }
}
</style>
