<template>
	<div class="form-designer-demo">
		<div class="designer-container">
			<FormDesigner
				ref="designerRef"
				:initial-schema="initialSchema"
				@update:schema="handleSchemaUpdate"
				@save="handleSave"
			/>
		</div>

		<!-- Demo Controls -->
		<div class="demo-controls" v-if="false">
			<el-space>
				<el-button type="primary" @click="handleLoadSampleForm">Load Sample Form</el-button>
				<el-button @click="handleGetSchema">Get Schema</el-button>
				<el-button @click="handleClearDesigner">Clear Designer</el-button>
				<el-button type="info" @click="showSchemaDialog = true">View Schema JSON</el-button>
			</el-space>
		</div>

		<!-- Schema JSON Dialog -->
		<el-dialog v-model="showSchemaDialog" title="Form Schema JSON" width="700px" top="8vh">
			<CodeViewer :code="schemaJson" />
			<template #footer>
				<el-button @click="showSchemaDialog = false">Close</el-button>
				<el-button type="primary" @click="handleCopySchema">Copy to Clipboard</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormSchema } from '@/components/FormDesigner'
import FormDesigner from '@/components/FormDesigner'

import { CodeViewer } from '@/components/CodeViewer'

const designerRef = ref<InstanceType<typeof FormDesigner>>()
const currentSchema = ref<FormSchema | null>(null)
const showSchemaDialog = ref(false)

// Initial schema (optional, for editing existing forms)
const initialSchema = ref<FormSchema | null>(null)

// Computed schema JSON
const schemaJson = computed(() => {
	return currentSchema.value ? JSON.stringify(currentSchema.value, null, 2) : ''
})

// Handle schema updates
function handleSchemaUpdate(schema: FormSchema) {
	currentSchema.value = schema
}

// Handle save
function handleSave(schema: FormSchema) {
	console.log('Form saved:', schema)
	ElMessage.success('Form schema saved!')
}

// Load a sample form for demonstration
function handleLoadSampleForm() {

	// designerRef.value?.setSchema(sampleSchema)
	ElMessage.success('Sample form loaded!')
}

// Get current schema
function handleGetSchema() {
	const schema = designerRef.value?.getSchema()
	console.log('Current schema:', schema)
	currentSchema.value = schema || null
	showSchemaDialog.value = true
}

// Clear designer
function handleClearDesigner() {
	designerRef.value?.clearForm()
}

// Copy schema to clipboard
function handleCopySchema() {
	navigator.clipboard
		.writeText(schemaJson.value)
		.then(() => {
			ElMessage.success('Schema copied to clipboard!')
		})
		.catch(() => {
			ElMessage.error('Failed to copy schema')
		})
}
</script>

<style scoped lang="scss">

</style>
