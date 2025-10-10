<template>
	<el-form
		ref="loginFormRef"
		:model="loginForm"
		:rules="rules"
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
				@click="login"
				:loading="loading"
				>登录</el-button
			>
		</el-form-item>
		<el-form-item
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.3s' }"
		>
			<el-button
				plain
				size="large"
				class="login-button"
				@click="() => emits('back')"
			>
				返回
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/User'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { menuData } from '@/components/Layout/Sidebar/menuData'
import router from '@/router'

// 记住我
const rememberMe = ref(false)

// 登录表单
const loginForm = reactive({
	username: '',
	password: '',
})

// 是否加载中
const loading = ref(false)

// 表单实例
const loginFormRef = ref<FormInstance>()

const userStore = useUserStore()
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
					nickname: '云逸1111111111111111',
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
	username: [
		{
			required: true,
			message: '请输入账号',
			trigger: 'blur',
		},
	],
	password: [
		{
			required: true,
			message: '请输入密码',
			trigger: 'blur',
		},
	],
})

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
