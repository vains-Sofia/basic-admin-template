import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore(
  'app',
  () => {
    const sidebarCollapsed = ref(false)
    const mobileSidebarOpened = ref(false)

    function toggleSidebar(): void {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setMobileSidebar(opened: boolean): void {
      mobileSidebarOpened.value = opened
    }

    return { sidebarCollapsed, mobileSidebarOpened, toggleSidebar, setMobileSidebar }
  },
  { persist: { key: 'admin-app', pick: ['sidebarCollapsed'] } },
)
