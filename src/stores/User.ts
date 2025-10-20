import { ref } from 'vue'
import router from '@/router'
import { defineStore } from 'pinia'
import { staticRoutes } from '@/router/modules/default.ts'
import { transformMenuToRoutes } from '@/router/transform.ts'
import { lastRouters } from '@/router/modules/lastRouters.ts'

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
		const routers = ref()

		// 路由是否被初始化
		const isRouterInitialized = ref(false)

		// 设置用户基础信息
		function setupUser(userinfo: any) {
			console.log(userinfo)
			if (userinfo.picture) {
				picture.value = userinfo.picture
			}
			username.value = userinfo.username
			nickname.value = userinfo.nickname
		}

		// 设置用户菜单
		function setupRouters(routerTree: any) {
			routers.value = routerTree
		}

		function getRouters() {
			return [...staticRoutes, ...routers.value]
		}

		// 初始化Router
		function initRouter() {
			// 初始化过跳出
			if (isRouterInitialized.value) {
				return
			}

			if (!routers.value) {
				logout()
			}

			// 将组件从字符串转为实际的Vue组件
			const dynamicRoutes = transformMenuToRoutes(routers.value)

			// 将所有路由都挂在 Home 路由下，这样所有路由都会有 Index 组件
			dynamicRoutes.forEach((route: any) => {
				router.addRoute('Home', route)
			})

			// 添加最后的路由(404)
			lastRouters.forEach(route => router.addRoute(route))

			isRouterInitialized.value = true
		}

		// 登出
		function logout() {
			router.push({ path: '/login' }).then(() => {
				console.log(logo)
				picture.value = logo
				username.value = ''
				nickname.value = ''
				routers.value = []
				isRouterInitialized.value = false
			})
		}

		return {
			logout,
			routers,
			picture,
			username,
			nickname,
			setupUser,
			getRouters,
			initRouter,
			setupRouters,
			isRouterInitialized,
		}
	},
	{
		persistedState: {
			excludePaths: ['isRouterInitialized'],
		},
	},
)
