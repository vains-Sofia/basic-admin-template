<script setup lang="ts">
import { ref } from 'vue'
import { formRules } from '../utils/rule'
import type { FormProps } from '../utils/types'
import { pageStore } from '@/api/dine/Store.ts'
import { StatusEnum } from '@/api/types/Enums.ts'

const {
	formInline = {
		storeId: undefined,
		name: '',
		sort: 0,
		status: StatusEnum.ENABLE,
	},
} = defineProps<FormProps>()

const ruleFormRef = ref()
const newFormInline = ref(JSON.parse(JSON.stringify(formInline)))

const fetchStores = async (params: any) => {
	return pageStore(params)
}

defineExpose({
	getRef: () => ruleFormRef.value,
	getData: () => newFormInline,
})
</script>

<template>
	<el-form ref="ruleFormRef" :model="newFormInline" :rules="formRules" label-width="96px">
		<el-form-item label="所属门店" prop="storeId">
			<remote-select-v2
				v-model="newFormInline.storeId"
				:fetch-function="fetchStores"
				placeholder="请选择所属门店"
				class="w-full"
				clearable
			/>
		</el-form-item>
		<el-form-item label="分类名称" prop="name">
			<el-input v-model="newFormInline.name" clearable placeholder="请输入分类名称" />
		</el-form-item>
		<el-form-item label="排序值" prop="sort">
			<el-input-number
				v-model="newFormInline.sort"
				class="!w-full"
				:min="0"
				:max="9999"
				controls-position="right"
			/>
		</el-form-item>
		<el-form-item label="分类状态" prop="status">
			<el-radio-group v-model="newFormInline.status">
				<el-radio-button :value="StatusEnum.ENABLE">启用</el-radio-button>
				<el-radio-button :value="StatusEnum.DISABLE">禁用</el-radio-button>
			</el-radio-group>
		</el-form-item>
	</el-form>
</template>
