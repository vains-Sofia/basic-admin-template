import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

import { loadDynamicRoutes } from '@/router/dynamic'
import { getStaticRoutes } from '@/router/routes'
import { hasPermission, hasRole } from '@/utils/permission'

function filterRoutes(
  routes: RouteRecordRaw[],
  roles: string[],
  permissions: string[],
): RouteRecordRaw[] {
  return routes.flatMap((route) => {
    if (
      !hasRole(route.meta?.roles, roles) ||
      (route.meta?.permissions?.length && !hasPermission(route.meta.permissions, permissions))
    ) {
      return []
    }

    const children = route.children ? filterRoutes(route.children, roles, permissions) : undefined
    if (route.children?.length && !children?.length) return []
    return [{ ...route, children } as RouteRecordRaw]
  })
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const ready = ref(false)

  async function build(roles: string[], permissions: string[]): Promise<RouteRecordRaw[]> {
    const dynamicRoutes = await loadDynamicRoutes({ roles, permissions })
    routes.value = filterRoutes([...getStaticRoutes(), ...dynamicRoutes], roles, permissions)
    ready.value = true
    return routes.value
  }

  function reset(): void {
    routes.value = []
    ready.value = false
  }

  return { routes, ready, build, reset }
})
