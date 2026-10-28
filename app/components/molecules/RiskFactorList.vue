<script setup lang="ts">
defineProps<{
  riskFactors: string[]
}>()
</script>

<template>
  <ul class="risk-factor-list">
    <li
      v-for="riskFactor in riskFactors"
      :key="riskFactor"
      class="risk-factor-list__item"
    >
      {{ riskFactor }}
    </li>
  </ul>
</template>

<style scoped lang="scss">
.risk-factor-list {
  display: flex;
  flex-direction: column;
  gap: spacing('2xs');

  &__item {
    @include keep-on-one-page;

    padding: spacing('xs') spacing('sm');
    background: color('warning-soft');
    border-radius: radius('sm');
    color: color('text');
  }
}
</style>
