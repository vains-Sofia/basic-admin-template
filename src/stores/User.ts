import { type Ref, ref } from 'vue'
import router from '@/router'
import { defineStore } from 'pinia'
import { lastRouters, staticRoutes } from '@/router/modules'
import { normalizeRoutes, transformMenuToRoutes } from '@/router/transform'
import { formLogin } from '@/api/login/login.ts'
import { getAsyncRoutes } from '@/api/system/Permission.ts'
import { loginUserinfo } from '@/api/system/User.ts'
import type { OAuth2TokenResult } from '@/api/types/LoginTypes.ts'

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

		const accessToken: Ref<OAuth2TokenResult | undefined> = ref()

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
					if (routerList) {
						routers.value = routerList
					}
				} catch (error: any) {
					if (error.response?.status === 401) {
						router.push({ path: '/login' }).then(reset)
					}
					throw error
				}
			}

			if (!routers.value || routers.value.length === 0) {
				isRouterInitialized.value = true
				// 添加最后的路由(404)
				lastRouters.forEach((route) => router.addRoute(route))
				return
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
			return new Promise((resolve, reject) => {
				switch (type) {
					case 'account':
					case 'email':
					case 'qr-code':
						formLogin(type, data)
							.then((res) => {
								if ((res as any)['code'] === 401) {
									ElMessage({
										showClose: true,
										message: (res as any)['message'] || '登录失败',
										type: 'error',
									})
									reject(res)
									return
								}
								if (res.expires_in && res.expires_in > 0) {
									// 过期时长转为具体的过期时间
									res.expires_in = Date.now() + res.expires_in * 1000
								}
								accessToken.value = res
								localStorage.setItem(
									'token',
									`${res.token_type} ${res.access_token}`,
								)
								loginUserinfo()
									.then((userResult) => {
										setupUser(userResult)
										resolve(true)
									})
									.catch(reject)
							})
							.catch(reject)
						break
					default:
						reject(new Error(`无对应类型: ${type}`))
						break
				}
			})
		}

		// 登出
		function logout() {
			router.push({ path: '/login' }).then(() => {
				picture.value = logo
				username.value = ''
				nickname.value = ''
				routers.value = []
				isRouterInitialized.value = false
			})
		}

		function reset() {
			picture.value = logo
			nickname.value = ''
			routers.value = []
			accessToken.value = undefined
			localStorage.removeItem('token')
			isRouterInitialized.value = false
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
