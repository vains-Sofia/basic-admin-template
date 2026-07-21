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
    {
      path: 'cropper',
      name: 'ImageCropperExamples',
      component: () => import('@/views/examples/cropper/index.vue'),
      meta: {
        title: '图片裁剪示例',
        icon: 'Picture',
        order: 40,
        requiresAuth: true,
        keepAlive: true,
      },
    },
    {
      path: 'feedback',
      name: 'FeedbackExamples',
      component: () => import('@/views/examples/feedback/index.vue'),
      meta: {
        title: '反馈状态示例',
        icon: 'Warning',
        order: 50,
        requiresAuth: true,
        keepAlive: true,
      },
    },
    {
      path: 'form',
      name: 'FormExamples',
      component: () => import('@/views/examples/form/index.vue'),
      meta: {
        title: '表单示例',
        icon: 'EditPen',
        order: 60,
        requiresAuth: true,
        keepAlive: true,
      },
    },
    {
      path: 'search-form',
      name: 'SearchFormExamples',
      component: () => import('@/views/examples/search-form/index.vue'),
      meta: {
        title: '查询表单示例',
        icon: 'Search',
        order: 70,
        requiresAuth: true,
        keepAlive: true,
      },
    },
  ],
} satisfies RouteRecordRaw
