<script setup lang="ts">
import { ref } from 'vue'

const isNavigationOpen = ref(false)
</script>

<template>
  <div class="console-layout">
    <aside :class="['console-layout__sidebar', { 'console-layout__sidebar--open': isNavigationOpen }]">
      <div class="console-layout__brand">
        <slot name="brand" />
      </div>
      <div @click="isNavigationOpen = false">
        <slot name="navigation" />
      </div>
    </aside>
    <div class="console-layout__main">
      <header class="console-layout__topbar">
        <button
          type="button"
          class="console-layout__menu"
          :aria-expanded="isNavigationOpen"
          aria-label="切換導覽"
          @click="isNavigationOpen = !isNavigationOpen"
        >
          ☰
        </button>
        <div class="console-layout__status">
          <slot name="status" />
        </div>
      </header>
      <main class="console-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.console-layout {
  display: flex;
  min-height: 100vh;

  &__sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 50;
    display: none;
    flex-direction: column;
    gap: spacing('lg');
    width: size('sidebar');
    padding: spacing('md');
    background: color('surface');
    border-right: 1px solid color('border');

    &--open {
      display: flex;
    }

    @include respond-to('md') {
      position: sticky;
      top: 0;
      display: flex;
      height: 100vh;
    }
  }

  &__brand {
    padding: 0 spacing('sm');
    font-weight: font-weight('semibold');
  }

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__topbar {
    display: flex;
    gap: spacing('sm');
    align-items: center;
    justify-content: space-between;
    padding: spacing('sm') spacing('lg');
    background: color('surface');
    border-bottom: 1px solid color('border');
  }

  &__menu {
    padding: spacing('2xs') spacing('xs');
    background: transparent;
    border: 1px solid color('border-strong');
    border-radius: radius('sm');
    cursor: pointer;

    @include respond-to('md') {
      visibility: hidden;
    }
  }

  &__status {
    display: flex;
    gap: spacing('xs');
    align-items: center;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: spacing('lg');
    max-width: size('content');
    padding: spacing('lg') spacing('md');
    margin: 0 auto;

    @include respond-to('md') {
      padding: spacing('xl') spacing('lg');
    }
  }
}
</style>
