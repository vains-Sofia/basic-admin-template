<script setup lang="ts">
import { ref } from 'vue'
import logo from '@/assets/logo.png'
import QrCode from '@/components/QrCode'

const data = 'https://qr-code-styling.com'

const props = defineProps<{
	url?: string
}>()

const url = ref(props.url || data)

const loading = ref(false)
const expired = ref(true)
const onRefresh = () => {
	loading.value = true
	setTimeout(() => {
		loading.value = false
		expired.value = false
		url.value = url.value + '1'
	}, 1000)
	setTimeout(() => {
		expired.value = true
	}, 5000)
}
</script>

<template>
	<div>
		<div class="p-5 mb-3 h-[100%]" style="background-color: var(--el-bg-color)">二维码生成</div>
		<div class="p-10 h-[100%]" style="background-color: var(--el-bg-color)">
			<el-form-item>
				<el-input
					v-model="url"
					:autosize="{ minRows: 5, maxRows: 5 }"
					type="textarea"
					placeholder="Please input"
				/>
			</el-form-item>
			<div class="flex justify-center gap-5 mt-2">
				<QrCode v-if="url" :data="url" :image="logo" />
				<QrCode
					v-if="url"
					:expired="expired"
					:data="url"
					:loading="loading"
					:image="logo"
					:on-refresh="onRefresh"
				/>
				<QrCode v-if="url" :data="url" :expired="expired" :loading="loading" :image="logo">
					<template #expired>
						<div class="my-mask">
							<p>二维码太久啦，点下面刷新一下吧～</p>
							<ElButton type="success" link @click="onRefresh">刷新二维码</ElButton>
						</div>
					</template>
					<template #loading>
						<div>请稍候...</div>
					</template>
				</QrCode>
			</div>
		</div>
	</div>
</template>

<style scoped>
.my-mask {
	text-align: center;
}
</style>
