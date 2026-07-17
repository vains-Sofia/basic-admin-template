import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/system',
  name: 'System',
  redirect: '/system/users',
  meta: {
    title: '系统管理',
    icon: 'Setting',
    order: 20,
    requiresAuth: true,
    roles: ['admin'],
  },
  children: [
    {
      path: 'users',
      name: 'SystemUsers',
      component: () => import('@/views/system/user/index.vue'),
      meta: {
        title: '用户管理',
        icon: 'User',
        order: 10,
        requiresAuth: true,
        roles: ['admin'],
        permissions: ['system:user:view'],
        keepAlive: true,
      },
    },
  ],
} satisfies RouteRecordRaw
