<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 定义面包屑项的类型
interface BreadcrumbItem {
	path: string | undefined
	title: string
	icon?: string | undefined
}

const route = useRoute()

// 计算面包屑列表
const breadcrumbList = computed<BreadcrumbItem[]>(() => {
	const matched = route.matched.filter((item) => item.meta?.title)
	const breadcrumbs: BreadcrumbItem[] = []

	const dashboard = matched.filter((item) => item.name === 'Dashboard')
	if (dashboard && dashboard.length) {
		return dashboard.map((e) => {
			return {
				path: e?.path,
				title: e?.meta?.title,
				icon: e?.meta?.icon,
			}
		})
	}

	// 检查matched中是否存在首页路由
	const hasHome = matched.some((item) => item.name === 'Dashboard' || item.name === 'Home')

	// 如果matched中不存在首页，添加首页
	if (!hasHome) {
		breadcrumbs.push({
			path: '/',
			title: '首页',
			icon: 'ep:home',
		})
	}

	// 添加匹配的路由
	matched.forEach((item) => {
		if (item.meta?.title) {
			// 除首页外都禁用
			const isHome = item.name === 'Home' || item.name === 'Dashboard'
			breadcrumbs.push({
				path: !isHome ? undefined : item.path,
				title: item?.meta?.title,
				icon: item?.meta?.icon,
			})
		}
	})

	return breadcrumbs
})
</script>

<template>
	<el-breadcrumb separator="/">
		<el-breadcrumb-item
			v-for="(item, index) in breadcrumbList"
			:key="item.path"
			:to="index === breadcrumbList.length - 1 ? undefined : item.path"
		>
			<div style="display: flex; align-items: center; gap: 5px">
				<Icon v-if="item.icon" :icon="item.icon" />
				{{ item.title }}
			</div>
		</el-breadcrumb-item>
	</el-breadcrumb>
</template>

<style scoped>
.el-breadcrumb {
	font-size: 14px;
}
</style>
