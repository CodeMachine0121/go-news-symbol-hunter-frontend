<template>
  <span
    class="app-spinner"
    role="status"
  >
    <span
      class="app-spinner__circle"
      aria-hidden="true"
    />
    <span class="app-spinner__label"><slot>載入中</slot></span>
  </span>
</template>

<style scoped lang="scss">
.app-spinner {
  display: inline-flex;
  gap: spacing('xs');
  align-items: center;
  color: color('text-muted');
  font-size: font-size('sm');

  &__circle {
    width: size('spinner');
    height: size('spinner');
    border: 2px solid color('border-strong');
    border-top-color: color('text');
    border-radius: radius('pill');
    animation: app-spinner-spin duration('spin') linear infinite;
  }
}

@keyframes app-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
