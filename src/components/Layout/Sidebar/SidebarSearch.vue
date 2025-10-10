<template>
	<div class="sidebar-search">
		<!-- 搜索框 -->
		<el-input
			ref="searchInputRef"
			v-model="searchKeyword"
			@input="handleInput"
			placeholder="搜索菜单..."
			class="search-input"
			clearable
			size="large"
			@clear="handleClear"
			@keydown.enter="handleEnter"
			@keydown.up.prevent="handleArrowUp"
			@keydown.down.prevent="handleArrowDown"
			@keydown.esc="handleEscape"
		>
			<template #prefix>
				<Icon icon="ep:search" />
			</template>
		</el-input>

		<!-- 搜索结果 -->
		<div class="search-results">
			<div v-if="loading" class="search-loading">
				<Icon icon="ep:loading" class="is-loading" />
				<span>搜索中...</span>
			</div>

			<div v-else-if="filteredResults.length === 0" class="no-results">
				<el-empty description="暂无搜索结果" :image-size="80" />
			</div>

			<div v-else class="results-list">
				<div
					v-for="(item, index) in filteredResults"
					:key="item.path"
					:class="['result-item', { active: activeIndex === index }]"
					@click="handleItemClick(item)"
					@mouseenter="activeIndex = index"
				>
					<div class="item-icon">
						<Icon v-if="item.icon" :icon="item.icon" />
						<Icon v-else icon="ep:document" />
					</div>

					<div class="item-content">
						<div class="item-title" v-html="highlightKeyword(item.title)"></div>
						<div class="item-path">{{ item.breadcrumb.join(' > ') }}</div>
					</div>

					<div class="item-shortcut">
						<span v-if="index < 9">{{ index + 1 }}</span>
					</div>
				</div>
			</div>
		</div>
		<!-- 快捷键提示 -->
		<div class="search-footer">
			<div class="shortcuts">
				<span>
					<kbd>
						<Icon icon="ep:top" />
					</kbd>
					<kbd>
						<Icon icon="ep:bottom" />
					</kbd>
					导航
				</span>
				<span><kbd>Enter</kbd> 选择</span>
				<span><kbd>Esc</kbd> 关闭</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { type RouteRecordRaw, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'

// 搜索结果项类型定义
export interface SearchResultItem {
	path: string
	title: string
	icon?: string
	breadcrumb: string[]
	meta?: Record<string, any>
}

interface Props {
	menuData: RouteRecordRaw[]
	maxResults?: number
	searchDelay?: number
	minSearchLength?: number
}

interface Emits {
	select: [item: SearchResultItem]
	open: []
	close: []
}

const props = withDefaults(defineProps<Props>(), {
	maxResults: 20,
	searchDelay: 300,
	minSearchLength: 1,
})

const emit = defineEmits<Emits>()

const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const searchInputRef = ref()
const loading = ref(false)
const showResults = ref(false)
const activeIndex = ref(0)

// 扁平化菜单数据
const flattenedMenus = computed(() => {
	const result: SearchResultItem[] = []

	const flatten = (items: RouteRecordRaw[], breadcrumb: string[] = []) => {
		items.forEach((item) => {
			if (!item.meta?.hidden && item.meta?.title) {
				const currentBreadcrumb = [...breadcrumb, item.meta.title]

				// 添加当前项目
				result.push({
					path: item.path,
					title: item.meta.title,
					icon: item.meta.icon,
					breadcrumb: currentBreadcrumb,
					meta: item.meta,
				})

				// 递归处理子菜单
				if (item.children && item.children.length > 0) {
					flatten(item.children, currentBreadcrumb)
				}
			}
		})
	}

	flatten(props.menuData)
	return result
})

const filteredResults: Ref<SearchResultItem[]> = ref([])

const handleInput = useDebounceFn(() => {
	console.log('handleInput')
	if (!searchKeyword.value || searchKeyword.value.trim().length < props.minSearchLength) {
		return []
	}

	const keyword = searchKeyword.value.toLowerCase().trim()

	filteredResults.value = flattenedMenus.value
		.filter((item) => {
			// 搜索标题和面包屑
			const titleMatch = item.title.toLowerCase().includes(keyword)
			const breadcrumbMatch = item.breadcrumb.some((crumb) =>
				crumb.toLowerCase().includes(keyword),
			)
			const pathMatch = item.path.toLowerCase().includes(keyword)

			return titleMatch || breadcrumbMatch || pathMatch
		})
		.slice(0, props.maxResults)
		.sort((a, b) => {
			// 优先显示标题完全匹配的项目
			const aExactMatch = a.title.toLowerCase() === keyword
			const bExactMatch = b.title.toLowerCase() === keyword

			if (aExactMatch && !bExactMatch) return -1
			if (!aExactMatch && bExactMatch) return 1

			// 其次按标题开头匹配排序
			const aStartsWith = a.title.toLowerCase().startsWith(keyword)
			const bStartsWith = b.title.toLowerCase().startsWith(keyword)

			if (aStartsWith && !bStartsWith) return -1
			if (!aStartsWith && bStartsWith) return 1

			// 最后按字母顺序排序
			return a.title.localeCompare(b.title)
		})
}, props.searchDelay)

// 过滤搜索结果
// const filteredResults = computed(() => {
// 	if (!searchKeyword.value || searchKeyword.value.trim().length < props.minSearchLength) {
// 		return []
// 	}
//
// 	const keyword = searchKeyword.value.toLowerCase().trim()
//
// 	return flattenedMenus.value
// 		.filter((item) => {
// 			// 搜索标题和面包屑
// 			const titleMatch = item.title.toLowerCase().includes(keyword)
// 			const breadcrumbMatch = item.breadcrumb.some((crumb) =>
// 				crumb.toLowerCase().includes(keyword),
// 			)
// 			const pathMatch = item.path.toLowerCase().includes(keyword)
//
// 			return titleMatch || breadcrumbMatch || pathMatch
// 		})
// 		.slice(0, props.maxResults)
// 		.sort((a, b) => {
// 			// 优先显示标题完全匹配的项目
// 			const aExactMatch = a.title.toLowerCase() === keyword
// 			const bExactMatch = b.title.toLowerCase() === keyword
//
// 			if (aExactMatch && !bExactMatch) return -1
// 			if (!aExactMatch && bExactMatch) return 1
//
// 			// 其次按标题开头匹配排序
// 			const aStartsWith = a.title.toLowerCase().startsWith(keyword)
// 			const bStartsWith = b.title.toLowerCase().startsWith(keyword)
//
// 			if (aStartsWith && !bStartsWith) return -1
// 			if (!aStartsWith && bStartsWith) return 1
//
// 			// 最后按字母顺序排序
// 			return a.title.localeCompare(b.title)
// 		})
// })

// 防抖搜索函数
const debouncedSearch = useDebounceFn(async () => {
	if (searchKeyword.value.trim().length >= props.minSearchLength) {
		loading.value = true
		// 模拟搜索延迟
		await new Promise((resolve) => setTimeout(resolve, 100))
		loading.value = false
	}
}, props.searchDelay)

// 处理搜索输入
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleSearch = (value: string) => {
	if (typeof value !== 'string') {
		return
	}
	if (value?.trim()) {
		showResults.value = true
		activeIndex.value = 0
		debouncedSearch()
		emit('open')
	} else {
		showResults.value = false
		emit('close')
	}
}

// 处理清空
const handleClear = () => {
	showResults.value = false
	activeIndex.value = 0
	emit('close')
}

// 处理回车键
const handleEnter = () => {
	if (filteredResults.value.length > 0 && activeIndex.value >= 0) {
		const selectedItem = filteredResults.value[activeIndex.value]
		handleItemClick(selectedItem)
	}
}

// 处理上箭头
const handleArrowUp = () => {
	if (filteredResults.value.length > 0) {
		activeIndex.value =
			activeIndex.value <= 0 ? filteredResults.value.length - 1 : activeIndex.value - 1
	}
}

// 处理下箭头
const handleArrowDown = () => {
	if (filteredResults.value.length > 0) {
		activeIndex.value =
			activeIndex.value >= filteredResults.value.length - 1 ? 0 : activeIndex.value + 1
	}
}

// 处理ESC键
const handleEscape = () => {
	showResults.value = false
	searchKeyword.value = ''
	activeIndex.value = 0
	searchInputRef.value?.blur()
	emit('close')
}

// 处理项目点击
const handleItemClick = (item: SearchResultItem) => {
	emit('select', item)

	// 路由跳转
	if (item.path && !isExternalLink(item.path)) {
		router.push(item.path)
	} else if (isExternalLink(item.path)) {
		window.open(item.path, '_blank')
	}

	// 清空搜索
	searchKeyword.value = ''
	showResults.value = false
	activeIndex.value = 0
	searchInputRef.value?.blur()
	emit('close')
}

// 高亮关键词
const highlightKeyword = (text: string) => {
	if (!searchKeyword.value.trim()) return text

	const keyword = searchKeyword.value.trim()
	const regex = new RegExp(`(${keyword})`, 'gi')
	return text.replace(regex, '<mark>$1</mark>')
}

// 判断是否为外部链接
const isExternalLink = (path: string): boolean => {
	return /^(https?:|mailto:|tel:)/.test(path)
}

// 处理全局快捷键
const handleGlobalKeydown = (event: KeyboardEvent) => {
	// Ctrl/Cmd + K 打开搜索
	if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
		event.preventDefault()
		searchInputRef.value?.focus()
	}

	// 数字键快速选择
	if (showResults.value && /^[1-9]$/.test(event.key)) {
		const index = parseInt(event.key) - 1
		if (index < filteredResults.value.length) {
			event.preventDefault()
			handleItemClick(filteredResults.value[index])
		}
	}
}

