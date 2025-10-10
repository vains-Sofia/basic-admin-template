import { useUserStore } from '@/stores/User.ts'
import { staticRoutes } from '@/router/modules/default'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

// 根据环境变量获取路由模式
const routerMode = import.meta.env.VITE_ROUTER_MODE || 'history'

// 根据路由模式创建对应的 history 对象
const history =
	routerMode === 'hash'
		? createWebHashHistory(import.meta.env.VITE_BASE_PATH)
		: createWebHistory(import.meta.env.VITE_BASE_PATH)

const router = createRouter({
	history,
	// routes: [
	// 	{
	// 		path: '/test',
	// 		component: () => import('@/components/Index/index.vue'),
	// 		meta: {
	// 			title: '布局'
	// 		},
	// 		children: [
	// 			{
	// 				path: 'layout',
	// 				name: 'layout',
	// 				component: () => import('@/views/test/TestLayout.vue'),
	// 				meta: {
	// 					title: '功能测试'
	// 				}
	// 			}
	// 		]
	// 	}
	// ],
	routes: staticRoutes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
	const userStore = useUserStore()

	// 如果未登录，跳转到登录页
	if (to.path === '/login') {
		next()
		return
	}

	// 登录后，且还未添加动态路由 → 添加
	if (!userStore.isRouterInitialized && userStore.routers) {
		userStore.initRouter()
		next({ ...to, replace: true })
		return
	}

	if (!userStore.routers) {
		next({ path: '/login', replace: true })
		return
	}

	next()
})

export default router
