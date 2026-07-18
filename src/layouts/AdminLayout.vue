<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/components/Layout/AppHeader'
import AppSidebar from '@/components/Layout/AppSidebar'
import TagsView from '@/components/Layout/TagsView'
import { useLayoutStore } from '@/stores/layout'
import { useTagsViewStore } from '@/stores/tags-view'
import { useUserStore } from '@/stores/user'

const MOBILE_QUERY = '(max-width: 991px)'
const layoutStore = useLayoutStore()
const tagsStore = useTagsViewStore()
const userStore = useUserStore()
const router = useRouter()
const isMobile = ref(false)
let mediaQuery: MediaQueryList | undefined

function updateDevice(event: MediaQueryListEvent | MediaQueryList): void {
  isMobile.value = event.matches
  if (!event.matches) layoutStore.setMobileSidebar(false)
}

function toggleSidebar(): void {
  if (isMobile.value) layoutStore.toggleMobileSidebar()
  else layoutStore.toggleSidebar()
}

async function logout(): Promise<void> {
  await userStore.signOut()
  await router.replace('/login')
}

onMounted(() => {
  mediaQuery = window.matchMedia(MOBILE_QUERY)
  updateDevice(mediaQuery)
  mediaQuery.addEventListener('change', updateDevice)
})

onBeforeUnmount(() => mediaQuery?.removeEventListener('change', updateDevice))
</script>

<template>
  <div class="admin-layout">
    <aside
      v-if="!isMobile"
      :class="['admin-layout__aside', { 'is-collapsed': layoutStore.sidebarCollapsed }]"
    >
      <AppSidebar :collapsed="layoutStore.sidebarCollapsed" />
    </aside>

    <el-drawer
      v-else
      v-model="layoutStore.mobileSidebarOpened"
      class="admin-layout__drawer"
      direction="ltr"
      :show-close="false"
      size="224px"
      :with-header="false"
    >
      <AppSidebar @navigate="layoutStore.setMobileSidebar(false)" />
    </el-drawer>

    <section class="admin-layout__body">
      <AppHeader :mobile="isMobile" @toggle="toggleSidebar" @logout="logout" />
      <TagsView />
      <main class="admin-layout__content">
        <el-scrollbar class="admin-layout__scrollbar">
          <div class="admin-layout__content-inner">
            <RouterView v-slot="{ Component, route }">
              <KeepAlive :include="tagsStore.cachedViewNames">
                <component :is="Component" :key="String(route.name)" />
              </KeepAlive>
            </RouterView>
          </div>
        </el-scrollbar>
      </main>
    </section>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  min-width: 0;
  min-height: 100vh;
  overflow: hidden;
  background: var(--app-page-background);
}

.admin-layout__aside {
  z-index: 10;
  width: var(--app-sidebar-width);
  flex: 0 0 var(--app-sidebar-width);
  border-right: 1px solid var(--el-border-color-light);
  transition:
    width 0.2s,
    flex-basis 0.2s;
}

.admin-layout__aside.is-collapsed {
  width: var(--app-sidebar-collapsed-width);
  flex-basis: var(--app-sidebar-collapsed-width);
}

.admin-layout__body {
  display: flex;
  height: 100vh;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  flex: 1;
}

.admin-layout__content {
  --basic-table-viewport-bottom-gap: var(--app-content-padding);

  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.admin-layout__scrollbar {
  height: 100%;
}

.admin-layout__content-inner {
  min-height: 100%;
  padding: var(--app-content-padding);
}

:global(.admin-layout__drawer .el-drawer__body) {
  padding: 0;
}
</style>
