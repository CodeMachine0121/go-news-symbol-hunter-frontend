<template>
  <div class="console-page-layout">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.console-page-layout {
  display: flex;
  flex-direction: column;
  gap: spacing('lg');
}
</style>
