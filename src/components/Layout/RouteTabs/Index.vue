<template>
	<div class="route-tabs-container">
		<el-scrollbar>
			<div class="tabs-wrapper">
				<div
					v-for="tab in visitedTabs"
					:key="tab.path"
					:class="['tab-item', { active: isActive(tab.path) }]"
					@click="handleTabClick(tab)"
					@contextmenu.prevent="openContextMenu($event, tab)"
				>
					<span class="tab-title">{{ tab.title }}</span>
					<el-icon
						v-if="!tab.affix"
						class="close-icon"
						@click.stop="closeTab(tab)"
					>
						<Close />
					</el-icon>
				</div>
			</div>
		</el-scrollbar>

		<!-- 右键菜单 -->
		<ul
			v-show="contextMenuVisible"
			:style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
			class="context-menu"
		>
			<li @click="refreshTab">
				<el-icon><Refresh /></el-icon>
				刷新
			</li>
			<li v-if="!selectedTab.affix" @click="closeTab(selectedTab)">
				<el-icon><Close /></el-icon>
				关闭
			</li>
			<li @click="closeOtherTabs">
				<el-icon><CircleClose /></el-icon>
				关闭其他
			</li>
			<li @click="closeLeftTabs">
				<el-icon><Back /></el-icon>
				关闭左侧
			</li>
			<li @click="closeRightTabs">
				<el-icon><Right /></el-icon>
				关闭右侧
			</li>
			<li @click="closeAllTabs">
				<el-icon><FolderDelete /></el-icon>
				关闭所有
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute, type LocationQuery, type RouteParams } from 'vue-router'

// 定义标签页类型
interface TabItem {
	path: string
	title: string
	name?: string | symbol
	affix?: boolean
	query?: LocationQuery
	params?: RouteParams
}

const router = useRouter()
const route = useRoute()

// 已访问的标签页列表
const visitedTabs = ref<TabItem[]>([])

// 右键菜单相关
const contextMenuVisible = ref<boolean>(false)
const contextMenuLeft = ref<number>(0)
const contextMenuTop = ref<number>(0)
const selectedTab = ref<TabItem>({} as TabItem)

// 判断是否为当前激活的标签
const isActive = (path: string): boolean => {
	return route.path === path
}

// 添加标签页
const addTab = (): void => {
	const { path, meta, name } = route

	// 如果路由配置了不显示标签，则跳过
	if (meta.hiddenTag) return

	// 获取标签标题
	const title = meta.title || (typeof name === 'string' ? name : '') || '未命名页面'

	// 检查是否已存在
	const existTab = visitedTabs.value.find(tab => tab.path === path)
	if (existTab) {
		// 更新标题（可能动态改变）
		existTab.title = title
		return
	}

	// 添加新标签
	visitedTabs.value.push({
		path,
		title,
		name,
		affix: meta.affix || false, // 固定标签（首页等）
		query: route.query,
		params: route.params
	})
}

// 点击标签页
const handleTabClick = (tab: TabItem): void => {
	router.push({
		path: tab.path,
		query: tab.query,
		params: tab.params
	})
}

// 关闭标签页
const closeTab = (tab: TabItem): void => {
	const index = visitedTabs.value.findIndex(t => t.path === tab.path)

	if (index === -1) return

	// 如果关闭的是当前标签，需要跳转到其他标签
	if (isActive(tab.path)) {
		// 优先跳转到右侧标签，如果没有则跳转到左侧
		const nextTab = visitedTabs.value[index + 1] || visitedTabs.value[index - 1]
		if (nextTab) {
			router.push({
				path: nextTab.path,
				query: nextTab.query,
				params: nextTab.params
			})
		}
	}

	// 移除标签
	visitedTabs.value.splice(index, 1)
}

// 打开右键菜单
const openContextMenu = (e: MouseEvent, tab: TabItem): void => {
	contextMenuVisible.value = true
	contextMenuLeft.value = e.clientX
	contextMenuTop.value = e.clientY
	selectedTab.value = tab
}

// 关闭右键菜单
const closeContextMenu = (): void => {
	contextMenuVisible.value = false
}

