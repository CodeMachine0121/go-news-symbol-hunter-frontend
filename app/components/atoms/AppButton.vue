<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'medium' | 'small'
  type?: 'button' | 'submit'
  loading?: boolean
  block?: boolean
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'medium',
  type: 'button',
  loading: false,
  block: false,
  disabled: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :class="['app-button', `app-button--${variant}`, `app-button--${size}`, { 'app-button--block': block }]"
  >
    <span
      v-if="loading"
      class="app-button__spinner"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>

<style scoped lang="scss">
.app-button {
  display: inline-flex;
  gap: spacing('xs');
  align-items: center;
  justify-content: center;
  height: size('control');
  padding: 0 spacing('md');
  border: 1px solid transparent;
  border-radius: radius('md');
  font-size: font-size('md');
  font-weight: font-weight('medium');
  white-space: nowrap;
  cursor: pointer;
  transition: background duration('fast');

  &:focus-visible {
    @include focus-ring;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &--primary {
    background: color('primary');
    color: color('text-inverse');

    &:hover:not(:disabled) {
      background: color('primary-hover');
    }
  }

  &--secondary {
    background: color('surface');
    border-color: color('border-strong');
    color: color('text');

    &:hover:not(:disabled) {
      background: color('surface-muted');
    }
  }

  &--ghost {
    background: transparent;
    color: color('text-muted');

    &:hover:not(:disabled) {
      background: color('surface-muted');
      color: color('text');
    }
  }

  &--danger {
    background: color('negative');
    color: color('text-inverse');
  }

  &--small {
    height: size('control-small');
    padding: 0 spacing('sm');
    font-size: font-size('sm');
  }

  &--block {
    width: 100%;
  }

  &__spinner {
    width: spacing('sm');
    height: spacing('sm');
    border: 2px solid currentcolor;
    border-right-color: transparent;
    border-radius: radius('pill');
    animation: app-button-spin duration('spin') linear infinite;
  }
}

@keyframes app-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
