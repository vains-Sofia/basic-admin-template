<script setup lang="ts">
import QrCode from '@/components/QrCode/src'

const qrcodeWidth = 200

interface Emits {
	back: []
}

const emit = defineEmits<Emits>()
</script>

<template>
	<div class="flex items-center flex-col">
		<div class="pb-3 animate__animated animate__fadeInUp" :style="{ animationDelay: '0.1s' }">
			使用APP扫一扫登录
		</div>

		<QrCode
			data="https://baidu.com/api/qrcode"
			:size="qrcodeWidth"
			class="animate__animated animate__fadeInUp"
			:style="{ animationDelay: '0.15s' }"
		/>

		<el-form-item
			:style="{ width: qrcodeWidth + 'px', animationDelay: '0.2s' }"
			class="animate__animated animate__fadeInUp"
		>
			<el-button plain class="mt-5.5 w-full" @click="() => emit('back')"> 返回 </el-button>
		</el-form-item>
	</div>
</template>

<style scoped></style>
