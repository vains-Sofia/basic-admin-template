<script setup lang="ts">
import { computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import TextTooltip from '@/components/TextTooltip'

interface Props {
	item: RouteRecordRaw
	basePath: string
}

const props = defineProps<Props>()

// 可见的子菜单项
const visibleChildren = computed(() => {
	return props.item.children?.filter((child) => child.meta?.showLink) || []
})

// 只有一个可见子菜单时
const onlyOneChild = computed<RouteRecordRaw | null>(() => {
	const showingChildren = visibleChildren.value
	if (showingChildren.length === 1) {
		return showingChildren[0]
	}
	if (showingChildren.length === 0) {
		return { ...props.item, path: '' }
	}
	return null
})

// 是否只有一个可显示子菜单
const hasOneShowingChild = computed(() => !!onlyOneChild.value)

// 解析完整路径
const resolvePath = (routePath: string): string => {
	if (isExternalLink(routePath)) return routePath
	if (isExternalLink(props.basePath)) return props.basePath
	if (routePath.startsWith('/')) return routePath
	return `${props.basePath}/${routePath}`.replace(/\/+/g, '/')
}

// 判断是否为外部链接
const isExternalLink = (path: string): boolean => /^(https?:|mailto:|tel:)/.test(path)

// 处理外部链接点击
const handleExternalLink = (url: string) => window.open(url, '_blank')
</script>

<template>
	<template v-if="item.meta?.showLink">
		<!-- 单个菜单项 -->
		<template
			v-if="
				hasOneShowingChild && (!onlyOneChild?.children ||
				onlyOneChild?.children?.length === 0 ||
				onlyOneChild?.meta?.noShowingChildren ||
				!item.meta?.showParent)
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
						<TextTooltip :content="onlyOneChild.meta.title" :line-clamp="1" placement="right">
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
							:content="(onlyOneChild?.meta || item.meta)?.title"
							:line-clamp="1"
						>
							{{ (onlyOneChild?.meta || item.meta)?.title }}
						</TextTooltip>
					</span>
				</template>
			</el-menu-item>
		</template>

		<!-- 多子菜单 -->
		<el-sub-menu
			v-else
			:key="item.path"
			:index="hasOneShowingChild ? basePath : resolvePath(item.path)"
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
				:base-path="basePath"
			/>
		</el-sub-menu>
	</template>
</template>

<style scoped lang="scss">
.el-menu-item:hover .el-icon,
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
