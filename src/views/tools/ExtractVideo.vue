<script setup lang="ts">
import { ref } from 'vue'

const shareContent = ref('')

const extractUrls = (str: string) => {
	if (!str) return null
	const regex = /https?:\/\/\S+/gi
	const matches = [...str.matchAll(regex)].map((m) => m[0])
	return matches.map((u) => u.replace(/[.,!?;:，。)）]+$/, ''))
}

const extractedUrl = ref('')

const onExtractUrl = () => {
	const urls = extractUrls(shareContent.value)
	if (urls && urls.length >= 1) {
		extractedUrl.value = urls[0]
	}
}

/*function extractJSONVariable(html: string, variableName: string) {
	// 构建匹配特定变量的正则表达式
	const regex = new RegExp(`${variableName}\\s*=\\s*({[\\s\\S]*?})(?:\\s*;)?\\s*(?:\\n\\s*)?<\\/script>`);
	const match = html.match(regex);

	if (match && match[1]) {
		try {
			return JSON.parse(match[1]);
		} catch (e) {
			console.error(`解析 ${variableName} 失败:`, e);
			return null;
		}
	}

	return null;
}*/

const videoUrl = ref('')

// http.get(
// 	`https://proxy.cloud991201.workers.dev?finalUrl=true&url=${encodeURIComponent('https://v.douyin.com/6kZKQ0kIjXs/')}`,
// 	null,
// 	{ rawResponse: true },
// )
// 	.then((res) => {
// 		if (res.startsWith('https://www.')) {
// 			// finalHtml.value = `https://proxy.cloud991201.workers.dev?url=${encodeURIComponent(res)}`
// 			http.get(
// 				`https://proxy.cloud991201.workers.dev?url=${encodeURIComponent(res)}`,
// 				null,
// 				{ rawResponse: true },
// 			).then((r) => {
// 				const routerData = extractJSONVariable(r, 'window\\._ROUTER_DATA')
// 				if (routerData) {
// 					console.log('路由数据:', routerData);
// 					// 提取视频信息
// 					const videoInfo = routerData.loaderData["video_(id)/page"]?.videoInfoRes?.item_list[0];
// 					console.log('视频描述:', videoInfo.desc);
// 					console.log('作者:', videoInfo.author.nickname);
// 					console.log('点赞数:', videoInfo.statistics.digg_count);
// 					console.log('视频链接:', videoInfo?.video?.play_addr?.url_list[0].replaceAll('playwm', 'play'));
// 					videoUrl.value = videoInfo?.video?.play_addr?.url_list[0].replaceAll('playwm', 'play');
// 				}
// 			})
// 		}
// 	})
// 	.catch((e) => console.log(e))

</script>

<template>
	<div style="background-color: var(--el-bg-color-page)">
		<div class="p-5 mb-3" style="background-color: var(--el-bg-color)">视频提取</div>
		<div class="p-10" style="background-color: var(--el-bg-color)">
			<el-form-item>
				<el-input v-model="shareContent" placeholder="Please input" />
				<el-button @click.stop="onExtractUrl">提取</el-button>
			</el-form-item>

			<div class="flex justify-center">
				{{ extractedUrl }}
			</div>
			<div class="flex justify-center">
				{{ extractedUrl }}
			</div>
			<video v-if="videoUrl" :src="videoUrl" controls autoplay loop muted></video>
		</div>
	</div>
</template>

<style scoped></style>