// 刷新当前标签
const refreshTab = (): void => {
	router.replace({
		path: '/redirect' + selectedTab.value.path,
		query: selectedTab.value.query
	})
	closeContextMenu()
}

// 关闭其他标签
const closeOtherTabs = (): void => {
	visitedTabs.value = visitedTabs.value.filter(
		tab => tab.affix || tab.path === selectedTab.value.path
	)

	if (!isActive(selectedTab.value.path)) {
		router.push({
			path: selectedTab.value.path,
			query: selectedTab.value.query
		})
	}

	closeContextMenu()
}

// 关闭左侧标签
const closeLeftTabs = (): void => {
	const index = visitedTabs.value.findIndex(tab => tab.path === selectedTab.value.path)
	visitedTabs.value = visitedTabs.value.filter(
		(tab, i) => tab.affix || i >= index
	)

	if (!isActive(selectedTab.value.path)) {
		router.push({
			path: selectedTab.value.path,
			query: selectedTab.value.query
		})
	}

	closeContextMenu()
}

// 关闭右侧标签
const closeRightTabs = (): void => {
	const index = visitedTabs.value.findIndex(tab => tab.path === selectedTab.value.path)
	visitedTabs.value = visitedTabs.value.filter(
		(tab, i) => tab.affix || i <= index
	)

	if (!isActive(selectedTab.value.path)) {
		router.push({
			path: selectedTab.value.path,
			query: selectedTab.value.query
		})
	}

	closeContextMenu()
}

// 关闭所有标签
const closeAllTabs = (): void => {
	visitedTabs.value = visitedTabs.value.filter(tab => tab.affix)

	// 跳转到第一个固定标签或首页
	const firstTab = visitedTabs.value[0]
	if (firstTab) {
		router.push({
			path: firstTab.path,
			query: firstTab.query
		})
	} else {
		router.push('/')
	}

	closeContextMenu()
}

// 监听路由变化
watch(route, () => {
	addTab()
})

// 监听点击事件，关闭右键菜单
onMounted(() => {
	document.addEventListener('click', closeContextMenu)

	// 初始化添加当前路由
	nextTick(() => {
		addTab()
	})
})
</script>

<style scoped>
.route-tabs-container {
	position: relative;
	height: 40px;
	background: #fff;
	border-bottom: 1px solid #e4e7ed;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
}

.tabs-wrapper {
	display: flex;
	height: 40px;
	padding: 0 10px;
	white-space: nowrap;
}

.tab-item {
	display: inline-flex;
	align-items: center;
	height: 30px;
	margin: 5px 3px;
	padding: 0 12px;
	font-size: 13px;
	color: #666;
	background: #f5f5f5;
	border: 1px solid #e4e7ed;
	border-radius: 3px;
	cursor: pointer;
	transition: all 0.3s;
	user-select: none;
}

.tab-item:hover {
	color: #409eff;
	background: #ecf5ff;
	border-color: #c6e2ff;
}

.tab-item.active {
	color: #fff;
	background: #409eff;
	border-color: #409eff;
}

.tab-title {
	display: inline-block;
	max-width: 120px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.close-icon {
	margin-left: 6px;
	font-size: 14px;
	border-radius: 50%;
	transition: all 0.3s;
}

.close-icon:hover {
	color: #fff;
	background: rgba(0, 0, 0, 0.2);
}

.tab-item.active .close-icon:hover {
	background: rgba(255, 255, 255, 0.3);
}

/* 右键菜单样式 */
.context-menu {
	position: fixed;
	z-index: 3000;
	min-width: 140px;
	padding: 5px 0;
	margin: 0;
	font-size: 13px;
	color: #333;
	list-style: none;
	background: #fff;
	border-radius: 4px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.context-menu li {
	display: flex;
	align-items: center;
	height: 34px;
	padding: 0 16px;
	cursor: pointer;
	transition: all 0.3s;
}

.context-menu li:hover {
	color: #409eff;
	background: #ecf5ff;
}

.context-menu li .el-icon {
	margin-right: 8px;
	font-size: 14px;
}

/* 滚动条样式优化 */
:deep(.el-scrollbar__wrap) {
	overflow-x: auto;
	overflow-y: hidden;
}

:deep(.el-scrollbar__bar.is-horizontal) {
	height: 6px;
}
</style>
