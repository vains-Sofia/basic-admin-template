import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

import { loadDynamicRoutes } from '@/router/dynamic'
import { getStaticRoutes } from '@/router/routes'
import { hasPermission, hasRole } from '@/utils/permission'

function normalizePath(path: string): string {
  const normalized = `/${path}`.replace(/\/+/g, '/')
  if (normalized.length > 1 && normalized.endsWith('/')) return normalized.slice(0, -1)
  return normalized
}

function joinRoutePath(parentPath: string, routePath: string): string {
  if (!routePath) return normalizePath(parentPath)
  if (routePath.startsWith('/')) return normalizePath(routePath)
  return normalizePath(`${parentPath}/${routePath}`)
}

function routePathMatches(pattern: string, actualPath: string): boolean {
  const patternParts = normalizePath(pattern).split('/').filter(Boolean)
  const actualParts = normalizePath(actualPath).split('/').filter(Boolean)
  let actualIndex = 0

  for (const part of patternParts) {
    if (part === '*' || (part.startsWith(':') && part.includes('*'))) return true

    const optional = part.startsWith(':') && part.endsWith('?')
    const actualPart = actualParts[actualIndex]
    if (actualPart === undefined) {
      if (optional) continue
      return false
    }

    if (!part.startsWith(':') && part !== actualPart) return false
    actualIndex += 1
  }

  return actualIndex === actualParts.length
}

function hasMatchingRoute(
  routes: RouteRecordRaw[],
  path: string,
  parentPath = '',
): boolean {
  return routes.some((route) => {
    const fullPath = joinRoutePath(parentPath, route.path)
    return (
      routePathMatches(fullPath, path) ||
      (route.children ? hasMatchingRoute(route.children, path, fullPath) : false)
    )
  })
}

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
  const allRoutes = ref<RouteRecordRaw[]>([])
  const ready = ref(false)

  async function build(roles: string[], permissions: string[]): Promise<RouteRecordRaw[]> {
    const dynamicRoutes = await loadDynamicRoutes({ roles, permissions })
    allRoutes.value = [...getStaticRoutes(), ...dynamicRoutes]
    routes.value = filterRoutes(allRoutes.value, roles, permissions)
    ready.value = true
    return routes.value
  }

  function isKnownRoute(path: string): boolean {
    return hasMatchingRoute(allRoutes.value, path)
  }

  function isAccessibleRoute(path: string): boolean {
    return hasMatchingRoute(routes.value, path)
  }

  function reset(): void {
    routes.value = []
    allRoutes.value = []
    ready.value = false
  }

  return { routes, allRoutes, ready, build, isKnownRoute, isAccessibleRoute, reset }
})
