import type { RouteRecordRaw } from 'vue-router'

export default [
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: () => import('@/views/error/404.vue'),
		meta: { title: '404' },
	}
] as RouteRecordRaw[]
