<template>
	<div class="field-item-wrapper">
		<!-- 布局字段 -->
		<LayoutRenderer
			v-if="isLayout"
			:layout="field"
			:form-schema="formSchema"
			:selected="selectedFieldId === field.fieldId"
			:selected-field-id="selectedFieldId"
			@select="emit('select-layout', $event)"
			@delete="emit('delete-layout', $event)"
			@children-update="onChildrenUpdate"
			@field-add="onFieldAdd"
			@field-click="emit('field-click', $event)"
			@field-delete="emit('field-delete', $event)"
		/>

		<!-- 普通字段 -->
		<FieldRenderer
			v-else
			:field="field"
			:form-schema="formSchema"
			:selected="selectedFieldId === field.fieldId"
			@field-click="emit('field-click', $event)"
			@field-delete="emit('field-delete', $event)"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LayoutRenderer from './LayoutRenderer.vue'
import FieldRenderer from './FieldRenderer.vue'
import type { FieldDefinition, FormSchema } from '../types.ts'
import { isLayoutField } from '../types.ts'

const props = defineProps<{
	field: FieldDefinition
	selectedFieldId: string | undefined
	formSchema: FormSchema
}>()

const emit = defineEmits([
	'field-click',
	'field-delete',
	'select-layout',
	'delete-layout',
	'children-update',
	'field-add',
])

const isLayout = computed(() => isLayoutField(props.field))

function onChildrenUpdate(layoutId: string, children: FieldDefinition[]) {
	emit('children-update', layoutId, children)
}

function onFieldAdd(field: FieldDefinition) {
	emit('field-add', field)
}
</script>
