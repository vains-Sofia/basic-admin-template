<script setup lang="ts">
import { type DialogOptions, usePluginStore } from '@/stores/Plugins.ts'
import { onBeforeUnmount, onMounted, type Ref, ref } from 'vue'

const dialogStore = usePluginStore()

// 加载中
const loadingHash: Ref<Record<string, boolean>> = ref({})

// 点击取消按钮时
const handleClose = (item: DialogOptions, cb?: () => void) => {
	cb?.()
	dialogStore.closeDialog(item.id)
}

// 确认按钮点击时
const confirm = (item: DialogOptions) => {
	const current = Date.now().toString()
	if (item.confirmLoading) {
		loadingHash.value[item.id ?? current] = true
	}
	if (!item.onConfirm) {
		return
	}

	// 关闭当前弹框
	const close = () => {
		dialogStore.closeDialog(item.id)
		loadingHash.value[item.id ?? current] = false
		delete loadingHash.value[item.id ?? current]
	}

	// 关闭加载中
	const closeLoading = () => {
		loadingHash.value[item.id ?? current] = false
		delete loadingHash.value[item.id ?? current]
	}

	item.onConfirm(close, closeLoading)
}

const clearDialogs = () => {
	dialogStore.clearDialogs()
}

// 刷新处理
onMounted(() => {
	window.addEventListener('beforeunload', clearDialogs)
})

onBeforeUnmount(() => {
	window.removeEventListener('beforeunload', clearDialogs)
})
</script>

<template>
	<el-dialog
		v-for="item in dialogStore.dialogs"
		:key="item.id"
		v-bind="item"
		v-model="item.modelValue"
		@close="handleClose(item, item.onCancel)"
	>
		<!-- 内容插槽 -->
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

		<!-- 底部按钮 -->
		<template #footer v-if="!item.hideFooter">
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
		</template>
	</el-dialog>
</template>
