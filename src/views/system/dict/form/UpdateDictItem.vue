<script setup lang="ts">
import { ref } from 'vue'
import { formRules } from '../utils/rule'
import type { FormProps } from '../utils/types'

const {
	formInline = {
		title: "新增",
		typeCode: "",
		itemCode: "",
		itemName: "",
		sortOrder: 0,
		i18nJson: "",
		status: "Y"
	},
	allTypes = [],
	typeCode = '',
	sortOrder = -99
} = defineProps<FormProps>()

const ruleFormRef = ref()
const newFormInline = ref(JSON.parse(JSON.stringify(formInline)))

if (sortOrder !== -99 && typeCode !== '-1') {
	// 添加某个字典项时，如果直接由formInline传入则无其它默认值
	newFormInline.value.typeCode = typeCode ?? newFormInline.value.typeCode
	newFormInline.value.sortOrder = sortOrder ?? newFormInline.value.sortOrder
}

const allDictTypes = ref(allTypes)

defineExpose({
	getRef: () => ruleFormRef.value,
	getData: () => newFormInline
})

</script>

<template>
	<el-form ref="ruleFormRef" :model="newFormInline" :rules="formRules" label-width="82px">
		<el-form-item label="字典类型" prop="typeCode">
			<el-select
				v-model="newFormInline.typeCode"
				placeholder="请选择字典类型"
				class="w-full"
				clearable
			>
				<el-option
					v-for="(item, index) in allDictTypes"
					:key="index"
					:label="`${item.typeCode + ' - ' + item.name}`"
					:value="item.typeCode"
				/>
			</el-select>
		</el-form-item>
		<el-form-item label="字典编码" prop="itemCode">
			<el-input v-model="newFormInline.itemCode" clearable placeholder="请输入字典编码" />
		</el-form-item>
		<el-form-item label="字典名称" prop="itemName">
			<el-input v-model="newFormInline.itemName" clearable placeholder="请输入字典名称" />
		</el-form-item>

		<el-form-item label="排序值" prop="sortOrder">
			<el-input-number v-model="newFormInline.sortOrder" />
		</el-form-item>
	</el-form>
</template>
