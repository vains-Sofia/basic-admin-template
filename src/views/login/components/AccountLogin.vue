<template>
	<el-form
		ref="loginFormRef"
		:model="loginForm"
		:rules="accountRules"
		label-width="auto"
		class="login-form"
	>
		<el-form-item
			prop="username"
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.1s' }"
		>
			<el-input
				clearable
				size="large"
				v-model="loginForm.username"
				type="text"
				autocomplete="off"
				placeholder="请输入账号"
			>
				<template #prefix>
					<el-icon class="el-input__icon">
						<Icon icon="ep:user" />
					</el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item
			prop="password"
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.15s' }"
		>
			<el-input
				clearable
				size="large"
				v-model="loginForm.password"
				show-password
				type="password"
				placeholder="请输入密码"
				autocomplete="off"
			>
				<template #prefix>
					<el-icon class="el-input__icon">
						<Icon icon="ep:lock" />
					</el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item
			class="remember-me animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.2s' }"
		>
			<el-checkbox label="记住密码" :value="rememberMe" />
			<el-link underline="never" type="primary">忘记密码?</el-link>
		</el-form-item>
		<el-form-item
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.25s' }"
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
		<el-form-item
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.3s' }"
		>
			<el-button plain size="large" class="login-button" @click="() => emits('back')">
				返回
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useLogin } from '../utils/hooks'
import type { FormInstance } from 'element-plus'
import { accountRules } from '@/views/login/utils/Rules'

// 记住我
const rememberMe = ref(false)

// 登录表单
const loginForm = reactive({
	username: '',
	password: '',
})

// 表单实例
const loginFormRef = ref<FormInstance>()

const { onLogin, loading } = useLogin(loginFormRef, loginForm, 'account')

const emits = defineEmits<{ back: [] }>()
</script>

<style scoped>
.login-button {
	width: 100%;
}

.remember-me ::v-deep(.el-form-item__content) {
	margin-top: -10px;
	justify-content: space-between;
}
</style>
