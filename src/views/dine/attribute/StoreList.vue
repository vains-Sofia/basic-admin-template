<template>
	<div class="store-selector" @click="openStoreDialog">
		<div class="selector-label">当前门店</div>
		<div class="selector-content" :class="{ placeholder: !selectedStore }">
			<el-avatar v-if="selectedStore" :size="21" :src="selectedStore.logo" shape="square">
				{{ selectedStore.name.slice(0, 1) }}
			</el-avatar>
			<span class="selector-name">
				{{ selectedStore?.name || '请选择门店' }}
			</span>
			<el-icon class="selector-icon">
				<Icon icon="ep:arrow-down" />
			</el-icon>
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
.store-selector {
	padding: 10px 14px;
	background: var(--el-bg-color);
	cursor: pointer;
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease;
}

.store-selector:hover {
	border-color: var(--el-color-primary-light-5);
	box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.12);
}

.selector-label {
	font-size: 12px;
	color: var(--el-text-color-regular);
	margin-bottom: 8px;
}

.selector-content {
	display: flex;
	align-items: center;
	gap: 8px;
	min-width: 0;
	color: var(--el-text-color-primary);
}

.selector-content.placeholder {
	color: var(--el-text-color-placeholder);
}

.selector-name {
	flex: 1;
	min-width: 0;
	font-size: 14px;
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.selector-icon {
	flex-shrink: 0;
	color: var(--el-text-color-secondary);
}
</style>
