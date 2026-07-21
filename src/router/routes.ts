import type { RouteRecordRaw } from 'vue-router'

import { DEFAULT_ROUTE } from '@/config/app'

type RouteModule = { default: RouteRecordRaw | RouteRecordRaw[] }

const routeModules = import.meta.glob<RouteModule>('./static/*.ts', { eager: true })

function sortRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes
    .map((route) => ({
      ...route,
      children: route.children ? sortRoutes(route.children) : undefined,
    }))
    .sort(
      (left, right) => (left.meta?.order ?? 999) - (right.meta?.order ?? 999),
    ) as RouteRecordRaw[]
}

export function getStaticRoutes(): RouteRecordRaw[] {
  const routes = Object.values(routeModules).flatMap((module) =>
    Array.isArray(module.default) ? module.default : [module.default],
  )
  return sortRoutes(routes)
}

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'LoginView',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/',
    name: 'Root',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: DEFAULT_ROUTE,
    meta: { requiresAuth: true },
    children: [],
  },
  {
    path: '/403',
    name: 'ForbiddenView',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '无权访问', hidden: true, requiresAuth: true },
  },
  {
    path: '/500',
    name: 'ServerErrorView',
    component: () => import('@/views/error/500.vue'),
    meta: { title: '服务异常', hidden: true, requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', hidden: true, requiresAuth: true },
  },
]
