<script setup lang="ts">
import type { FieldDefinition, FormConfig } from '@/components/FormDesigner'
import { computed } from 'vue'
import FieldItemViewer from './FieldItemViewer.vue'

const props = defineProps<{
	formData: any
	field: FieldDefinition
	formConfig: FormConfig
}>()

const children = computed(() => props.field.children)

const getColChildren = (colIndex: number) =>
	computed<FieldDefinition[]>(() => children.value?.[colIndex].children ?? [])
</script>

<template>
	<div class="layout-body">
		<el-row v-bind="field.layoutProps">
			<el-col
				v-for="(col, i) in children"
				v-bind="col.componentProps"
				:key="col.fieldId"
				class="layout-col"
			>
				<FieldItemViewer
					v-for="element in getColChildren(i).value"
					:form-data="formData"
					:field="element"
					:form-config="formConfig"
					:key="element.fieldId"
				/>
			</el-col>
		</el-row>
	</div>
</template>

<style scoped></style>
