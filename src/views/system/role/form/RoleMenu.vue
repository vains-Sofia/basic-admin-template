<script setup lang="ts">
import type { RoleMenuProps } from '@/views/system/role/utils/types.ts'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { getScrollContainer, listToTree, type TreeNode } from '@/utils/Common.ts'
import { getRoleMenuIds } from '@/api/system/Permission.ts'

const {
	formInline = {
		roleId: '',
		allMenus: [],
	},
} = defineProps<RoleMenuProps>()

// 转树形结构
const treeMenus = listToTree(formInline.allMenus as TreeNode[])

const props = {
	value: 'id',
	label: 'title',
	children: 'children',
}

// 菜单实例
const treeRef = ref()
// 菜单权限容器
const menuContainer = ref()
// 容器高度
const treeHeight = ref(200)

/**
 * 计算高度
 */
const updateHeight = () => {
	const container = getScrollContainer(menuContainer.value)
	const containerHeight =
		container instanceof Window ? window.innerHeight : container.clientHeight

	// 容器高度减去输入框高度和padding值
	treeHeight.value = containerHeight - 80
}

onMounted(() => {
	getRoleMenuIds(formInline.roleId).then((menusIds) => {
		// 根据角色拥有的权限菜单设置选中状态
		treeRef.value.setCheckedKeys(menusIds)
	})

	nextTick(updateHeight)
	window.addEventListener('resize', updateHeight)
})

onUnmounted(() => {
	window.removeEventListener('resize', updateHeight)
})

defineExpose({
	getTreeRef: () => treeRef.value,
})
</script>

<template>
	<div ref="menuContainer">
		<el-input placeholder="请输入菜单进行搜索" class="mb-1" clearable />
		<el-tree-v2
			ref="treeRef"
			style="max-width: 600px"
			:data="treeMenus"
			:props="props"
			show-checkbox
			:height="treeHeight"
		/>
	</div>
</template>

<style scoped></style>
