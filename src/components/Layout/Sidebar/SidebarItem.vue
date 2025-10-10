<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import TextTooltip from '@/components/TextTooltip'

interface Props {
	item: RouteRecordRaw
	basePath: string
}

const props = defineProps<Props>()

// 用于存储只有一个子菜单时的子菜单项
const onlyOneChild = ref<RouteRecordRaw | null>(null)

// 可见的子菜单项
const visibleChildren = computed(() => {
	return props.item.children?.filter((child) => !child.meta?.hidden) || []
})

// 判断是否只有一个显示的子菜单
const hasOneShowingChild = (children?: RouteRecordRaw[], parent?: RouteRecordRaw): boolean => {
	const showingChildren =
		children?.filter((child) => {
			if (child.meta?.hidden) return false
			// 设置 onlyOneChild
			onlyOneChild.value = child
			return true
		}) || []

	// 当只有一个子菜单时，显示子菜单而不是父菜单
	if (showingChildren.length === 1) {
		return true
	}

	// 如果没有子菜单，显示父菜单
	if (showingChildren.length === 0) {
		onlyOneChild.value = { ...parent!, path: '' }
		return true
	}

	return false
}

// 解析完整路径
const resolvePath = (routePath: string): string => {
	if (isExternalLink(routePath)) {
		return routePath
	}

	if (isExternalLink(props.basePath)) {
		return props.basePath
	}

	// 处理绝对路径
	if (routePath.startsWith('/')) {
		return routePath
	}

	// 拼接相对路径
	return `${props.basePath}/${routePath}`.replace(/\/+/g, '/')
}

// 判断是否为外部链接
const isExternalLink = (path: string): boolean => {
	return /^(https?:|mailto:|tel:)/.test(path)
}

// 处理外部链接点击
const handleExternalLink = (url: string) => {
	window.open(url, '_blank')
}
</script>

<template>
	<template v-if="!item.meta?.hidden">
		<!-- 单个菜单项 - 没有子菜单或只有一个子菜单且不强制显示父级 -->
		<template
			v-if="
				hasOneShowingChild(item.children, item) &&
				(!onlyOneChild?.children || onlyOneChild.meta?.noShowingChildren) &&
				!item.meta?.alwaysShow
			"
		>
			<!-- 外部链接 -->
			<el-menu-item
				v-if="onlyOneChild?.meta && isExternalLink(resolvePath(onlyOneChild.path))"
				:key="resolvePath(onlyOneChild.path)"
				:index="resolvePath(onlyOneChild.path)"
				@click="handleExternalLink(resolvePath(onlyOneChild.path))"
			>
				<el-icon v-if="onlyOneChild.meta.icon">
					<Icon :icon="onlyOneChild.meta.icon" :color="item.meta?.iconColor" />
				</el-icon>
				<template #title>
					<span class="tooltip-container">
						<TextTooltip :content="onlyOneChild.meta.title" :line-clamp="1">
							{{ onlyOneChild.meta.title }}
						</TextTooltip>
					</span>
				</template>
			</el-menu-item>

			<!-- 内部路由 -->
			<el-menu-item
				v-else
				:key="resolvePath(onlyOneChild?.path || item.path)"
				:index="resolvePath(onlyOneChild?.path || item.path)"
			>
				<el-icon v-if="(onlyOneChild?.meta || item.meta)?.icon">
					<Icon
						:icon="(onlyOneChild?.meta || item.meta)?.icon"
						:color="item.meta?.iconColor"
					/>
				</el-icon>

				<template #title>
					<span class="tooltip-container">
						<TextTooltip
							:content="(onlyOneChild?.meta || item.meta)?.title + ''"
							:line-clamp="1"
						>
							{{ (onlyOneChild?.meta || item.meta)?.title }}
						</TextTooltip>
					</span>
				</template>
			</el-menu-item>
		</template>

		<!-- 有多个子菜单的情况 -->
		<el-sub-menu
			v-else
			:key="item.path"
			:index="hasOneShowingChild(visibleChildren, item) ? basePath : resolvePath(item.path)"
		>
			<template #title>
				<el-icon v-if="item.meta?.icon">
					<Icon :icon="item.meta?.icon" :color="item.meta?.iconColor" />
				</el-icon>

				<span class="tooltip-container">
					<TextTooltip :content="item.meta?.title + ''" :line-clamp="1">
						{{ item.meta?.title }}
					</TextTooltip>
				</span>
			</template>

			<!-- 递归渲染子菜单 -->
			<SidebarItem
				v-for="child in visibleChildren"
				:key="child.path"
				:item="child"
				:base-path="
					hasOneShowingChild(child.children, child) ? basePath : resolvePath(child.path)
				"
			/>
		</el-sub-menu>
	</template>
</template>

<style scoped lang="scss">
/* 针对 el-menu-item 中的图标 */
.el-menu-item:hover .el-icon {
	transform: scale(1.1);
	transition: transform 100ms;
}

/* 针对 el-sub-menu 中的图标 */
.el-sub-menu__title:hover .el-icon {
	transform: scale(1.1);
	transition: transform 100ms;
}

.tooltip-container {
	width: 80%;
}

:deep(.el-tooltip__trigger) {
	cursor: pointer !important;
}
</style>
