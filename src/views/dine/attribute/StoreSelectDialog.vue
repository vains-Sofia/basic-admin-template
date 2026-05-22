<template>
	<div class="store-select-dialog">
		<el-input
			v-model="searchKeyword"
			v-debounce:input="{ handler: handleSearch, wait: 400 }"
			placeholder="搜索门店"
			clearable
			@clear="handleSearch"
		>
			<template #prefix>
				<el-icon>
					<Icon icon="ep:search" />
				</el-icon>
			</template>
		</el-input>

		<el-scrollbar class="store-scrollbar">
			<div class="store-list">
				<div
					v-for="item in storeList"
					:key="item.id"
					class="store-item"
					:class="{ active: modelValue === item.id }"
					@click="selectStore(item)"
				>
					<el-avatar :size="50" :src="item.logo" shape="square">
						{{ item.name.slice(0, 1) }}
					</el-avatar>
					<div class="store-info">
						<div class="store-name">{{ item.name }}</div>
						<div class="store-status">
							{{ item.address }}
						</div>
					</div>
				</div>

				<div v-if="loading" class="loading-container">
					<el-icon class="is-loading">
						<Icon icon="ep:loading" />
					</el-icon>
					<span>加载中...</span>
				</div>

				<div v-show="!noMore" ref="loadTrigger" class="load-trigger" />

				<div v-if="noMore && storeList.length > 0" class="no-more">没有更多数据了</div>

				<el-empty v-if="storeList.length === 0 && !loading" description="暂无门店" />
			</div>
		</el-scrollbar>
	</div>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { onMounted, ref } from 'vue'

import { pageStore } from '@/api/dine/Store.ts'
import type { FindStoreResponse } from '@/api/types/StoreTypes.ts'

defineProps<{
	modelValue?: string
}>()

const emit = defineEmits<{
	select: [store: FindStoreResponse]
}>()

const pageSize = ref(15)
const currentPage = ref(1)
const noMore = ref(false)
const loading = ref(false)
const storeList = ref<FindStoreResponse[]>([])
const searchKeyword = ref('')
const loadTrigger = ref<HTMLElement | null>(null)

const fetchStores = async (current = 1, size = 15, keyword = '') => {
	return pageStore({ current, size, keyword })
}

const loadStores = async (reset = false) => {
	if (loading.value) return

	loading.value = true

	try {
		if (reset) {
			currentPage.value = 1
			noMore.value = false
		}

		const result = await fetchStores(currentPage.value, pageSize.value, searchKeyword.value)

		if (reset) {
			storeList.value = result.records
		} else {
			storeList.value.push(...result.records)
		}

		noMore.value = !result.records || result.records.length === 0

		if (!noMore.value) {
			currentPage.value++
		}
	} catch {
		noMore.value = true
	} finally {
		loading.value = false
	}
}

const handleSearch = () => {
	loadStores(true)
}

const selectStore = (item: FindStoreResponse) => {
	emit('select', item)
}

useIntersectionObserver(loadTrigger, ([{ isIntersecting }]) => {
	if (isIntersecting && !loading.value && !noMore.value) {
		loadStores()
	}
})

onMounted(() => {
	loadStores(true)
})
</script>

<style scoped>
.store-select-dialog {
	display: flex;
	flex-direction: column;
	height: 520px;
	min-height: 0;
}

.store-scrollbar {
	flex: 1;
	min-height: 0;
	margin-top: 12px;
}

.store-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 16px;
	margin-bottom: 8px;
	background: var(--el-fill-color-blank);
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	border: 1px solid var(--el-border-color-lighter);
}

.store-item:hover:not(.active) {
	background: var(--el-fill-color);
	border-color: var(--el-border-color-light);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.store-item.active {
	background: linear-gradient(
		135deg,
		var(--el-color-primary-light-9) 0%,
		var(--el-fill-color-blank) 100%
	);
	border: 1px solid var(--el-color-primary-light-3);
	box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.15);
}

.store-info {
	flex: 1;
	min-width: 0;
	overflow: hidden;
}

.store-name {
	font-size: 14px;
	font-weight: 500;
	color: var(--el-text-color-primary);
	margin-bottom: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.store-status {
	font-size: 12px;
	color: var(--el-text-color-regular);
}

.loading-container {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;
	color: var(--el-text-color-regular);
	font-size: 14px;
}

.loading-container .el-icon {
	margin-right: 8px;
}

.no-more {
	text-align: center;
	padding: 16px;
	color: var(--el-text-color-placeholder);
	font-size: 12px;
}

.load-trigger {
	height: 1px;
}
</style>
