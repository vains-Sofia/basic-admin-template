<script setup lang="ts">
import { useRoute } from 'vue-router'
import { nextTick, onMounted, ref, watch } from 'vue'

const currentRoute = useRoute()
const loading = ref(true)
const frameRef = ref<HTMLElement>()
const frameSrc = ref<string>('')
function hideLoading() {
	loading.value = false
}

const {
	frameInfo = {
		frameSrc: '',
		fullPath: '',
	},
} = defineProps<{
	frameInfo?: {
		frameSrc: string
		fullPath: string
	}
}>()

const newFrameInfo = ref(frameInfo)

function init() {
	frameSrc.value = currentRoute.meta?.frameSrc as string
	nextTick(() => {
		const iframe = frameRef.value
		if (!iframe) return
		const _frame = iframe as any
		if (_frame.attachEvent) {
			_frame.attachEvent('onload', () => {
				hideLoading()
			})
		} else {
			iframe.onload = () => {
				hideLoading()
			}
		}
	})
}

watch(
	() => currentRoute.fullPath,
	(path) => {
		if (currentRoute.name === 'Redirect' && path.includes(frameInfo.fullPath)) {
			newFrameInfo.value.frameSrc = path // redirect时，置换成任意值，待重定向后 重新赋值
			loading.value = true
		}
		// 重新赋值
		if (frameInfo.fullPath === path) {
			frameSrc.value = newFrameInfo.value.frameSrc
		}
	},
)

onMounted(() => {
	init()
})
</script>

<template>
	<div v-loading="loading" class="frame" :element-loading-text="'加载中...'">
		<iframe ref="frameRef" :src="frameSrc" class="frame-iframe" />
	</div>
</template>

<style lang="scss" scoped>
.frame {
	position: absolute;
	inset: 0;

	.frame-iframe {
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border: 0;
	}
}

.main-content {
	margin: 2px 0 0 !important;
}
</style>
