import { ElMessage } from 'element-plus'
import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'

import { APP_TITLE, DEFAULT_ROUTE, LOGIN_ROUTE } from '@/config/app'
import { usePermissionStore } from '@/stores/permission'
import { useTagsViewStore } from '@/stores/tags-view'
import { useUserStore } from '@/stores/user'
import { hasPermission, hasRole } from '@/utils/permission'

import { installAccessRoutes } from './access'

export function setupRouterGuards(router: Router, pinia: Pinia): void {
  router.beforeEach(async (to) => {
    const userStore = useUserStore(pinia)
    const permissionStore = usePermissionStore(pinia)
    document.title = to.meta.title ? `${to.meta.title} - ${APP_TITLE}` : APP_TITLE

    const authenticated = Boolean(userStore.token && userStore.profile)

    if (to.path === LOGIN_ROUTE) return authenticated ? DEFAULT_ROUTE : true

    if (!authenticated) {
      return { path: LOGIN_ROUTE, query: { redirect: to.fullPath }, replace: true }
    }

    if (!permissionStore.ready) {
      try {
        const routes = await permissionStore.build(userStore.roles, userStore.permissions)
        installAccessRoutes(router, routes)
        if (
          permissionStore.isKnownRoute(to.path) &&
          !permissionStore.isAccessibleRoute(to.path)
        ) {
          return { path: '/403', replace: true }
        }
        return { path: to.fullPath, replace: true }
      } catch {
        await userStore.signOut(false)
        ElMessage.error('权限数据加载失败，请重新登录')
        return { path: LOGIN_ROUTE, replace: true }
      }
    }

    if (!to.meta.requiresAuth) return true
    if (!hasRole(to.meta.roles, userStore.roles)) return '/403'
    if (to.meta.permissions?.length && !hasPermission(to.meta.permissions, userStore.permissions)) {
      return '/403'
    }

    return true
  })

  router.afterEach((to) => {
    useTagsViewStore(pinia).add(to)
  })
}
