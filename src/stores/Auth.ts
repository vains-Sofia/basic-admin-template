import { defineStore } from 'pinia'
import { type Ref, ref } from 'vue'
import type { OAuth2TokenResult } from '@/api/types/LoginTypes.ts'
import { formLogin, tokenLogout } from '@/api/login/login.ts'
import { loginUserinfo } from '@/api/system/User.ts'
import router from '@/router'
import { useUserStore } from '@/stores/User.ts'

const logo = new URL(`../assets/logo.png`, import.meta.url).href

export const useAuthStore = defineStore('Auth', () => {
	const accessToken: Ref<OAuth2TokenResult | undefined> = ref()

	const userStore = useUserStore()

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
							loginUserinfo()
								.then((userResult) => {
									userStore.setupUser(userResult)
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
		router.push({ path: '/login' }).then(() =>
			tokenLogout().finally(() => {
				ElMessage.success('退出登录成功.')
				userStore.picture = logo
				userStore.username = ''
				userStore.nickname = ''
				userStore.routers = []
				userStore.isRouterInitialized = false
			}),
		)
	}

	return {
		login,
		logout,
		accessToken,
	}
})
