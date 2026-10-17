<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'negative' | 'warning' | 'info' | 'positive' | 'neutral'
}>(), { tone: 'info' })
</script>

<template>
  <div
    :class="['app-alert', `app-alert--${tone}`]"
    :role="tone === 'negative' ? 'alert' : 'status'"
  >
    <div class="app-alert__message">
      <slot />
    </div>
    <div
      v-if="$slots.actions"
      class="app-alert__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-alert {
  display: flex;
  flex-wrap: wrap;
  gap: spacing('sm');
  align-items: center;
  justify-content: space-between;
  padding: spacing('sm') spacing('md');
  border: 1px solid transparent;
  border-radius: radius('md');
  font-size: font-size('md');

  &__actions {
    display: flex;
    gap: spacing('xs');
  }

  &--negative {
    background: color('negative-soft');
    color: color('negative');
  }

  &--warning {
    background: color('warning-soft');
    color: color('warning');
  }

  &--info {
    background: color('info-soft');
    color: color('info');
  }

  &--positive {
    background: color('positive-soft');
    color: color('positive');
  }

  &--neutral {
    background: color('neutral-soft');
    color: color('neutral');
  }
}
</style>