// 点击外部关闭搜索结果
const handleClickOutside = (event: Event) => {
	const target = event.target as HTMLElement
	if (!target.closest('.sidebar-search')) {
		showResults.value = false
		emit('close')
	}
}

// 重置活跃索引
watch(filteredResults, () => {
	activeIndex.value = 0
})

// 组件挂载时注册事件
onMounted(() => {
	document.addEventListener('keydown', handleGlobalKeydown)
	document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件
onUnmounted(() => {
	document.removeEventListener('keydown', handleGlobalKeydown)
	document.removeEventListener('click', handleClickOutside)
})

// 暴露方法给父组件
defineExpose({
	focus: () => searchInputRef.value?.focus(),
	clear: handleClear,
})
</script>

<style lang="scss" scoped>
.sidebar-search {
	position: relative;
	width: 100%;
}

.search-input {
	padding: 0 16px;
}

.search-results {
	background: #ffffff;
	z-index: 2000;
	max-height: 400px;
	overflow: hidden;
	padding: 0 16px;
}

.search-loading {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
	color: #909399;

	.el-icon {
		margin-right: 8px;
	}
}

.no-results {
	padding: 20px 0;
}

.results-list {
	max-height: 320px;
	overflow-y: auto;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-thumb {
		background-color: #dcdfe6;
		border-radius: 3px;
	}
}

.result-item {
	display: flex;
	align-items: center;
	padding: 12px 16px;
	cursor: pointer;
	margin: 5px 0;
	border: 1px solid var(--el-border-color-lighter);
	transition: background-color 0.2s;

	&:hover,
	&.active {
		background-color: #f5f7fa;
	}

	.item-icon {
		width: 20px;
		height: 20px;
		margin-right: 12px;
		color: #909399;
		flex-shrink: 0;

		.el-icon {
			font-size: 16px;
		}
	}

	.item-content {
		flex: 1;
		min-width: 0;

		.item-title {
			font-size: 14px;
			font-weight: 500;
			color: #303133;
			margin-bottom: 2px;

			:deep(mark) {
				background-color: #409eff;
				color: #ffffff;
				padding: 1px 2px;
				border-radius: 2px;
				font-weight: 600;
			}
		}

		.item-path {
			font-size: 12px;
			color: #909399;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.item-shortcut {
		flex-shrink: 0;

		span {
			display: inline-block;
			padding: 2px 4px;
			font-size: 14px;
			line-height: 1;
			color: #909399;
			border: 1px solid #dcdfe6;
			border-radius: 3px;
			font-family: monospace;
		}
	}
}

.search-footer {
	border-top: 1px solid #e4e7ed;
	padding: 8px 16px;

	.shortcuts {
		display: flex;
		gap: 12px;
		font-size: 14px;
		color: #909399;

		kbd {
			display: inline-block;
			padding: 2px 4px;
			font-size: 13px;
			line-height: 1;
			color: #606266;
			background-color: #ffffff;
			border: 1px solid #dcdfe6;
			border-radius: 2px;
			font-family: monospace;
			margin: 0 2px;
		}
	}
}

// 深色主题适配
.dark {
	.search-results {
		background: #1d1e1f;
		border-color: #414243;
	}

	.result-item {
		&:hover,
		&.active {
			background-color: #262727;
		}

		.item-title {
			color: #e5eaf3;
		}

		.item-path {
			color: #878d99;
		}
	}

	.search-footer {
		background-color: #1a1a1a;
		border-color: #414243;

		kbd {
			background-color: #262727;
			border-color: #414243;
			color: #a3a6ad;
		}
	}
}
</style>
