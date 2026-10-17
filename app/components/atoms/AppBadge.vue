<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'positive' | 'negative' | 'neutral' | 'info' | 'warning'
}>(), { tone: 'neutral' })
</script>

<template>
  <span :class="['app-badge', `app-badge--${tone}`]"><slot /></span>
</template>

<style scoped lang="scss">
.app-badge {
  display: inline-flex;
  align-items: center;
  padding: spacing('3xs') spacing('xs');
  border-radius: radius('pill');
  font-size: font-size('xs');
  font-weight: font-weight('semibold');
  white-space: nowrap;

  &--positive {
    background: color('positive-soft');
    color: color('positive');
  }

  &--negative {
    background: color('negative-soft');
    color: color('negative');
  }

  &--neutral {
    background: color('neutral-soft');
    color: color('neutral');
  }

  &--info {
    background: color('info-soft');
    color: color('info');
  }

  &--warning {
    background: color('warning-soft');
    color: color('warning');
  }
}
</style>
