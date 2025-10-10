<template>
	<el-form
		ref="loginFormRef"
		:model="loginForm"
		:rules="rules"
		label-width="auto"
		class="login-form"
	>
		<el-form-item
			prop="email"
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.1s' }"
		>
			<el-input
				clearable
				size="large"
				v-model="loginForm.email"
				type="text"
				autocomplete="off"
				placeholder="请输入电子邮箱"
			>
				<template #prefix>
					<el-icon class="el-input__icon">
						<Icon icon="simple-icons:protonmail" />
					</el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item
			prop="captcha"
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.15s' }"
		>
			<VerifyCodeInput
				v-model="loginForm.captcha"
				placeholder="请输入验证码"
				:buttonText="'获取验证码'"
				:countdownSeconds="60"
				size="large"
				:request-fn="requestCaptcha"
			/>
		</el-form-item>
		<el-form-item
			class="mt-8 animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.2s' }"
		>
			<el-button
				size="large"
				type="primary"
				class="login-button"
				@click="login"
				:loading="loading"
				>登录</el-button
			>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/User'
import VerifyCodeInput from '@/components/VerifyCodeInput'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { menuData } from '@/components/Layout/Sidebar/menuData'
import router from '@/router'

// 登录表单
const loginForm = reactive({
	email: '',
	captcha: '',
})

// 是否加载中
const loading = ref(false)

// 表单实例
const loginFormRef = ref<FormInstance>()

const userStore = useUserStore()

// 请求验证码
const requestCaptcha = async () => {
	return new Promise<void>((resolve, reject) => {
		loginFormRef.value?.validateField('email', (isValid, error: any) => {
			if (isValid) {
				setTimeout(resolve, 1000)
			} else {
				reject(error['email'][0].message)
			}
		})
	})
}

// 登录
const login = () => {
	if (!loginFormRef.value) return
	loginFormRef.value.validate((valid) => {
		if (valid) {
			console.log('loginForm', loginForm)
			loading.value = true
			setTimeout(() => {
				userStore.setupRouters(menuData)
				userStore.initRouter()
				userStore.setupUser({
					username: 'admin',
					nickname: '云逸-e',
				})
				loading.value = false
				router.replace({ name: 'Dashboard' })
			}, 500)
		}
	})
}

onMounted(() => {
	window.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			login()
		}
	})
})

onUnmounted(() => {
	window.removeEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			login()
		}
	})
})

const rules = reactive<FormRules<typeof loginForm>>({
	email: [
		{
			required: true,
			message: '请输入电子邮箱',
			trigger: 'blur',
		},
	],
	captcha: [
		{
			required: true,
			message: '请输入验证',
			trigger: 'blur',
		},
	],
})
</script>

<style scoped>
.login-button {
	width: 100%;
}
</style>
