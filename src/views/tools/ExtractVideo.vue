<script setup lang="ts">
import { ref } from 'vue'
import { http } from '@/utils/request.ts'

const shareContent = ref('')

const extractUrls = (str: string) => {
	if (!str) return null
	const regex = /https?:\/\/\S+/gi
	const matches = [...str.matchAll(regex)].map((m) => m[0])
	return matches.map((u) => u.replace(/[.,!?;:，。)）]+$/, ''))
}

const extractedUrl = ref('')

const videoUrl = ref('')

const onExtractUrl = () => {
	const urls = extractUrls(shareContent.value)
	if (urls && urls.length >= 1) {
		extractedUrl.value = urls[0]
	}
	if (extractedUrl.value) {
		http.get(
			`https://competent-jilly-vains-0431fff4.koyeb.app/douyin/extract?shareUrl=${encodeURIComponent(extractedUrl.value)}`,
			null,
			{ rawResponse: true },
		)
			.then((res) => {
				if (res.error) {
					ElMessage(res.error)
				} else {
					videoUrl.value = res.videoUrl
				}
			})
	} else {
		ElMessage('请输入分享链接.')
	}
}
</script>

<template>
	<div style="background-color: var(--el-bg-color-page)">
		<div class="p-5 mb-3" style="background-color: var(--el-bg-color)">视频提取</div>
		<div class="p-10" style="background-color: var(--el-bg-color)">
			<el-form inline>
				<el-form-item>
					<el-input v-model="shareContent" placeholder="Please input" />
				</el-form-item>
				<el-form-item>
					<el-button @click.stop="onExtractUrl">提取</el-button>
				</el-form-item>
			</el-form>

			<div class="flex justify-center">
				{{ videoUrl }}
			</div>
		</div>
	</div>
</template>

<style scoped></style>
