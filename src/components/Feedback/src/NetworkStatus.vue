<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({ name: 'NetworkStatus' })

const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine)

function setOnline(): void {
  online.value = true
}

function setOffline(): void {
  online.value = false
}

onMounted(() => {
  window.addEventListener('online', setOnline)
  window.addEventListener('offline', setOffline)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', setOnline)
  window.removeEventListener('offline', setOffline)
})
</script>

<template>
  <el-alert
    v-if="!online"
    class="network-status"
    type="warning"
    title="网络连接已断开，恢复连接后请重试"
    :closable="false"
    show-icon
  />
</template>

<style scoped>
.network-status {
  position: fixed;
  z-index: 3999;
  right: 12px;
  bottom: 12px;
  width: min(360px, calc(100vw - 24px));
}
</style>
