import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { setDynamicRouteLoader } from '@/router/dynamic'
import { usePermissionStore } from '@/stores/permission'

describe('permission store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  afterEach(() => setDynamicRouteLoader(async () => []))

  it('distinguishes known routes from accessible routes', async () => {
    const store = usePermissionStore()
    await store.build(['editor'], ['dashboard:view'])

    expect(store.isKnownRoute('/system/users')).toBe(true)
    expect(store.isAccessibleRoute('/system/users')).toBe(false)
    expect(store.isAccessibleRoute('/dashboard')).toBe(true)
  })

  it('matches parameterized dynamic routes', async () => {
    setDynamicRouteLoader(async () => [
      {
        path: '/reports/:reportId',
        name: 'ReportDetail',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { requiresAuth: true, permissions: ['report:view'] },
      },
    ])

    const store = usePermissionStore()
    await store.build(['editor'], ['report:view'])

    expect(store.isKnownRoute('/reports/2026')).toBe(true)
    expect(store.isAccessibleRoute('/reports/2026')).toBe(true)
  })
})
