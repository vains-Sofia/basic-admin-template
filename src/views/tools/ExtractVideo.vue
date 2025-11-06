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
const loading = ref(false)

const result = ref()

const onExtractUrl = () => {
	const urls = extractUrls(shareContent.value)
	if (urls && urls.length >= 1) {
		extractedUrl.value = urls[0]
	}
	if (extractedUrl.value) {
		loading.value = true
		http.get(
			`https://competent-jilly-vains-0431fff4.koyeb.app/douyin/extract?shareUrl=${encodeURIComponent(extractedUrl.value)}`,
			null,
			{ rawResponse: true },
		).then((res) => {
			if (res.error) {
				ElMessage(res.error)
			} else {
				result.value = res
			}
		}).finally(() => loading.value = false)
	} else {
		ElMessage('请输入分享链接.')
	}
}

/**
 * 更新 URL 参数（支持新增、修改、删除）
 * @param {string} url 原始 URL
 * @param {Object} params 要修改的参数键值对，值为 null/undefined 表示删除该参数
 * @returns {string} 修改后的 URL
 */
function updateUrlParams(url: string, params = {}) {
	const urlObj = new URL(url, window.location.origin) // 兼容相对路径

	for (const [key, value] of Object.entries(params)) {
		if (value === null || value === undefined) {
			urlObj.searchParams.delete(key)
		} else {
			urlObj.searchParams.set(key, value as string)
		}
	}

	return urlObj.toString()
}

const onPreview = (ratio: string) => {
	if (result.value && result.value.videoUrl) {
		if (ratio !== '') {
			result.value.videoUrl = updateUrlParams(result.value.videoUrl, { ratio })
		}
		window.open(result.value.videoUrl, '_blank', 'noreferrer')
	} else {
		ElMessage('提取视频链接失败.')
	}
}
</script>

<template>
	<div style="background-color: var(--el-bg-color-page)" v-loading="loading">
		<div class="p-5 mb-3" style="background-color: var(--el-bg-color)">视频提取</div>
		<div class="p-5 mb-3" style="background-color: var(--el-bg-color)">
			<div class="text-center">
				<el-form inline>
					<el-form-item class="lg:w-[30%] w-[70%] mb-0!">
						<el-input v-model="shareContent" placeholder="请输入分享内容" />
					</el-form-item>
					<el-form-item class="mr-0! mb-0!">
						<el-button @click.stop="onExtractUrl">提取</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>
		<div
			v-if="result"
			class="p-5 mb-3 text-center"
			style="background-color: var(--el-bg-color)"
		>
			<el-button plain @click="onPreview('')">预览(默认)</el-button>
			<el-button plain @click="onPreview('1080p')">预览(1080p)</el-button>
		</div>
		<div
			v-if="result"
			class="p-5 text-center mb-3"
			style="background-color: var(--el-bg-color)"
		>
			<el-image :src="result.videoCover" class="md:h-[65vh]" />
		</div>
	</div>
</template>

<style scoped></style>
