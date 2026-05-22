<script setup lang="ts">
import { ref } from 'vue'
import { formRules } from '../utils/rule'
import type { FormProps } from '../utils/types'

const {
	formInline = {
		title: '新增',
		groupId: '',
		name: '',
		sort: 0,
		status: 'Y',
	},
	allTypes = [],
	groupId = '',
	sort = -99,
} = defineProps<FormProps>()

const ruleFormRef = ref()
const newFormInline = ref(JSON.parse(JSON.stringify(formInline)))

if (sort !== -99 && groupId !== '-1') {
	// 添加某个字典项时，如果直接由formInline传入则无其它默认值
	newFormInline.value.groupId = groupId ?? newFormInline.value.groupId
	newFormInline.value.sort = sort ?? newFormInline.value.sort
}

const allDictTypes = ref(allTypes)

defineExpose({
	getRef: () => ruleFormRef.value,
	getData: () => newFormInline,
})
</script>

<template>
	<el-form ref="ruleFormRef" :model="newFormInline" :rules="formRules" label-width="82px">
		<el-form-item label="属性组" prop="groupId">
			<el-select
				v-model="newFormInline.groupId"
				placeholder="请选择属性组"
				class="w-full"
				clearable
			>
				<el-option
					v-for="(item, index) in allDictTypes"
					:key="index"
					:label="`${item.name}`"
					:value="item.id"
				/>
			</el-select>
		</el-form-item>
		<el-form-item label="属性名称" prop="name">
			<el-input v-model="newFormInline.name" clearable placeholder="请输入属性名称" />
		</el-form-item>
		<el-form-item label="价格调整" prop="priceAdjustment">
			<el-input-number
				v-model="newFormInline.priceAdjustment"
				class="!w-full"
				controls-position="right"
			/>
		</el-form-item>

		<el-form-item label="排序值" prop="sort">
			<el-input-number v-model="newFormInline.sort" />
		</el-form-item>
	</el-form>
</template>
