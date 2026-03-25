<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getRoleIds } from '@/api/system/User.ts'
import type { RoleFormProps } from '@/views/system/user/utils/types.ts'

const {
	formInline = {
		userId: '',
		allRoles: [],
		userRoles: [],
	},
} = defineProps<RoleFormProps>()

const newFormInline = ref(formInline)

const loading = ref(false)
onMounted(() =>
	{
		loading.value = true
		getRoleIds(newFormInline.value.userId).then(
			(roleIds) => (newFormInline.value.userRoles = roleIds),
		).finally(() => loading.value = false)
	}
)
</script>

<template>
	<div>
		<el-transfer
			v-loading="loading"
			v-model="newFormInline.userRoles"
			filterable
			:props="{
			  key: 'id',
			  label: 'name',
			}"
			:titles="['所有角色', '用户角色']"
			:data="newFormInline.allRoles"
			filter-placeholder="搜索角色"
		>
			<template #left-empty>
				<el-empty :image-size="60" :description="newFormInline.allRoles ? '用户拥有全部角色' : '无角色，请在角色管理中添加角色'" />
			</template>
			<template #right-empty>
				<el-empty :image-size="60" description="当前用户没有角色" />
			</template>
		</el-transfer>
	</div>
</template>

<style scoped></style>
