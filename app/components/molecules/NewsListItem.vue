<script setup lang="ts">
import type { NewsDto } from '~/domain/models/dto/news-dto'

defineProps<{
  news: NewsDto
}>()
</script>

<template>
  <article class="news-list-item">
    <p class="news-list-item__meta">
      <span class="news-list-item__provider">{{ news.providerName }}</span>
      <span>{{ news.publishedAtText }}</span>
    </p>
    <a
      class="news-list-item__title"
      :href="news.link"
      target="_blank"
      rel="noopener noreferrer"
    >{{ news.title }}</a>
    <p
      v-if="news.summary"
      class="news-list-item__summary"
    >
      {{ news.summary }}
    </p>
  </article>
</template>

<style scoped lang="scss">
.news-list-item {
  display: flex;
  flex-direction: column;
  gap: spacing('2xs');
  padding: spacing('md') 0;
  border-bottom: 1px solid color('border');

  &__meta {
    display: flex;
    gap: spacing('xs');
    color: color('text-muted');
    font-size: font-size('xs');
  }

  &__provider {
    font-weight: font-weight('semibold');
  }

  &__title {
    font-size: font-size('lg');
    font-weight: font-weight('semibold');
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__summary {
    color: color('text-muted');
  }
}
</style>
