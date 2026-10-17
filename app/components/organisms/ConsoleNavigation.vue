<script setup lang="ts">
const sections = [
  {
    title: '分析',
    links: [
      { to: '/analysis-events', label: '標的分析' },
      { to: '/news', label: '新聞搜尋' },
    ],
  },
  {
    title: '追蹤',
    links: [
      { to: '/tracked-symbol-grades', label: '追蹤標的評等' },
      { to: '/grade-backtest', label: '評等回測' },
    ],
  },
  {
    title: '設定',
    links: [{ to: '/api-key', label: 'API key' }],
  },
]
</script>

<template>
  <nav
    class="console-navigation"
    aria-label="主要導覽"
  >
    <div
      v-for="section in sections"
      :key="section.title"
      class="console-navigation__section"
    >
      <p class="console-navigation__title">
        {{ section.title }}
      </p>
      <NuxtLink
        v-for="link in section.links"
        :key="link.to"
        :to="link.to"
        class="console-navigation__link"
        active-class="console-navigation__link--active"
      >
        {{ link.label }}
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.console-navigation {
  display: flex;
  flex-direction: column;
  gap: spacing('lg');

  &__section {
    display: flex;
    flex-direction: column;
    gap: spacing('3xs');
  }

  &__title {
    @include caption;

    padding: 0 spacing('sm');
    margin-bottom: spacing('2xs');
  }

  &__link {
    padding: spacing('xs') spacing('sm');
    border-radius: radius('md');
    color: color('text-muted');
    text-decoration: none;

    &:hover {
      background: color('surface-muted');
      color: color('text');
    }

    &--active {
      background: color('surface-muted');
      color: color('text');
      font-weight: font-weight('semibold');
    }
  }
}
</style>
