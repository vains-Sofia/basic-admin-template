<script setup lang="ts">
import { h, ref } from 'vue'
import { openDrawer } from '@/components/CommonDrawer'
import SmartTable from '@/views/components/SmartTable.vue'
import SmartTableV2 from '@/views/components/SmartTableV2.vue'
import StandardForm from '@/views/components/StandardForm.vue'
import DialogForm from '@/views/components/StandardForm.vue'

const openDrawer1 = () => {
	openDrawer({
		title: '抽屉',
		content: '123',
		bodyPadding: 30
	})
}
const openDrawer2 = () => {
	openDrawer({
		title: '表格抽屉',
		size: '50%',
		content: h(SmartTable),
	})
}
const openDrawer3 = () => {
	openDrawer({
		resizable: true,
		title: '虚拟表格抽屉',
		size: '50%',
		content: h(SmartTableV2),
	})
}

const formRef = ref<InstanceType<typeof DialogForm>>()
const openDrawer4 = () => {
	openDrawer({
		title: '表单抽屉',
		bodyPadding: 20,
		confirmLoading: true,
		props: {
			formInline: {
				name: '外部传入数据给表单',
				region: '',
				date1: '',
				date2: '',
				delivery: true,
				type: [],
				resource: '',
				desc: '测试通过Drawer的props属性传入',
			},
		},
		content: () => h(StandardForm, { ref: formRef }),
		onConfirm: async (close) => {
			console.log(formRef.value?.getData())
			await new Promise((resolve) => setTimeout(resolve, 2000))
			close()
		},
	})
}
</script>

<template>
	<div class="p-5">
		<el-button plain @click="openDrawer1">打开抽屉</el-button>
		<el-button plain @click="openDrawer2">表格抽屉</el-button>
		<el-button plain @click="openDrawer3">虚拟表格抽屉</el-button>
		<el-button plain @click="openDrawer4">表单抽屉</el-button>
	</div>
</template>

<style scoped></style>
