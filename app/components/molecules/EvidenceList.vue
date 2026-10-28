<script setup lang="ts">
import type { EvidenceDto } from '~/domain/models/dto/evidence-dto'

withDefaults(defineProps<{
  evidence: EvidenceDto[]
  showLink?: boolean
}>(), {
  showLink: false,
})
</script>

<template>
  <ul class="evidence-list">
    <li
      v-for="item in evidence"
      :key="item.link"
      class="evidence-list__item"
    >
      <a
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
      >{{ item.title }}</a>
      <span
        v-if="showLink"
        class="evidence-list__link"
      >{{ item.link }}</span>
      <span class="evidence-list__meta">{{ item.providerName }}・{{ item.publishedAtText }}</span>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.evidence-list {
  display: flex;
  flex-direction: column;
  gap: spacing('xs');

  &__item {
    @include keep-on-one-page;

    display: flex;
    flex-direction: column;
  }

  &__link {
    color: color('text-muted');
    font-family: font-family('mono');
    font-size: font-size('xs');
    overflow-wrap: anywhere;
  }

  &__meta {
    color: color('text-muted');
    font-size: font-size('xs');
  }
}
</style>
