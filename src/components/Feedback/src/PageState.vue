<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import { computed } from 'vue'

import { getErrorMessage } from '@/utils/error'

import type { PageStateStatus } from './types'

defineOptions({ name: 'PageState' })

const props = withDefaults(
  defineProps<{
    status: PageStateStatus
    error?: unknown
    loadingText?: string
    emptyText?: string
    errorText?: string
    retryText?: string
    showRetry?: boolean
  }>(),
  {
    loadingText: '加载中...',
    emptyText: '暂无数据',
    errorText: '',
    retryText: '重新加载',
    showRetry: true,
  },
)

const emit = defineEmits<{ retry: [] }>()
const resolvedErrorText = computed(() => props.errorText || getErrorMessage(props.error, '加载失败'))
</script>

<template>
  <section class="page-state" :aria-busy="status === 'loading'" role="status">
    <slot v-if="status === 'loading'" name="loading">
      <el-skeleton animated :loading="true" :rows="4">
        <template #template>
          <div class="page-state__loading">
            <el-icon class="is-loading" :size="22"><Loading /></el-icon>
            <span>{{ loadingText }}</span>
          </div>
        </template>
      </el-skeleton>
    </slot>

    <slot v-else-if="status === 'empty'" name="empty">
      <el-empty :description="emptyText" />
    </slot>

    <slot v-else name="error">
      <el-result icon="error" title="加载失败" :sub-title="resolvedErrorText">
        <template v-if="showRetry" #extra>
          <el-button type="primary" @click="emit('retry')">{{ retryText }}</el-button>
        </template>
      </el-result>
    </slot>
  </section>
</template>

<style scoped>
.page-state {
  display: grid;
  min-height: 180px;
  place-items: center;
  padding: 24px;
}

.page-state__loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--el-text-color-secondary);
}
</style>
