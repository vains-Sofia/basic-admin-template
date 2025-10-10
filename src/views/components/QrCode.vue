<script setup lang="ts">
import QrCode from '@/components/QrCode'
import { ref } from 'vue'

const data = 'https://qr-code-styling.com'

const props = defineProps<{
	url?: string
}>()

const url = ref(props.url || data)
</script>

<template>
	<div>
		<div class="p-5 mb-3 h-[100%]" style="background-color: var(--el-bg-color)">
			二维码生成
		</div>
		<div class="p-10 h-[100%]" style="background-color: var(--el-bg-color)">
			<el-form-item>
				<el-input
					v-model="url"
					:autosize="{ minRows: 5, maxRows: 5 }"
					type="textarea"
					placeholder="Please input"
				/>
			</el-form-item>
			<div class="flex justify-center">
				<QrCode v-if="url" :data="url" image="/src/assets/logo.png" />
			</div>
		</div>
	</div>
</template>

<style scoped></style>
