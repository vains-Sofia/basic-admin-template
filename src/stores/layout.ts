import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const DARK_CLASS_NAME = 'dark'
const DARK_MODE_QUERY = '(prefers-color-scheme: dark)'
const THEME_TRANSITION_ATTRIBUTE = 'data-theme-transition'

function getPreferredDarkMode(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(DARK_MODE_QUERY).matches
  )
}

function applyDarkMode(enabled: boolean): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle(DARK_CLASS_NAME, enabled)
}

function shouldAnimateThemeChange(event?: MouseEvent): event is MouseEvent {
  return Boolean(
    event &&
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )
}

export const useLayoutStore = defineStore(
  'layout',
  () => {
    const sidebarCollapsed = ref(false)
    const mobileSidebarOpened = ref(false)
    const isDark = ref(getPreferredDarkMode())
    const isThemeTransitioning = ref(false)

    watch(isDark, applyDarkMode, { immediate: true, flush: 'sync' })

    function setSidebarCollapsed(collapsed: boolean): void {
      sidebarCollapsed.value = collapsed
    }

    function toggleSidebar(): void {
      setSidebarCollapsed(!sidebarCollapsed.value)
    }

    function setMobileSidebar(opened: boolean): void {
      mobileSidebarOpened.value = opened
    }

    function toggleMobileSidebar(): void {
      setMobileSidebar(!mobileSidebarOpened.value)
    }

    function setDarkMode(enabled: boolean): void {
      isDark.value = enabled
    }

    function toggleDarkMode(event?: MouseEvent): void {
      if (isThemeTransitioning.value) return

      if (!shouldAnimateThemeChange(event)) {
        setDarkMode(!isDark.value)
        return
      }

      const targetDarkMode = !isDark.value
      const { clientX, clientY } = event

      const radius = Math.hypot(
        Math.max(clientX, window.innerWidth - clientX),
        Math.max(clientY, window.innerHeight - clientY),
      )
      const root = document.documentElement

      root.setAttribute(THEME_TRANSITION_ATTRIBUTE, targetDarkMode ? 'to-dark' : 'to-light')
      root.style.setProperty('--theme-transition-x', `${clientX}px`)
      root.style.setProperty('--theme-transition-y', `${clientY}px`)
      root.style.setProperty('--theme-transition-radius', `${radius}px`)
      isThemeTransitioning.value = true

      let transition: ViewTransition
      try {
        transition = document.startViewTransition(() => {
          setDarkMode(targetDarkMode)
        })
      } catch {
        clearThemeTransition(root)
        setDarkMode(targetDarkMode)
        return
      }

      void transition.finished.catch(() => undefined).finally(() => clearThemeTransition(root))
    }

    function clearThemeTransition(root: HTMLElement): void {
      root.removeAttribute(THEME_TRANSITION_ATTRIBUTE)
      root.style.removeProperty('--theme-transition-x')
      root.style.removeProperty('--theme-transition-y')
      root.style.removeProperty('--theme-transition-radius')
      isThemeTransitioning.value = false
    }

    return {
      sidebarCollapsed,
      mobileSidebarOpened,
      isDark,
      isThemeTransitioning,
      setSidebarCollapsed,
      toggleSidebar,
      setMobileSidebar,
      toggleMobileSidebar,
      setDarkMode,
      toggleDarkMode,
    }
  },
  {
    persist: {
      key: 'admin-app',
      pick: ['sidebarCollapsed', 'isDark'],
    },
  },
)
