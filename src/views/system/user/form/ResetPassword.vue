<script setup lang="ts">
import { ref } from 'vue'

const {
	formInline = {
		password: ''
	}
} = defineProps<{
	formInline: {
		password: string
	}
}>()

const newFormInline = ref(formInline)

</script>

<template>
	<div>
		<el-form v-model="newFormInline">
			<el-input
				v-model="newFormInline.password"
				style="width: 100%"
				type="password"
				placeholder="请输入新的密码"
				show-password
			/>
		</el-form>
	</div>
</template>

<style scoped></style>
