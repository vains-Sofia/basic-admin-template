import { ref } from 'vue'
import router from '@/router'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { lastRouters, staticRoutes } from '@/router/modules'
import { normalizeRoutes, transformMenuToRoutes } from '@/router/transform'

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

		const route = useRoute()

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

		// 登录
		function login(type: string, data: any) {
			console.log(route.query)
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					switch (type) {
						case 'account':
						case 'email':
						case 'qrcode':
							console.log(type, data)
							resolve(true)
							break
						default:
							reject(new Error(`无对应类型: ${type}`))
							break
					}
				}, 500)
			})
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
			login,
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
