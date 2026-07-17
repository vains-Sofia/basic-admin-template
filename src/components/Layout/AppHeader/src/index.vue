<script setup lang="ts">
import { ArrowDown, Expand, Fold } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'AppHeader' })
defineProps<{ mobile?: boolean }>()
const emit = defineEmits<{ toggle: []; logout: [] }>()

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()
const breadcrumbs = computed(() =>
  route.matched.filter((item) => item.meta.title && !item.meta.hidden),
)
</script>

<template>
  <header class="app-header">
    <div class="app-header__start">
      <el-tooltip content="切换导航" placement="bottom">
        <el-button text class="app-header__toggle" @click="emit('toggle')">
          <el-icon :size="20">
            <Expand v-if="mobile || appStore.sidebarCollapsed" />
            <Fold v-else />
          </el-icon>
        </el-button>
      </el-tooltip>

      <el-breadcrumb class="app-header__breadcrumb" separator="/">
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="String(item.name)">
          {{ item.meta.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dropdown trigger="click" @command="emit('logout')">
      <button class="app-header__user" type="button">
        <el-avatar :size="30">{{ userStore.profile?.displayName.slice(0, 1) }}</el-avatar>
        <span class="app-header__user-name">{{ userStore.profile?.displayName }}</span>
        <el-icon><ArrowDown /></el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  height: var(--app-header-height);
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 0 8px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}

.app-header__start,
.app-header__user {
  display: flex;
  min-width: 0;
  align-items: center;
}

.app-header__toggle {
  width: 40px;
  height: 40px;
}

.app-header__user {
  gap: 8px;
  padding: 4px;
  border: 0;
  color: var(--el-text-color-regular);
  background: transparent;
  cursor: pointer;
}

@media (max-width: 767px) {
  .app-header__breadcrumb,
  .app-header__user-name {
    display: none;
  }
}
</style>
