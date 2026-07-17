<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

import AppLogo from '@/components/Layout/AppLogo'
import SidebarMenu from '@/components/Layout/SidebarMenu'
import { usePermissionStore } from '@/stores/permission'

defineOptions({ name: 'AppSidebar' })
defineProps<{ collapsed?: boolean }>()
const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()

function handleSelect(path: string): void {
  emit('navigate')
  if (path !== route.path) void router.push(path)
}
</script>

<template>
  <div class="app-sidebar">
    <AppLogo :collapsed="collapsed" />
    <el-scrollbar class="app-sidebar__scrollbar">
      <el-menu
        :collapse="collapsed"
        :collapse-transition="false"
        :default-active="route.path"
        @select="handleSelect"
      >
        <SidebarMenu :routes="permissionStore.routes" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.app-sidebar {
  height: 100%;
  background: var(--el-bg-color);
}

.app-sidebar__scrollbar {
  height: calc(100% - var(--app-header-height));
}

.app-sidebar :deep(.el-menu) {
  border-right: 0;
}
</style>
