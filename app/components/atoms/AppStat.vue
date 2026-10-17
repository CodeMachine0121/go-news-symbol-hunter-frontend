<script setup lang="ts">
defineProps<{
  label: string
  value: string
  caption?: string
}>()
</script>

<template>
  <div class="app-stat">
    <span class="app-stat__label">{{ label }}</span>
    <span class="app-stat__value">{{ value }}</span>
    <span
      v-if="caption"
      class="app-stat__caption"
    >{{ caption }}</span>
  </div>
</template>

<style scoped lang="scss">
.app-stat {
  @include surface;

  display: flex;
  flex-direction: column;
  gap: spacing('2xs');
  padding: spacing('md');

  &__label {
    @include caption;
  }

  &__value {
    font-size: font-size('2xl');
    font-weight: font-weight('semibold');
    line-height: line-height('tight');
  }

  &__caption {
    color: color('text-muted');
    font-size: font-size('sm');
  }
}
</style>
