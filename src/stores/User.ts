import { ref } from 'vue'
import router from '@/router'
import { defineStore } from 'pinia'
import { lastRouters, staticRoutes } from '@/router/modules'
import { normalizeRoutes, transformMenuToRoutes } from '@/router/transform'
import { getAsyncRoutes } from '@/api/system/Permission.ts'
import type { DynamicRouter } from '@/api/types/PermissionTypes.ts'

const logo = new URL(`../assets/logo.png`, import.meta.url).href

export const useUserStore = defineStore(
	'User',
	() => {
		// 头像
		const picture = ref(logo)

		// 账号
		const username = ref('')

		// 昵称
		const nickname = ref('')

		// 拥有的菜单
		const routers = ref([] as Array<DynamicRouter>)

		// 路由是否被初始化
		const isRouterInitialized = ref(false)

		// 设置用户基础信息
		function setupUser(userinfo: any) {
			if (userinfo.picture) {
				picture.value = userinfo.picture
			}
			username.value = userinfo.username
			nickname.value = userinfo.nickname
		}

		async function getRouters() {
			if (routers.value && routers.value.length > 0) {
				// 将子路由的绝对路径转为相对路径
				return normalizeRoutes([...staticRoutes, ...routers.value, ...lastRouters])
			}

			try {
				const routerList = await getAsyncRoutes()
				if (routerList) {
					routers.value = routerList
					return normalizeRoutes([...staticRoutes, ...routers.value, ...lastRouters])
				} else {
					return normalizeRoutes([...staticRoutes, ...lastRouters])
				}
			} catch (error: any) {
				if (error.response?.status === 401) {
					router.push({ path: '/login' }).then(reset)
				}
				console.error(error)
				return normalizeRoutes([...staticRoutes, ...lastRouters])
			}
		}

		// 初始化Router
		async function initRouter() {
			// 初始化过跳出
			if (isRouterInitialized.value) {
				return
			}

			if (!routers.value || routers.value.length === 0) {
				try {
					const routerList = await getAsyncRoutes()
					if (routerList && routerList.length > 0) {
						routers.value = routerList
					} else {
						console.log(isRouterInitialized.value)
						isRouterInitialized.value = true
						// 添加最后的路由(404)
						lastRouters.forEach((route) => router.addRoute(route))
						return
					}
				} catch (error: any) {
					if (error.response?.status === 401) {
						router.push({ path: '/login' }).then(reset)
					}
					throw error
				}
			}

			// 将组件从字符串转为实际的Vue组件
			const dynamicRoutes = transformMenuToRoutes(routers.value, true)
			// 将子路由的绝对路径转为相对路径
			const normalizedRoutes = normalizeRoutes(dynamicRoutes)

			// 添加路由
			normalizedRoutes.forEach((route: any) => {
				router.addRoute(route)
			})

			// 添加最后的路由(404)
			lastRouters.forEach((route) => router.addRoute(route))

			isRouterInitialized.value = true
		}

		function reset() {
			picture.value = logo
			username.value = ''
			nickname.value = ''
			routers.value = []
			isRouterInitialized.value = false
		}

		return {
			routers,
			picture,
			username,
			nickname,
			setupUser,
			getRouters,
			initRouter,
			isRouterInitialized,
		}
	},
	{
		persistedState: {
			excludePaths: ['isRouterInitialized'],
		},
	},
)
