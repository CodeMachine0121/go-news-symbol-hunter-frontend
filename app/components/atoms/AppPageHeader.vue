<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="app-page-header">
    <div>
      <h1 class="app-page-header__title">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="app-page-header__description"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="app-page-header__actions"
    >
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-page-header {
  display: flex;
  flex-wrap: wrap;
  gap: spacing('md');
  align-items: flex-end;
  justify-content: space-between;

  &__title {
    font-size: font-size('2xl');
    font-weight: font-weight('semibold');
    line-height: line-height('tight');
  }

  &__description {
    margin-top: spacing('2xs');
    color: color('text-muted');
  }

  &__actions {
    display: flex;
    gap: spacing('xs');
  }
}
</style>
