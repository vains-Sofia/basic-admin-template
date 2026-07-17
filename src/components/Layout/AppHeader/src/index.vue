<script setup lang="ts">
import { ArrowDown, Expand, Fold, Moon, Sunny } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useLayoutStore } from '@/stores/layout'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'AppHeader' })
defineProps<{ mobile?: boolean }>()
const emit = defineEmits<{ toggle: []; logout: [] }>()

const route = useRoute()
const layoutStore = useLayoutStore()
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
            <Expand v-if="mobile || layoutStore.sidebarCollapsed" />
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

    <div class="app-header__actions">
      <el-tooltip :content="layoutStore.isDark ? '切换至浅色模式' : '切换至深色模式'">
        <el-button
          text
          circle
          class="app-header__theme"
          :disabled="layoutStore.isThemeTransitioning"
          :aria-label="layoutStore.isDark ? '切换至浅色模式' : '切换至深色模式'"
          @click="layoutStore.toggleDarkMode"
        >
          <el-icon :size="19">
            <Sunny v-if="layoutStore.isDark" />
            <Moon v-else />
          </el-icon>
        </el-button>
      </el-tooltip>

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
    </div>
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
.app-header__actions,
.app-header__user {
  display: flex;
  min-width: 0;
  align-items: center;
}

.app-header__actions {
  gap: 4px;
}

.app-header__toggle {
  width: 40px;
  height: 40px;
}

.app-header__theme {
  width: 36px;
  height: 36px;
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
