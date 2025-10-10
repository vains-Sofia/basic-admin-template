<template>
	<div class="login-page">
		<div class="login-bar">
			<Logo />
			<div>
				<el-icon :size="18" class="cursor-pointer" @click="layoutStore.toggleDark">
					<Icon v-if="layoutStore.isDark" icon="ep:sunny" color="#FCD34D" />
					<Icon v-else icon="ep:moon" color="#374151" />
				</el-icon>
			</div>
		</div>
		<div class="login-wrapper">
			<div class="login-container">
				<div
					class="font-bold text-3xl text-center mb-4 pb-5"
					style="color: var(--el-text-color)"
				>
					Welcome
				</div>

				<!-- 邮件登录 -->
				<EmailLogin v-if="loginType === 'email'" />

				<!-- 账号登录 -->
				<AccountLogin v-if="loginType === 'account'" @back="() => (loginType = 'email')" />

				<!-- 二维码登录 -->
				<QrCodeLogin v-if="loginType === 'qrcode'" @back="() => (loginType = 'email')" />

				<!-- 用户注册 -->
				<UserRegister v-if="loginType === 'register'" @back="() => (loginType = 'email')" />

				<div v-if="loginType === 'email'">
					<!-- 其它类型登录 -->
					<el-form-item
						class="other-login animate__animated animate__fadeInUp"
						:style="{ animationDelay: '0.25s' }"
					>
						<el-button @click="loginType = 'account'" class="other-login-button" plain>
							账号登录
						</el-button>
						<el-button class="other-login-button" @click="loginType = 'qrcode'" plain
							>扫码登录</el-button
						>
						<el-button class="other-login-button" @click="loginType = 'register'" plain
							>注册</el-button
						>
					</el-form-item>

					<!-- 三方登录方式 -->
					<el-form-item
						class="third-party-login animate__animated animate__fadeInUp"
						:style="{ animationDelay: '0.3s' }"
					>
						<el-divider style="margin: 10px">
							<span
								style="
									color: var(--el-text-color-regular);
									font-size: var(--el-font-size-extra-small);
								"
							>
								其它登录方式
							</span>
						</el-divider>
						<el-tooltip
							v-for="third in thirdPartyLogins"
							:key="third.provider"
							:content="third.tooltip"
							placement="top"
						>
							<el-icon
								:color="third.color"
								@click="() => console.log('third', third.provider)"
							>
								<Icon :icon="third.icon" />
							</el-icon>
						</el-tooltip>
					</el-form-item>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Logo } from '@/components/Layout'
import { useLayoutStore } from '@/stores/Layout'
import EmailLogin from './components/EmailLogin.vue'
import AccountLogin from './components/AccountLogin.vue'
import QrCodeLogin from '@/views/login/components/QrCodeLogin.vue'
import UserRegister from '@/views/login/components/UserRegister.vue'

const layoutStore = useLayoutStore()

// 登录方式
const loginType = ref('email')

// 三方登录信息
const thirdPartyLogins = computed(() => [
	{
		icon: 'simple-icons:wechat',
		color: '#07C160',
		provider: 'wechat',
		tooltip: '微信',
	},
	{
		icon: 'simple-icons:github',
		color: layoutStore.isDark ? '#FFFFFF' : '#181717',
		provider: 'github',
		tooltip: 'Github',
	},
	{
		icon: 'simple-icons:gitee',
		color: '#C71D23',
		provider: 'gitee',
		tooltip: 'Gitee',
	},
])
</script>

<style scoped>
.login-bar {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	background: transparent;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-right: 20px;
}

.login-bar div {
	color: var(--el-text-color);
	background-color: transparent;
	border-right: none;
}

.dark .login-page {
	background: var(--el-bg-color-page);
}

.login-page {
	margin: 0;
	height: 100%;
	display: flex;
	overflow: hidden;
	align-items: center;
	justify-content: center;

	/* 关键：浅蓝色渐变背景 */
	background: radial-gradient(
		circle at 70% 30%,
		#d7e9fc 0%,
		/* 中心浅蓝 */ #f5f8fb 100% /* 外圈更浅 */
	);
}

.login-wrapper {
	width: 550px;
	border-radius: 10px;
	background: var(--el-bg-color);
}

/* ============ 手机：0–767px ============ */
@media screen and (max-width: 767px) {
	.login-wrapper {
		width: 100%;
		height: 100%;
		margin: auto;
		border-radius: 0;
		padding-top: 30%;
	}
}

.login-container {
	width: 100%;
	padding: 8% 8%;
	box-sizing: border-box;
}

.other-login-button {
	width: 30%;
}

.other-login ::v-deep(.el-form-item__content) {
	justify-content: space-between;
}

.third-party-login ::v-deep(.el-form-item__content) {
	gap: 20px;
	cursor: pointer;
	justify-content: center;
	font-size: var(--el-font-size-extra-large);
}
</style>
