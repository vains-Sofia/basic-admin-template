<template>
	<div @click="openStoreDialog">
		<div class="store-item">
			<el-avatar :size="47" :src="selectedStore?.logo" shape="square">
				{{ selectedStore?.name.slice(0, 1) || '选' }}
			</el-avatar>
			<div class="store-info">
				<div class="store-name">{{ selectedStore?.name || '请选择门店' }}</div>
				<div class="store-status">
					{{ selectedStore?.address }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'

import { closeDialog, openDialog } from '@/components/CommonDialog'
import type { FindStoreResponse } from '@/api/types/StoreTypes.ts'
import StoreSelectDialog from '@/views/dine/attribute/StoreSelectDialog.vue'

const emit = defineEmits<{
	select: [store: FindStoreResponse]
}>()

const selectedStore = ref<FindStoreResponse>()

const openStoreDialog = () => {
	const dialogId = openDialog({
		title: '选择门店',
		width: '520px',
		top: '8vh',
		destroyOnClose: true,
		hideFooter: true,
		content: () =>
			h(StoreSelectDialog, {
				modelValue: selectedStore.value?.id,
				onSelect: (store: FindStoreResponse) => {
					selectedStore.value = store
					emit('select', store)
					closeDialog(dialogId)
				},
			}),
	})
}
</script>

<style scoped>
.store-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 16px;
	//margin-bottom: 8px;
	background: var(--el-fill-color-blank);
	//border-radius: 8px;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	border: 1px solid var(--el-border-color-lighter);
}

.store-item:hover {
	background: var(--el-fill-color);
	border-color: var(--el-border-color-light);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.store-info {
	flex: 1;
	min-width: 0;
	overflow: hidden;
}

.store-name {
	font-size: 14px;
	font-weight: 500;
	color: var(--el-text-color-primary);
	margin-bottom: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.store-status {
	font-size: 12px;
	color: var(--el-text-color-regular);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
