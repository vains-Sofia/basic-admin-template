// @vitest-environment jsdom

import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearAccessRoutes } from '@/router/access'
import { setupRouterGuards } from '@/router/guards'
import { constantRoutes } from '@/router/routes'
import { useUserStore } from '@/stores/user'

describe('router guards', () => {
  beforeEach(() => {
    document.title = ''
  })

  afterEach(clearAccessRoutes)

  afterEach(() => vi.unstubAllEnvs())

  it('sends a known but inaccessible route to 403', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createMemoryHistory(), routes: constantRoutes })
    const userStore = useUserStore(pinia)
    userStore.token = 'editor-token'
    userStore.profile = {
      id: 2,
      username: 'editor',
      displayName: 'Editor',
      roles: ['editor'],
      permissions: ['dashboard:view'],
    }
    setupRouterGuards(router, pinia)

    await router.push('/system/users')

    expect(router.currentRoute.value.name).toBe('ForbiddenView')
  })

  it('requires both a token and a user profile', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createMemoryHistory(), routes: constantRoutes })
    const userStore = useUserStore(pinia)
    userStore.token = 'orphan-token'
    userStore.profile = null
    setupRouterGuards(router, pinia)

    await router.push('/dashboard')

    expect(router.currentRoute.value.name).toBe('LoginView')
    expect(router.currentRoute.value.query.redirect).toBe('/dashboard')
  })

  it('allows the local login page when OAuth2 is enabled', async () => {
    vi.stubEnv('VITE_OAUTH2_ENABLED', 'true')
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createMemoryHistory(), routes: constantRoutes })
    setupRouterGuards(router, pinia)

    await router.push('/login')

    expect(router.currentRoute.value.name).toBe('LoginView')
  })

  it('allows the OAuth2 callback to replace the temporary local login token', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createMemoryHistory(), routes: constantRoutes })
    const userStore = useUserStore(pinia)
    userStore.token = 'temporary-login-token'
    userStore.profile = {
      id: 1,
      username: 'admin',
      displayName: 'Admin',
      roles: ['admin'],
      permissions: ['*'],
    }
    setupRouterGuards(router, pinia)

    await router.push('/oauth2/callback?code=code&state=state')

    expect(router.currentRoute.value.name).toBe('OAuth2CallbackView')
  })
})
