<template>
	<div class="component-library" ref="containerRef" :style="{ height: `${containerHeight}px` }">
		<div class="library-header">
			<h3>组件库</h3>
		</div>
		<!-- 使用 Element Plus Scrollbar 组件 -->
		<el-scrollbar class="library-content" view-class="library-content-view">
			<div v-for="category in categories" :key="category.key" class="category-section">
				<div class="category-title">{{ category.label }}</div>
				<!-- 使用 vue.draggable.next 的 draggable 组件 -->
				<draggable
					:list="category.fields"
					:group="{ name: 'form-designer', pull: 'clone', put: false }"
					:sort="false"
					:clone="cloneField"
					item-key="type"
					class="component-list"
				>
					<template #item="{ element }">
						<div class="component-item">
							<Icon :icon="element.icon" class="component-icon" />
							<span class="component-label">{{ element.labelCn }}</span>
						</div>
					</template>
				</draggable>
			</div>
		</el-scrollbar>
		<slot name="library-footer" class="library-footer"></slot>
	</div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import draggable from 'vuedraggable'
import type { FieldTypeConfig } from '../types.ts'
import { useDebounce } from '@/hooks/useDebounce.ts'
import { getContainerHeight } from '@/utils/Common.ts'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getFieldTypesByCategory } from '../fieldRegistry.ts'

// 分类列表配置
const categories = computed(() => [
	{
		key: 'basic',
		label: '基础字段',
		fields: getFieldTypesByCategory('basic'),
	},
	{
		key: 'selector',
		label: '选择器',
		fields: getFieldTypesByCategory('selector'),
	},
	{
		key: 'datetime',
		label: '日期时间',
		fields: getFieldTypesByCategory('datetime'),
	},
	{
		key: 'advanced',
		label: '高级组件',
		fields: getFieldTypesByCategory('advanced'),
	},
	{
		key: 'layout',
		label: '布局容器',
		fields: getFieldTypesByCategory('layout'),
	},
])

// 克隆字段配置（用于从组件库拖拽）
function cloneField(fieldType: FieldTypeConfig): FieldTypeConfig {
	return JSON.parse(JSON.stringify(fieldType))
}

// 容器实例
const containerRef = ref<HTMLDivElement>()

// 容器高度
const containerHeight = ref()
// 计算容器高度，防抖
const initContainerHeight = useDebounce(() => {
	containerHeight.value = getContainerHeight(containerRef)
})
onMounted(() => {
	containerHeight.value = getContainerHeight(containerRef)
	window.addEventListener('resize', initContainerHeight)
})

onUnmounted(() => {
	window.removeEventListener('resize', initContainerHeight)
})
</script>

<style scoped lang="scss">
.component-library {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: var(--el-bg-color);
	border-right: 1px solid var(--el-border-color);

	.library-header {
		padding: 16px;
		border-bottom: 1px solid var(--el-border-color);

		h3 {
			margin: 0;
			font-size: 16px;
			font-weight: 600;
			color: var(--el-text-color-primary);
		}
	}

	.library-content {
		flex: 1;
		padding: 12px;
	}

	.category-section {
		margin-bottom: 20px;

		&:last-child {
			margin-bottom: 0;
		}

		.category-title {
			font-size: 13px;
			font-weight: 600;
			color: var(--el-text-color-secondary);
			margin-bottom: 8px;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}

		.component-list {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}
	}

	.component-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		background: var(--el-bg-color-overlay);
		border: 1px solid var(--el-border-color);
		border-radius: 6px;
		cursor: grab;
		transition: all 0.2s;
		user-select: none;

		&:hover {
			background: var(--el-bg-color-page);
			border-color: var(--el-border-color-hover);
			transform: translateY(-1px);
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		}

		&:active {
			cursor: grabbing;
			transform: scale(0.98);
		}

		.component-icon {
			font-size: 18px;
			color: var(--el-color-primary);
		}

		.component-label {
			font-size: 14px;
			color: var(--el-text-color-regular);
		}
	}

	.library-footer {
		padding: 12px;
		border-top: 1px solid var(--el-border-color);
	}
}
</style>
