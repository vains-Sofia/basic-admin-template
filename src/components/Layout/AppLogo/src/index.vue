<script setup lang="ts">
import { APP_TITLE } from '@/config/app'

defineOptions({ name: 'AppLogo' })
defineProps<{ collapsed?: boolean }>()
</script>

<template>
  <div class="app-logo">
    <span class="app-logo__mark">A</span>
    <span v-if="!collapsed" class="app-logo__title">{{ APP_TITLE }}</span>
  </div>
</template>

<style scoped>
.app-logo {
  display: flex;
  height: var(--app-header-height);
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  overflow: hidden;
  border-bottom: 1px solid var(--el-border-color-light);
  white-space: nowrap;
}

.app-logo__mark {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border-radius: 6px;
  color: var(--el-color-white);
  background: var(--el-color-primary);
  font-weight: 700;
}

.app-logo__title {
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
  text-overflow: ellipsis;
}
</style>
