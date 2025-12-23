<script setup lang="ts">
import { type FieldDefinition, type FormConfig, isLayoutField } from '@/components/FormDesigner'
import { computed } from 'vue'
import FieldViewer from './FieldViewer.vue'
import LayoutViewer from './LayoutViewer.vue'

const props = defineProps<{
	formData: any
	field: FieldDefinition
	formConfig: FormConfig
}>()

const isLayout = computed(() => isLayoutField(props.field))
</script>

<template>
	<div>
		<LayoutViewer v-if="isLayout" :form-data="formData" :field="field" :form-config="formConfig" />
		<FieldViewer v-else :form-data="formData" :field="field" :form-config="formConfig" />
	</div>
</template>

<style scoped></style>
