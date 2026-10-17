<template>
  <div class="app-empty-state">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.app-empty-state {
  padding: spacing('xl') spacing('md');
  border: 1px dashed color('border-strong');
  border-radius: radius('lg');
  color: color('text-muted');
  text-align: center;
}
</style>
