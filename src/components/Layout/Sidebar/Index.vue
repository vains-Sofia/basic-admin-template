<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import SidebarItem from './SidebarItem.vue'
import { useUserStore } from '@/stores/User'
import { useLayoutStore } from '@/stores/Layout'

const route = useRoute()

const userStore = useUserStore()

const layoutStore = useLayoutStore()
const handleOpen = (key: string, keyPath: string[]) => {
	// console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
	// console.log(key, keyPath)
}

// 当前激活的菜单项
const activeMenu = computed(() => {
	const { meta } = route
	// 若设置了 activePath，则使用 activePath，否则用当前路由 path
	return meta.activePath || route.path
})

const menuLoading = ref(true)
const menus = ref()
menus.value = userStore.getRouters()
menuLoading.value = false
</script>

<template>
	<el-scrollbar
		class="sidebar-container"
		:class="layoutStore.darkMenu ? 'dark' : 'light'"
		:style="{ backgroundColor: `${layoutStore.menuBackgroundColor}` }"
	>
		<el-menu
			router
			class="sidebar-menu"
			popper-class="el-menu-outline-none popper-hover"
			:default-active="activeMenu"
			:collapse="layoutStore.menuCollapse"
			unique-opened
			@open="handleOpen"
			@close="handleClose"
			:style="{ backgroundColor: `${layoutStore.menuBackgroundColor}` }"
		>
			<SidebarItem
				v-for="route in menus"
				:key="route.path"
				:item="route"
				:base-path="route.path"
			/>
		</el-menu>
	</el-scrollbar>
</template>

<style scoped>
.sidebar-menu {
	height: 100%;
	border-right: none;
}

.sidebar-container {
	height: calc(100vh - var(--layout-navbar-height));
	border-right: 1px solid var(--el-menu-border-color);
	transition: width var(--el-transition-duration) var(--el-transition-function-ease-in-out-bezier);
}
</style>
