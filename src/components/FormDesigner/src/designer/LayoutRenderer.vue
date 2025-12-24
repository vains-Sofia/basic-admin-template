<template>
	<div
		class="layout-container"
		:class="{ selected }"
		@click.stop="handleSelectLayout(layout.fieldId)"
	>
		<div class="layout-header">
			<!--			<span>{{ layout.label }}</span>-->
			<div class="layout-actions">
				<Icon icon="ep:delete" @click.stop="$emit('delete', layout.fieldId)" />
			</div>
		</div>

		<div class="layout-body">
			<el-row v-bind="layout.layoutProps" class="pb-2">
				<el-col
					v-for="(col, i) in children"
					v-bind="col.componentProps"
					:key="col.fieldId"
					:class="{ selected: selectedFieldId === col.fieldId }"
					class="layout-col"
					@click.stop="$emit('select', col.fieldId)"
				>
					<draggable
						v-model="getColChildren(i).value"
						item-key="fieldId"
						:group="{ name: 'form-designer', pull: true, put: true }"
						style="min-height: 50px"
						@change="handleCanvasChange"
					>
						<template #item="{ element }">
							<FieldItem
								:field="element"
								:form-schema="formSchema"
								:selected-field-id="selectedFieldId"
								@field-click="$emit('field-click', $event)"
								@field-delete="$emit('field-delete', $event)"
								@field-add="onFieldAdd"
								@children-update="handleChildrenUpdate"
								@select-layout="handleSelectLayout"
								@delete-layout="handleDeleteLayout"
							/>
						</template>
					</draggable>
				</el-col>
			</el-row>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import draggable from 'vuedraggable'
import FieldItem from './FieldItem.vue'
import type { FieldDefinition, FormSchema } from '../types.ts'
import { generateFieldName, generateId } from '../fieldRegistry.ts'

const props = defineProps<{
	layout: FieldDefinition
	selectedFieldId: string | undefined
	formSchema: FormSchema
}>()

const emit = defineEmits([
	'select',
	'delete',
	'children-update',
	'field-click',
	'field-delete',
	'field-add',
])

const children = computed(() => props.layout.children)

// 获取布局子节点中对应下标的元素的子节点
const getColChildren = (colIndex: number) =>
	computed<FieldDefinition[]>({
		get: () => children.value?.[colIndex].children ?? [],
		set: (val) => {
			if (val) {
				const next = [...(children.value ?? [])]
				// 生成id和name
				val.forEach((e) => (e.fieldId = generateId()))
				val.forEach((e) => {
					// 生成过不需要生成
					if (!e.fieldName || !e.fieldName.startsWith(e.type)) {
						e.fieldName = generateFieldName(props.formSchema.fields, e.type, 1)
					}
				})
				next[colIndex].children = val
				// 触发子节点更新事件
				emit('children-update', props.layout.fieldId, next)
			}
		},
	})

// 当前Layout是否被选中
const selected = computed(() => props.selectedFieldId === props.layout.fieldId)

// 子节点内元素变更事件
function handleCanvasChange(evt: any) {
	if (evt.added) {
		const { added } = evt
		if (added.element) {
			const fieldType = added.element as FieldDefinition
			// fieldType.fieldId = generateId()
			emit('field-add', fieldType)
		}
	}
	// vuedraggable 已经更新了 localFields（通过 v-model）
}

// 布局内添加表单项
function onFieldAdd(field: FieldDefinition) {
	emit('field-add', field)
}

// 处理选择布局
function handleSelectLayout(layoutId: string) {
	emit('select', layoutId)
}

// 子节点更新事件(套娃递归)
function handleChildrenUpdate(layoutId: string, children: FieldDefinition[][]) {
	emit('children-update', layoutId, children)
}

// 处理删除布局
function handleDeleteLayout(layoutId: string) {
	emit('delete', layoutId)
}
</script>

<style scoped lang="scss">
.layout-container {
	border-radius: 4px;
	margin-bottom: 1px;
	border: 2px dashed var(--el-border-color);

	&.layout-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--el-text-color-secondary);
	}

	&.layout-hover {
		border-color: var(--el-color-primary);
		background: var(--el-color-primary-light-9);
	}

	.layout-header {
		cursor: pointer;
		position: relative;

		.layout-actions {
			position: absolute;
			top: 8px;
			left: 8px;
			display: none;
			gap: 8px;
			background: var(--el-bg-color);
			padding: 4px;
			border-radius: 4px;
			box-shadow: var(--el-box-shadow-light);
			cursor: pointer;
			z-index: 1001;
		}
	}

	.layout-body {
		z-index: 1000;
		width: 100%;

		.layout-col {
			border: 2px dashed var(--el-border-color);
		}
	}
	&:hover {
		.layout-actions {
			display: flex;
		}
	}
}

.selected {
	border: 2px solid var(--el-color-primary) !important;
}
</style>
