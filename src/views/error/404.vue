<template>
	<div class="error-page">
		<div class="error-content">
			<DotLottieVue
				loop
				autoplay
				class="error-lottie"
				:src="lottieUrl"
			/>
			<h1 class="error-title">404 页面未找到</h1>
			<p class="error-desc">抱歉，您访问的页面不存在或已被移除。</p>
			<el-button type="primary" @click="goHome" size="large">
				返回首页
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
const lottieUrl = new URL(`@/assets/lottie/animation-404.lottie`, import.meta.url).href

const router = useRouter()
const goHome = () => {
	router.push('/')
}
</script>

<style scoped>
.error-page {
	display: flex;
	min-height: 85vh;
	align-items: center;
	justify-content: center;
	background: var(--el-bg-color);
	color: var(--el-text-color-primary);
	transition: background 0.3s;
}

.error-content {
	text-align: center;
	animation: fadeInUp 0.8s ease;
}

.error-lottie {
	width: 800px;
	max-width: 80vw;
	margin: 0 auto 24px;
}

.error-title {
	font-size: 26px;
	font-weight: 600;
	margin-bottom: 8px;
}

.error-desc {
	color: var(--el-text-color-secondary);
	margin-bottom: 24px;
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(24px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
