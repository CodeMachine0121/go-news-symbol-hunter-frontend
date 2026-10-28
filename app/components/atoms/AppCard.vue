<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <section class="app-card">
    <header
      v-if="title"
      class="app-card__header"
    >
      <h2 class="app-card__title">
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="app-card__description"
      >
        {{ description }}
      </p>
    </header>
    <slot />
  </section>
</template>

<style scoped lang="scss">
.app-card {
  @include surface;

  display: flex;
  flex-direction: column;
  gap: spacing('md');
  padding: spacing('lg');

  @include on-print {
    padding: 0;
    border: none;
    box-shadow: none;
  }

  &__header {
    display: flex;
    flex-direction: column;

    @include on-print {
      break-after: avoid;
    }
  }

  &__title {
    font-size: font-size('lg');
    font-weight: font-weight('semibold');
  }

  &__description {
    margin-top: spacing('3xs');
    color: color('text-muted');
    font-size: font-size('sm');
  }
}
</style>
