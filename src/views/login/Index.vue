<template>
	<div>
		<div class="login-bar">
			<Logo />
			<div>
				<el-icon :size="18" class="cursor-pointer" @click="layoutStore.toggleDark">
					<Icon v-if="layoutStore.isDark" icon="ep:sunny" color="#FCD34D" />
					<Icon v-else icon="ep:moon" color="#374151" />
				</el-icon>
			</div>
		</div>
		<div class="login-page">
			<div class="animation-lottie-wrapper">
				<DotLottieVue loop autoplay class="animation-lottie" :src="lottieUrl" />
			</div>
			<div class="login-wrapper">
				<div class="login-container">
					<div
						v-if="showLogoText"
						class="mb-4 pb-5 bounce-text"
						style="color: var(--el-text-color); font-family: 'Playfair Display', serif"
					>
						<span v-for="(char, i) in logoTextArray" :key="i" :style="{ '--i': i }">
							{{ char }}
						</span>
					</div>

					<!-- 邮件登录 -->
					<EmailLogin v-if="loginType === 'email'" />

					<!-- 账号登录 -->
					<AccountLogin
						v-if="loginType === 'account'"
						@back="() => (loginType = 'email')"
					/>

					<!-- 二维码登录 -->
					<QrCodeLogin
						v-if="loginType === 'qrcode'"
						@back="() => (loginType = 'email')"
					/>

					<!-- 用户注册 -->
					<UserRegister
						v-if="loginType === 'register'"
						@back="() => (loginType = 'email')"
					/>

					<div v-if="loginType === 'email'">
						<!-- 其它类型登录 -->
						<el-form-item
							class="other-login animate__animated animate__fadeInUp"
							:style="{ animationDelay: '0.25s' }"
						>
							<el-button
								@click="loginType = 'account'"
								class="other-login-button"
								plain
							>
								账号登录
							</el-button>
							<el-button
								class="other-login-button"
								@click="loginType = 'qrcode'"
								plain
								>扫码登录</el-button
							>
							<el-button
								class="other-login-button"
								@click="loginType = 'register'"
								plain
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
	</div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { Logo } from '@/components/Layout'
import { useLayoutStore } from '@/stores/Layout'
import EmailLogin from './components/EmailLogin.vue'
import AccountLogin from './components/AccountLogin.vue'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import QrCodeLogin from '@/views/login/components/QrCodeLogin.vue'
import UserRegister from '@/views/login/components/UserRegister.vue'
const lottieUrl = new URL(`@/assets/lottie/animation-admin.lottie`, import.meta.url).href

const layoutStore = useLayoutStore()

// logo 内容
const logoText = ref('Basic Cloud')
const logoTextArray = logoText.value.split('')

const showLogoText = ref(true)
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

watch(loginType, () => {
	showLogoText.value = false
	nextTick(() => showLogoText.value = true)
})
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

.dark .animation-lottie-wrapper {
	background: var(--el-bg-color-page);
}

.login-page {
	margin: 0;
	height: 100%;
	display: grid;
	overflow: hidden;
	grid-template-columns: 1fr 32%;
}

.login-wrapper {
	padding: 0 10%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--el-bg-color);
}

/* ============ 小屏幕 ============ */
@media screen and (max-width: 1024px) {
	.login-page {
		grid-template-columns: 0 1fr;
	}

	.login-wrapper {
		padding: 0;
	}

	.animation-lottie {
		display: none;
	}
}

/* ============ PC 中屏幕 ============ */
@media (min-width: 1024px) and (max-width: 1350px) {
	.login-page {
		grid-template-columns: 1fr 40%;
	}

	.login-wrapper {
		padding: 0;
	}

	.animation-lottie {
		display: block;
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
.animation-lottie {
	width: 40vw;
}

.animation-lottie-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;

	/* 浅蓝色渐变背景 */
	background: radial-gradient(
		circle at center,
		#d7e9fc 0%,
		/* 中心浅蓝 */ #f5f8fb 100% /* 外圈更浅 */
	);
}

:root {
	--i: 0;
}

.bounce-text {
	display: flex;
	gap: 4px;
	font-size: 48px;
	font-weight: bold;
}

.bounce-text span {
	animation: bounce 0.8s ease-in-out forwards;
	animation-delay: calc(var(--i) * 0.1s);
}

/* 核心动画 */
@keyframes bounce {
	0%,
	100% {
		transform: translateY(0);
	}
	30% {
		transform: translateY(-15px) scale(1.1);
	}
	60% {
		transform: translateY(0);
	}
}
</style>
