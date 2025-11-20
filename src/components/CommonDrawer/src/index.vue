<script setup lang="ts">
import { type DrawerOptions, usePluginStore } from '@/stores/Plugins.ts'
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

const drawerStore = usePluginStore()

// 加载状态映射
const loadingHash: Ref<Record<string, boolean>> = ref({})

// 点击取消按钮
const handleClose = (item: DrawerOptions, cb?: () => void) => {
	cb?.()
	drawerStore.closeDrawer(item.id)
}

// 确认按钮点击时
const confirm = (item: DrawerOptions) => {
	const current = Date.now().toString()
	if (item.confirmLoading) {
		loadingHash.value[item.id ?? current] = true
	}
	if (!item.onConfirm) return

	// 关闭当前抽屉
	const close = () => {
		drawerStore.closeDrawer(item.id)
		loadingHash.value[item.id ?? current] = false
		delete loadingHash.value[item.id ?? current]
	}

	// 关闭加载状态
	const closeLoading = () => {
		loadingHash.value[item.id ?? current] = false
		delete loadingHash.value[item.id ?? current]
	}

	item.onConfirm(close, closeLoading)
}

const clearDrawers = () => {
	drawerStore.clearDrawers()
}

onMounted(() => {
	window.addEventListener('beforeunload', clearDrawers)
})

onBeforeUnmount(() => {
	window.removeEventListener('beforeunload', clearDrawers)
})
</script>

<template>
	<el-drawer
		v-for="item in drawerStore.drawers"
		:key="item.id"
		v-bind="item"
		v-model="item.modelValue"
		class="el-drawer-common"
		:style="{ '--drawer-body-padding': `${item.bodyPadding ?? 0}px` }"
		@close="handleClose(item, item.onCancel)"
	>
		<!-- 内容区域 -->
		<template #default>
			<div v-if="typeof item.content === 'string'">
				{{ item.content }}
			</div>
			<component
				v-else-if="typeof item.content === 'function'"
				v-bind="item.props"
				:is="item.content()"
			/>
			<component v-else v-bind="item.props" :is="item.content" />
		</template>

		<!-- 底部按钮（Drawer 没有默认 footer 槽，需要自定义） -->
		<template #footer>
			<div class="flex justify-end gap-2">
				<el-button @click="handleClose(item, item.onCancel)">
					{{ item.cancelText || '取消' }}
				</el-button>
				<el-button
					type="primary"
					:loading="loadingHash[item.id ?? new Date().getTime()]"
					@click="confirm(item)"
				>
					{{ item.confirmText || '确认' }}
				</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<style lang="scss" scoped>
::v-global(.el-drawer-common .el-drawer__footer) {
	border-top: 1px solid var(--el-border-color);
	padding-bottom: calc(var(--el-drawer-padding-primary) / 2);
}
::v-global(.el-drawer-common .el-drawer__header) {
	margin-bottom: 0;
	border-bottom: 1px solid var(--el-border-color);
	padding-bottom: calc(var(--el-drawer-padding-primary) / 2);
	padding-top: calc(var(--el-drawer-padding-primary) / 2);
}
</style>
