import type { RouteRecordRaw } from 'vue-router'

export const lastRouters: RouteRecordRaw[] = [
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: () => import('@/views/error/404.vue'),
		meta: { title: '404' },
	}
]
