<script setup lang="ts">
import { ref } from 'vue'
import { formRules } from '../utils/rule.ts'
import type { FormProps } from '../utils/types.ts'

const {
	formInline = {
		id: '',
		name: '',
		code: '',
		description: '',
	},
} = defineProps<FormProps>()

const roleUpdateForm = ref()
const newFormInline = ref(JSON.parse(JSON.stringify(formInline)))

defineExpose({
	getRef: () => roleUpdateForm.value,
	getData: () => newFormInline,
})
</script>

<template>
	<el-form ref="roleUpdateForm" :model="newFormInline" :rules="formRules" label-width="82px">
		<el-form-item label="角色名称" prop="name">
			<el-input v-model="newFormInline.name" clearable placeholder="请输入角色名称" />
		</el-form-item>

		<el-form-item label="角色标识" prop="code">
			<el-input v-model="newFormInline.code" clearable placeholder="请输入角色标识" />
		</el-form-item>

		<el-form-item label="备注">
			<el-input
				v-model="newFormInline.description"
				placeholder="请输入备注信息"
				type="textarea"
			/>
		</el-form-item>
	</el-form>
</template>
