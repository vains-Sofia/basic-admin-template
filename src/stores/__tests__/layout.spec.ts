// @vitest-environment jsdom

import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useLayoutStore } from '@/stores/layout'

function mockMatchMedia(matches = false): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  )
}

describe('layout store', () => {
  beforeEach(() => {
    mockMatchMedia()
    document.documentElement.classList.remove('dark')
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(document, 'startViewTransition')
    document.documentElement.removeAttribute('data-theme-transition')
    document.documentElement.removeAttribute('style')
    document.documentElement.classList.remove('dark')
  })

  it('manages the desktop sidebar and mobile drawer independently', () => {
    const store = useLayoutStore()

    store.toggleSidebar()
    store.toggleMobileSidebar()

    expect(store.sidebarCollapsed).toBe(true)
    expect(store.mobileSidebarOpened).toBe(true)

    store.setSidebarCollapsed(false)
    store.setMobileSidebar(false)

    expect(store.sidebarCollapsed).toBe(false)
    expect(store.mobileSidebarOpened).toBe(false)
  })

  it('synchronizes dark mode with the document root without animation', () => {
    const store = useLayoutStore()

    store.setDarkMode(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    store.toggleDarkMode()
    expect(store.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('reveals dark mode from the pointer position with a view transition', async () => {
    let finishTransition = (): void => undefined
    const finished = new Promise<void>((resolve) => {
      finishTransition = resolve
    })
    const startViewTransition = vi.fn((callback: () => void) => {
      callback()
      return { finished }
    })
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: startViewTransition,
    })
    const store = useLayoutStore()

    store.toggleDarkMode(new MouseEvent('click', { clientX: 120, clientY: 80 }))

    await vi.waitFor(() => expect(store.isDark).toBe(true))
    expect(store.isDark).toBe(true)
    expect(startViewTransition).toHaveBeenCalledOnce()
    expect(store.isThemeTransitioning).toBe(true)
    expect(document.documentElement.dataset.themeTransition).toBe('to-dark')
    expect(document.documentElement.style.getPropertyValue('--theme-transition-radius')).toBe(
      `${Math.hypot(
        Math.max(120, window.innerWidth - 120),
        Math.max(80, window.innerHeight - 80),
      )}px`,
    )

    store.toggleDarkMode(new MouseEvent('click', { clientX: 200, clientY: 100 }))
    expect(startViewTransition).toHaveBeenCalledOnce()

    finishTransition()
    await vi.waitFor(() => expect(store.isThemeTransitioning).toBe(false))
    expect(document.documentElement.hasAttribute('data-theme-transition')).toBe(false)
  })

  it('expands light mode outwards from the pointer position', async () => {
    const startViewTransition = vi.fn((callback: () => void) => {
      callback()
      return { finished: Promise.resolve() }
    })
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: startViewTransition,
    })
    const store = useLayoutStore()
    store.setDarkMode(true)

    store.toggleDarkMode(new MouseEvent('click', { clientX: 120, clientY: 80 }))

    await vi.waitFor(() => expect(store.isDark).toBe(false))
    expect(store.isDark).toBe(false)
    expect(startViewTransition).toHaveBeenCalledOnce()
  })
})
