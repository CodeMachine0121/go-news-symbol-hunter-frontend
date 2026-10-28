<template>
  <div class="report-layout">
    <div class="report-layout__toolbar">
      <slot name="toolbar" />
    </div>
    <main class="report-layout__paper">
      <slot />
    </main>
  </div>
</template>

<style scoped lang="scss">
.report-layout {
  display: flex;
  flex-direction: column;
  gap: spacing('md');
  align-items: center;
  min-height: 100vh;
  padding: spacing('lg') spacing('md');

  @include on-print {
    display: block;
    min-height: auto;
    padding: 0;
  }

  &__toolbar {
    display: flex;
    gap: spacing('sm');
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    max-width: size('paper');

    @include on-print {
      display: none;
    }
  }

  &__paper {
    width: 100%;
    max-width: size('paper');
    padding: size('paper-margin');
    background: color('surface');
    box-shadow: shadow('card');

    @include on-print {
      max-width: none;
      padding: 0;
      box-shadow: none;
    }
  }
}
</style>
