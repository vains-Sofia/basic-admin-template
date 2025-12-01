<script setup lang="ts">
import { openDialog } from '@/components/CommonDialog'
import SmartTable from '@/views/components/SmartTable.vue'
import SmartTableV2 from '@/views/components/SmartTableV2.vue'
import DialogForm from '@/views/components/StandardForm.vue'
import QrCode from '@/views/components/QrCode.vue'
import { h, ref } from 'vue'

const openDialog1 = () => {
	openDialog({
		title: '弹框测试',
		content: '123456',
		draggable: true,
		destroyOnClose: true,
		confirmLoading: true,
		onConfirm: async (close, closeLoading) => {
			// 模拟异步请求
			await new Promise((resolve) => setTimeout(resolve, 2000))
			closeLoading()
		},
		onCancel: () => {
			console.log('cancel')
		},
	})
}

const openDialog2 = () => {
	openDialog({
		top: '10vh',
		title: '提示',
		width: '60%',
		confirmLoading: true,
		content: h(QrCode),
		props: {
			url: '123sd5f4as6d5f46sd54f65s的f4sd56f456asd4f56asd顺丰到付叫哦爱神的箭覅哦打撒',
		},
		onConfirm: async (close, closeLoading) => {
			console.log('确认啦')
			await new Promise((resolve) => setTimeout(resolve, 2000))
			closeLoading()
		},
	})
}

const openTableDialog = () => {
	openDialog({
		top: '5vh',
		title: '表格',
		width: '60%',
		content: h(SmartTable),
		onConfirm: () => {
			console.log('确认啦')
		},
	})
}

const openTableV2Dialog = () => {
	openDialog({
		top: '5vh',
		width: '80%',
		title: '虚拟表格',
		confirmLoading: true,
		draggable: true,
		content: h(SmartTableV2, { url: null }),
		onConfirm: async (close) => {
			console.log('确认啦')
			await new Promise((resolve) => setTimeout(resolve, 2000))
			close()
		},
	})
}

const formRef = ref<InstanceType<typeof DialogForm>>()

const openFormDialog = () => {
	openDialog({
		title: '表单',
		width: '60%',
		confirmLoading: true,
		draggable: true,
		props: {
			formInline: {
				name: '测试通过Dialog的props属性传入',
				region: '',
				date1: '',
				date2: '',
				delivery: true,
				type: [],
				resource: '',
				desc: 'dfasfasdf',
			},
		},
		content: () => h(DialogForm, { ref: formRef }),
		onConfirm: async (close, closeLoading) => {
			console.log(formRef.value)
			console.log(formRef.value?.getRef())
			console.log(formRef.value?.getData())
			console.log(formRef.value?.getData().name)
			console.log('确认啦')
			await new Promise((resolve) => setTimeout(resolve, 1000))
			close()
			closeLoading()
		},
	})
}
</script>

<template>
	<div class="p-5">
		<el-button plain @click="openDialog1()">打开弹框</el-button>
		<el-button plain @click="openDialog2()">打开弹框2</el-button>
		<el-button plain @click="openTableDialog()">表格弹窗</el-button>
		<el-button plain @click="openTableV2Dialog()">虚拟表格弹窗</el-button>
		<el-button plain @click="openFormDialog()">表单弹窗</el-button>
	</div>
</template>

<style scoped></style>
