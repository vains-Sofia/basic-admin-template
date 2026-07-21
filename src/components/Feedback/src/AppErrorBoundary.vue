<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

import { normalizeError } from '@/utils/error'

import PageState from './PageState.vue'

defineOptions({ name: 'AppErrorBoundary' })

const error = ref<unknown>()

onErrorCaptured((cause) => {
  error.value = cause
  return false
})

function reload(): void {
  window.location.reload()
}
</script>

<template>
  <slot v-if="!error" />
  <PageState
    v-else
    status="error"
    :error="normalizeError(error, '页面运行出现异常').message"
    error-text="页面运行出现异常，请刷新后重试"
    retry-text="刷新页面"
    @retry="reload"
  />
</template>
