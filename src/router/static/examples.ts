import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/examples',
  name: 'ComponentExamples',
  redirect: '/examples/overlay',
  meta: {
    title: '组件示例',
    icon: 'Collection',
    order: 30,
    requiresAuth: true,
  },
  children: [
    {
      path: 'overlay',
      name: 'OverlayExamples',
      component: () => import('@/views/examples/overlay/index.vue'),
      meta: {
        title: '弹层示例',
        icon: 'CopyDocument',
        order: 10,
        requiresAuth: true,
        keepAlive: true,
      },
    },
    {
      path: 'table',
      name: 'TableExamples',
      component: () => import('@/views/examples/table/index.vue'),
      meta: {
        title: '表格示例',
        icon: 'Grid',
        order: 20,
        requiresAuth: true,
        keepAlive: true,
      },
    },
    {
      path: 'qrcode',
      name: 'QrCodeExamples',
      component: () => import('@/views/examples/qrcode/index.vue'),
      meta: {
        title: '二维码示例',
        icon: 'Iphone',
        order: 30,
        requiresAuth: true,
        keepAlive: true,
      },
    },
  ],
} satisfies RouteRecordRaw
