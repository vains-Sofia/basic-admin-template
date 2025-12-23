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
								:expanded="true"
								@field-click="$emit('field-click', $event)"
								@field-delete="$emit('field-delete', $event)"
								@field-add="onFieldAdd"
								@children-update="handleChildrenUpdate"
								@select-layout="handleSelectLayout"
								@delete-layout="handleDeleteLayout"
								@toggle-layout="handleToggleLayout"
							/>
						</template>
					</draggable>
				</el-col>
			</el-row>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import draggable from 'vuedraggable'
import FieldItem from './FieldItem.vue'
import type { FieldDefinition, FormSchema } from '../types.ts'
import { generateFieldName, generateId } from '../fieldRegistry.ts'

const props = defineProps<{
	layout: FieldDefinition
	selectedFieldId: string | undefined
	expanded: boolean
	formSchema: FormSchema
}>()

const emit = defineEmits([
	'select',
	'delete',
	'toggle',
	'children-update',
	'field-click',
	'field-delete',
	'field-add',
])

// 展开的布局容器集合
const expandedLayouts = ref<Set<string>>(new Set())

const children = computed(() => props.layout.children)

const getColChildren = (colIndex: number) =>
	computed<FieldDefinition[]>({
		get: () => children.value?.[colIndex].children ?? [],
		set: (val) => {
			if (val) {
				const next = [...(children.value ?? [])]
				val.forEach((e) => (e.fieldId = generateId()))
				val.forEach(
					(e) => {
						if (!e.fieldName || !e.fieldName.startsWith(e.type)) {
							e.fieldName = generateFieldName(props.formSchema.fields, e.type, 1)
						}
					},
				)
				next[colIndex].children = val
				emit('children-update', props.layout.fieldId, next)
			}
		},
	})

const selected = computed(() => props.selectedFieldId === props.layout.fieldId)

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

function onFieldAdd(field: FieldDefinition) {
	emit('field-add', field)
}

// 处理选择布局
function handleSelectLayout(layoutId: string) {
	emit('select', layoutId)
}

function handleChildrenUpdate(layoutId: string, children: FieldDefinition[][]) {
	emit('children-update', layoutId, children)
}

// 处理删除布局
function handleDeleteLayout(layoutId: string) {
	emit('delete', layoutId)
}

// 处理切换布局展开/折叠
function handleToggleLayout(layoutId: string) {
	if (expandedLayouts.value.has(layoutId)) {
		expandedLayouts.value.delete(layoutId)
	} else {
		expandedLayouts.value.add(layoutId)
	}
	emit('toggle', layoutId)
}
</script>

<style scoped lang="scss">
.layout-container {
	border-radius: 4px;
	margin-bottom: 1px;
	border: 1px dashed var(--el-border-color);

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
			border: 1px dashed var(--el-border-color);
		}
	}
	&:hover {
		.layout-actions {
			display: flex;
		}
	}
}

.selected {
	border: 1px solid var(--el-color-primary) !important;
}
</style>
