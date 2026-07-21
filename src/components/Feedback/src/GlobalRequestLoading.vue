<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

import { isRequestLoading } from '@/services/request-status'

defineOptions({ name: 'GlobalRequestLoading' })
</script>

<template>
  <Transition name="global-request-loading">
    <div v-if="isRequestLoading" class="global-request-loading" role="status" aria-live="polite">
      <el-icon class="is-loading" :size="18"><Loading /></el-icon>
      <span>正在处理...</span>
    </div>
  </Transition>
</template>

<style scoped>
.global-request-loading {
  display: flex;
  position: fixed;
  z-index: 4000;
  top: 12px;
  left: 50%;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-overlay);
  box-shadow: var(--el-box-shadow-light);
  transform: translateX(-50%);
}

.global-request-loading-enter-active,
.global-request-loading-leave-active {
  transition: opacity 0.16s, transform 0.16s;
}

.global-request-loading-enter-from,
.global-request-loading-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}
</style>
