<script setup lang="ts">
import { clearAppError, globalAppError } from '@/services/app-errors'

defineOptions({ name: 'GlobalErrorNotice' })

function reload(): void {
  window.location.reload()
}
</script>

<template>
  <el-alert
    v-if="globalAppError"
    class="global-error-notice"
    type="error"
    :title="globalAppError.message"
    :closable="true"
    show-icon
    @close="clearAppError"
  >
    <template #default>
      <el-button link type="danger" @click="reload">刷新页面</el-button>
    </template>
  </el-alert>
</template>

<style scoped>
.global-error-notice {
  position: fixed;
  z-index: 3998;
  top: 12px;
  right: 12px;
  width: min(420px, calc(100vw - 24px));
}
</style>
