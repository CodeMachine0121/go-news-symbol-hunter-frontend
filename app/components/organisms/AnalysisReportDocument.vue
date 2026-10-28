<script setup lang="ts">
import AnalysisResultReport from '~/components/organisms/AnalysisResultReport.vue'
import type { AnalysisReportDto } from '~/domain/models/dto/analysis-report-dto'

defineProps<{
  report: AnalysisReportDto
}>()
</script>

<template>
  <article class="analysis-report-document">
    <header class="analysis-report-document__header">
      <p class="analysis-report-document__eyebrow">
        標的分析報告・分析事件 #{{ report.analysisEventId }}
      </p>
      <h1 class="analysis-report-document__title">
        {{ report.category.label }} {{ report.symbol }}
      </h1>
      <p class="analysis-report-document__completed-at">
        分析完成時間 {{ report.result.createdAtText }}
      </p>
    </header>
    <AnalysisResultReport
      :result="report.result"
      show-evidence-link
    />
    <footer class="analysis-report-document__footer">
      <span>匯出時間 {{ report.exportedAtText }}</span>
      <span>{{ report.disclaimer }}</span>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.analysis-report-document {
  display: flex;
  flex-direction: column;
  gap: spacing('lg');

  &__header {
    display: flex;
    flex-direction: column;
    gap: spacing('xs');
    padding-bottom: spacing('md');
    border-bottom: 2px solid color('text');
  }

  &__eyebrow {
    @include caption;
  }

  &__title {
    font-size: font-size('3xl');
    font-weight: font-weight('semibold');
    line-height: line-height('tight');
  }

  &__completed-at {
    color: color('text-muted');
  }

  &__footer {
    @include keep-on-one-page;

    display: flex;
    flex-wrap: wrap;
    gap: spacing('xs');
    justify-content: space-between;
    padding-top: spacing('sm');
    border-top: 1px solid color('border-strong');
    color: color('text-muted');
    font-size: font-size('xs');
  }
}
</style>
