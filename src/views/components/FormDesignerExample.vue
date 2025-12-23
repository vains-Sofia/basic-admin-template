<template>
	<div class="bg-[var(--el-bg-color)] p-8">
		<FormViewer ref="formViewerRef" :form-json="formSchema" />
		<div class="pl-[125px]">
			<el-button plain @click="() => formViewerRef?.reset?.()"> 重置表单 </el-button>
			<el-button plain @click="() => formViewerRef?.validate?.()"> 验证表单 </el-button>
			<el-button plain @click="() => formViewerRef?.clearAllValidate?.()"> 清除验证 </el-button>
			<el-button plain @click="viewFormData"> 查看数据 </el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { formSchema } from './FormExample'
import { FormViewer } from '@/components/FormDesigner'
import { openDialog } from '@/components/CommonDialog'
import { CodeViewer } from '@/components/CodeViewer'

const formViewerRef = ref()

const viewFormData = () => {
	const code = JSON.stringify(formViewerRef.value?.getData(), null, 2)
	if (!code || code === '{}') {
		ElMessage.info('无数据')
		return
	}
	openDialog({
		title: '查看数据',
		content: () => h(CodeViewer, { code }),
	})
}
</script>

<style scoped lang="scss">

</style>
