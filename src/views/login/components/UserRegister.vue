<script setup lang="ts">
import { reactive, ref } from 'vue'
import VerifyCodeInput from '@/components/VerifyCodeInput'
import type { FormInstance, FormRules } from 'element-plus'

// 注册表单dom
const registerFormRef = ref<FormInstance>()

// 注册表单数据
const registerForm = reactive({
	email: '',
	captcha: '',
	nickname: '',
	username: '',
	password: '',
	repeatPassword: '',
})

// 表单验证
const rules = reactive<FormRules<typeof registerForm>>({
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
	nickname: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
	username: [{ required: true, message: '用户账号不能为空', trigger: 'blur' }],
	password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }],
	repeatPassword: [
		{ required: true, message: '确认密码不能为空', trigger: 'blur' },
		{
			validator: (rule, value, callback) => {
				if (value !== registerForm.password) {
					callback(new Error('两次密码不一致'))
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
})

// 是否加载中
const loading = ref(false)

// 请求验证码
const requestCaptcha = async () => {
	return new Promise<void>((resolve, reject) => {
		registerFormRef.value?.validateField('email', (isValid, error: any) => {
			if (isValid) {
				setTimeout(resolve, 1000)
			} else {
				reject(error['email'][0].message)
			}
		})
	})
}

const emits = defineEmits<{ back: [] }>()
</script>

<template>
	<el-form
		ref="registerFormRef"
		:model="registerForm"
		:rules="rules"
		label-width="auto"
		class="login-form"
	>
		<el-form-item
			prop="nickname"
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.1s' }"
		>
			<el-input v-model="registerForm.nickname" clearable placeholder="用户昵称">
				<template #prefix>
					<el-icon class="el-input__icon">
						<Icon icon="ep:user" />
					</el-icon>
				</template>
			</el-input>
		</el-form-item>

		<el-form-item
			prop="username"
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.15s' }"
		>
			<el-input v-model="registerForm.username" clearable placeholder="用户账号">
				<template #prefix>
					<el-icon class="el-input__icon">
						<Icon icon="ep:user" />
					</el-icon>
				</template>
			</el-input>
		</el-form-item>

		<el-form-item
			prop="email"
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.2s' }"
		>
			<el-input
				clearable
				size="large"
				v-model="registerForm.email"
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
			:style="{ animationDelay: '0.25s' }"
		>
			<VerifyCodeInput
				v-model="registerForm.captcha"
				placeholder="请输入验证码"
				:buttonText="'获取验证码'"
				:countdownSeconds="60"
				size="large"
				:request-fn="requestCaptcha"
			/>
		</el-form-item>

		<el-form-item
			prop="password"
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.3s' }"
		>
			<el-input
				clearable
				size="large"
				v-model="registerForm.password"
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
			prop="repeatPassword"
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.35s' }"
		>
			<el-input
				clearable
				size="large"
				v-model="registerForm.repeatPassword"
				show-password
				type="password"
				placeholder="请确认密码"
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
			class="mt-8 animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.4s' }"
		>
			<el-button size="large" type="primary" class="w-full" :loading="loading">
				注册
			</el-button>
		</el-form-item>

		<el-form-item
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.45s' }"
		>
			<el-button plain class="w-full" size="large" @click="() => emits('back')">
				返回
			</el-button>
		</el-form-item>
	</el-form>
</template>

<style scoped></style>
