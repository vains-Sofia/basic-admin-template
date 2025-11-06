<template>
	<div class="route-tabs-container">
		<el-scrollbar height="40px" ref="tabsRef">
			<div class="tabs-wrapper">
				<div
					v-for="tab in layoutStore.routeTabs"
					:key="tab.path"
					:class="['tab-item', { active: isActive(tab.path) }]"
					@click="handleTabClick(tab)"
					@contextmenu.prevent="openContextMenu($event, tab)"
				>
					<span class="tab-title">{{ tab.title }}</span>
					<el-icon v-if="!tab.affix" class="close-icon" @click.stop="closeTab(tab)">
						<el-icon>
							<Icon icon="ep:close" />
						</el-icon>
					</el-icon>
				</div>
				<div class="w-[10px]">&nbsp;</div>
			</div>
		</el-scrollbar>

		<!-- 右键菜单 -->
		<ul
			v-show="contextMenuVisible"
			:style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
			class="context-menu"
		>
			<li @click="refreshTab">
				<el-icon>
					<Icon icon="ep:refresh" />
				</el-icon>
				刷新
			</li>
			<li v-if="!selectedTab.affix" @click="closeTab(selectedTab)">
				<el-icon>
					<Icon icon="ep:close" />
				</el-icon>
				关闭
			</li>
			<li @click="closeOtherTabs">
				<el-icon>
					<Icon icon="ep:circle-close" />
				</el-icon>
				关闭其他
			</li>
			<li @click="closeLeftTabs">
				<el-icon>
					<Icon icon="ep:back" />
				</el-icon>
				关闭左侧
			</li>
			<li @click="closeRightTabs">
				<el-icon>
					<Icon icon="ep:right" />
				</el-icon>
				关闭右侧
			</li>
			<li @click="closeAllTabs">
				<el-icon>
					<Icon icon="ep:folder-delete" />
				</el-icon>
				关闭所有
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import type { TabItem } from '@/stores/Layout'
import { useLayoutStore } from '@/stores/Layout'
import { useRoute, useRouter } from 'vue-router'
import { nextTick, onMounted, ref, watch } from 'vue'
import type { ScrollbarInstance } from 'element-plus'

const layoutStore = useLayoutStore()

const router = useRouter()
const route = useRoute()

// 已访问的标签页列表

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
	const existTab = layoutStore.routeTabs.find((tab) => tab.path === path)
	if (existTab) {
		// 更新标题（可能动态改变）
		existTab.title = title
		return
	}

	// 添加新标签
	layoutStore.routeTabs.push({
		path,
		title,
		name,
		affix: meta.affix || false, // 固定标签（首页等）
		query: route.query,
		params: route.params,
	})

	scrollToLast()
}

// 点击标签页
const handleTabClick = (tab: TabItem): void => {
	router.push({
		path: tab.path,
		query: tab.query,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		params: tab.params,
	})
}

// 关闭标签页
const closeTab = (tab: TabItem): void => {
	const index = layoutStore.routeTabs.findIndex((t) => t.path === tab.path)

	if (index === -1) return

	// 如果关闭的是当前标签，需要跳转到其他标签
	if (isActive(tab.path)) {
		// 优先跳转到右侧标签，如果没有则跳转到左侧
		const nextTab = layoutStore.routeTabs[index + 1] || layoutStore.routeTabs[index - 1]
		if (nextTab) {
			router.push({
				path: nextTab.path,
				query: nextTab.query,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				params: nextTab.params,
			})
		}
	}

	// 移除标签
	layoutStore.routeTabs.splice(index, 1)
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
		query: selectedTab.value.query,
	})
	closeContextMenu()
}

// 关闭其他标签
const closeOtherTabs = (): void => {
	layoutStore.routeTabs = layoutStore.routeTabs.filter(
		(tab) => tab.affix || tab.path === selectedTab.value.path,
	)

	if (!isActive(selectedTab.value.path)) {
		router.push({
			path: selectedTab.value.path,
			query: selectedTab.value.query,
		})
	}

	closeContextMenu()
}

// 关闭左侧标签
const closeLeftTabs = (): void => {
	const index = layoutStore.routeTabs.findIndex((tab) => tab.path === selectedTab.value.path)
	layoutStore.routeTabs = layoutStore.routeTabs.filter((tab, i) => tab.affix || i >= index)

	if (!isActive(selectedTab.value.path)) {
		router.push({
			path: selectedTab.value.path,
			query: selectedTab.value.query,
		})
	}

	closeContextMenu()
}

// 关闭右侧标签
const closeRightTabs = (): void => {
	const index = layoutStore.routeTabs.findIndex((tab) => tab.path === selectedTab.value.path)
	layoutStore.routeTabs = layoutStore.routeTabs.filter((tab, i) => tab.affix || i <= index)

	if (!isActive(selectedTab.value.path)) {
		router.push({
			path: selectedTab.value.path,
			query: selectedTab.value.query,
		})
	}

	closeContextMenu()
}

// 关闭所有标签
const closeAllTabs = (): void => {
	layoutStore.routeTabs = layoutStore.routeTabs.filter((tab) => tab.affix)

	// 跳转到第一个固定标签或首页
	const firstTab = layoutStore.routeTabs[0]
	if (firstTab) {
		router.push({
			path: firstTab.path,
			query: firstTab.query,
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

const tabsRef = ref<ScrollbarInstance | null>(null)

// 滚动到最后一个 tab
const scrollToLast = () => {
	if (tabsRef.value) {
		nextTick(() => {
			tabsRef.value!.scrollTo({
				left: tabsRef.value!.wrapRef!.clientWidth,
				behavior: 'smooth',
			})
		})
	}
}

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
	background: transparent;
	border-bottom: 1px solid var(--el-menu-border-color);
	/*box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);*/
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
	color: var(--el-text-color-regular);
	border: 1px solid var(--el-menu-border-color);
	border-radius: 3px;
	cursor: pointer;
	transition: all 0.3s;
	user-select: none;
}

.tab-item:hover {
	color: var(--el-color-primary);
	border-color: var(--el-color-primary);
}

.tab-item.active {
	color: white;
	border-color: var(--el-color-primary);
	background-color: var(--el-color-primary);
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
	color: var(--el-color-primary);
	background: var(--el-bg-color-page);
}

.tab-item.active .close-icon:hover {
	background: var(--el-bg-color-page);
}

/* 右键菜单样式 */
.context-menu {
	position: fixed;
	z-index: 3000;
	min-width: 140px;
	padding: 5px 0;
	margin: 0;
	font-size: 13px;
	color: var(--el-text-color-regular);
	list-style: none;
	background: var(--el-bg-color);
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
	color: var(--el-color-primary);
	background: var(--el-bg-color-page);
}

.context-menu li .el-icon {
	margin-right: 8px;
	font-size: 14px;
}
</style>
