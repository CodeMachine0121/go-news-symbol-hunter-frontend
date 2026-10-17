<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
}>()

defineEmits<{ close: [] }>()
</script>

<template>
  <div
    v-if="open"
    class="app-dialog"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <div
      class="app-dialog__panel"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <h2 class="app-dialog__title">
        {{ title }}
      </h2>
      <div class="app-dialog__body">
        <slot />
      </div>
      <div class="app-dialog__actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-dialog {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: spacing('md');
  background: color('overlay');

  &__panel {
    display: flex;
    flex-direction: column;
    gap: spacing('md');
    width: 100%;
    max-width: size('dialog');
    padding: spacing('lg');
    background: color('surface');
    border-radius: radius('lg');
    box-shadow: shadow('dialog');
  }

  &__title {
    font-size: font-size('lg');
    font-weight: font-weight('semibold');
  }

  &__body {
    color: color('text-muted');
  }

  &__actions {
    display: flex;
    gap: spacing('xs');
    justify-content: flex-end;
  }
}
</style>
