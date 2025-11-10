<template>
	<el-form
		ref="loginFormRef"
		:model="loginForm"
		:rules="emailRules"
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
				@click="onLogin"
				:loading="loading"
				>登录</el-button
			>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useLogin } from '@/views/login/utils/hooks'
import VerifyCodeInput from '@/components/VerifyCodeInput'
import type { FormInstance } from 'element-plus'
import { emailRules } from '@/views/login/utils/Rules'

// 登录表单
const loginForm = reactive({
	email: '',
	captcha: '',
})

// 表单实例
const loginFormRef = ref<FormInstance>()

const { onLogin, loading } = useLogin(loginFormRef, loginForm, 'email')

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
</script>

<style scoped>
.login-button {
	width: 100%;
}
</style>
