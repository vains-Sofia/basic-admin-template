<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import { ref } from 'vue'

import { PageState, type PageStateStatus } from '@/components/Feedback'
import { finishRequest, startRequest } from '@/services/request-status'

defineOptions({ name: 'FeedbackExamples' })

const state = ref<PageStateStatus>('loading')

function retry(): void {
  state.value = 'loading'
  window.setTimeout(() => (state.value = 'empty'), 600)
}

function showGlobalLoading(): void {
  startRequest()
  window.setTimeout(finishRequest, 900)
}
</script>

<template>
  <div class="feedback-example-page">
    <header class="feedback-example-page__header">
      <h1 class="page-title">反馈与页面状态</h1>
      <el-button :icon="Refresh" @click="showGlobalLoading">模拟全局请求</el-button>
    </header>

    <el-segmented
      v-model="state"
      :options="[
        { label: '加载', value: 'loading' },
        { label: '空数据', value: 'empty' },
        { label: '异常', value: 'error' },
      ]"
    />

    <section class="page-section feedback-example-page__preview">
      <PageState
        :status="state"
        error-text="示例数据加载失败"
        empty-text="当前筛选条件下没有数据"
        @retry="retry"
      />
    </section>
  </div>
</template>

<style scoped>
.feedback-example-page {
  display: grid;
  gap: 16px;
}

.feedback-example-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.feedback-example-page__preview {
  min-height: 320px;
}

@media (max-width: 560px) {
  .feedback-example-page__header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
