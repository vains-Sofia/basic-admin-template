<script setup lang="ts">
import { computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import TextTooltip from '@/components/TextTooltip'

interface Props {
	item: RouteRecordRaw
	basePath: string
}

const props = defineProps<Props>()

// 判断是否外链
const isExternalLink = (path: string) => /^(https?:|mailto:|tel:)/.test(path)
const handleExternalLink = (url: string) => window.open(url, '_blank')

// 解析路径
const resolvePath = (routePath: string): string => {
	if (isExternalLink(routePath)) return routePath
	if (isExternalLink(props.basePath)) return props.basePath
	if (routePath.startsWith('/')) return routePath
	return `${props.basePath}/${routePath}`.replace(/\/+/g, '/')
}

// ----------------- 菜单分类逻辑 -----------------

// 所有子节点
const children = computed(() => props.item.children || [])

// showLink 的可见子菜单
const visibleChildren = computed(() => children.value.filter((c) => c.meta?.showLink))

// 是否存在任何子节点
const hasChildren = computed(() => children.value.length > 0)

// 是否有可见子节点
const hasVisibleChildren = computed(() => visibleChildren.value.length > 0)

// 单子菜单模式（典型场景：只显示 1 项，不做下拉）
const onlyOneChild = computed<RouteRecordRaw | null>(() => {
	if (visibleChildren.value.length === 1 && !visibleChildren.value[0].meta?.showParent) {
		return visibleChildren.value[0]
	}
	return null
})

// 解析父节点最终应该渲染的形态
const menuType = computed(() => {
	if (!hasChildren.value) return 'single' // 无 children → el-menu-item
	if (onlyOneChild.value) return 'single-with-child' // 仅 1 个可见子节点 → 单节点模式
	if (hasVisibleChildren.value) return 'submenu' // 多个可见子节点 → 下拉菜单
	return 'single' // 有 children 但全隐藏 → 单节点
})
</script>

<template>
	<template v-if="item.meta?.showLink">
		<!-- ①【无 children / 有但全隐藏 / 1 可见子节点】都视为单菜单处理 -->
		<el-menu-item
			v-if="menuType !== 'submenu'"
			:index="resolvePath(onlyOneChild?.path || item.path)"
			@click="
				isExternalLink(resolvePath(onlyOneChild?.path || item.path))
					? handleExternalLink(resolvePath(onlyOneChild?.path || item.path))
					: null
			"
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
						placement="right"
					>
						{{ (onlyOneChild?.meta || item.meta)?.title }}
					</TextTooltip>
				</span>
			</template>
		</el-menu-item>

		<!-- ②【多个可见子节点 → 下拉菜单】 -->
		<el-sub-menu v-else :index="resolvePath(item.path)">
			<template #title>
				<el-icon v-if="item.meta?.icon">
					<Icon :icon="item.meta?.icon" :color="item.meta?.iconColor" />
				</el-icon>

				<span class="tooltip-container">
					<TextTooltip :content="item.meta?.title" :line-clamp="1">
						{{ item.meta?.title }}
					</TextTooltip>
				</span>
			</template>

			<SidebarItem
				v-for="child in visibleChildren"
				:key="child.path"
				:item="child"
				:base-path="resolvePath(item.path)"
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
