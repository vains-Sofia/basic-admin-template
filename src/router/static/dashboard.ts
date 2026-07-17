import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/dashboard',
  name: 'DashboardView',
  component: () => import('@/views/dashboard/index.vue'),
  meta: {
    title: '仪表盘',
    icon: 'Odometer',
    order: 10,
    requiresAuth: true,
    permissions: ['dashboard:view'],
    keepAlive: true,
    affix: true,
  },
} satisfies RouteRecordRaw
