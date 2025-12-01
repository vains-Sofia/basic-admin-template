import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import router from '@/router'
import { useUserStore } from '@/stores/User'
import type { FormInstance } from 'element-plus'

export function useLogin(loginFormRef: Ref<FormInstance | undefined>, loginForm: any, loginType: string) {
	// 是否加载中
	const loading = ref(false)
	const userStore = useUserStore()

	const onLogin = () => {
		if (!loginFormRef.value) return
		loginFormRef.value.validate((valid) => {
			if (valid) {
				loading.value = true
				userStore
					.login(loginType, loginForm)
					.then(() => {
						userStore.initRouter()
						userStore.setupUser({
							username: 'admin',
							nickname: '云逸-e',
						})
						router.replace({ name: 'Dashboard' })
							.then(() => console.log('跳转首页'))
					})
					.finally(() => (loading.value = false))
			}
		})
	}

	const enterSubmit = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			onLogin()
		}
	}

	onMounted(() => {
		window.addEventListener('keydown', enterSubmit)
	})

	onUnmounted(() => {
		window.removeEventListener('keydown', enterSubmit)
	})

	return {
		onLogin,
		loading,
	}
}
