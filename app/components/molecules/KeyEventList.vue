<script setup lang="ts">
import type { KeyEventDto } from '~/domain/models/dto/key-event-dto'

defineProps<{
  keyEvents: KeyEventDto[]
}>()
</script>

<template>
  <ol class="key-event-list">
    <li
      v-for="keyEvent in keyEvents"
      :key="keyEvent.link"
      class="key-event-list__item"
    >
      <a
        class="key-event-list__title"
        :href="keyEvent.link"
        target="_blank"
        rel="noopener noreferrer"
      >{{ keyEvent.title }}</a>
      <span class="key-event-list__time">{{ keyEvent.publishedAtText }}</span>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.key-event-list {
  display: flex;
  flex-direction: column;
  gap: spacing('xs');

  &__item {
    @include keep-on-one-page;

    display: flex;
    flex-direction: column;
    gap: spacing('3xs');
    padding-left: spacing('sm');
    border-left: 2px solid color('border-strong');
  }

  &__title {
    font-weight: font-weight('medium');
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__time {
    color: color('text-muted');
    font-size: font-size('xs');
  }
}
</style>
