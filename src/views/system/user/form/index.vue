<script setup lang="ts">
import { ref } from 'vue'
import Plus from '~icons/ep/plus'
import { formRules } from '../utils/rule'
import type { FormProps } from '../utils/types'
import { dictItems } from '@/api/system/Dict'
import { useUser } from '@/views/system/user/utils/hooks.tsx'

const {
	formInline = {
		title: '新增',
		higherDeptOptions: [],
		parentId: 0,
		nickname: '',
		username: '',
		password: '',
		phoneNumber: '',
		email: '',
		gender: '',
		address: '',
		birthdate: '',
		picture: '',
	},
} = defineProps<FormProps>()

// 0未知的性别、1男性、2女性、9未说明的性别
const sexOptions = ref()
dictItems('GENDER').then((res) => {
	sexOptions.value = res
})
const ruleFormRef = ref()
const newFormInline = ref(JSON.parse(JSON.stringify(formInline)))
newFormInline.value.gender = formInline.gender !== null ? String(formInline.gender) : ''

function getRef() {
	return ruleFormRef.value
}

const disabledDate = (time: Date) => {
	return time.getTime() > Date.now()
}

const { handleUpload } = useUser()

defineExpose({
	getRef,
	getData: () => newFormInline,
})
</script>

<template>
	<el-form ref="ruleFormRef" :model="newFormInline" :rules="formRules" label-width="90px">
		<el-row :gutter="30">
			<el-col :value="12" :xs="24" :sm="24">
				<el-form-item label="用户头像" prop="picture">
					<el-upload
						class="avatar-uploader"
						action="#"
						:show-file-list="false"
						:before-upload="(file) => handleUpload(file, newFormInline, false)"
					>
						<img alt="" v-if="newFormInline.picture" :src="newFormInline.picture" class="avatar" />
						<el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
					</el-upload>
				</el-form-item>
			</el-col>
			<el-col :value="12" :xs="24" :sm="24">
				<el-form-item label="用户昵称" prop="nickname">
					<el-input
						v-model="newFormInline.nickname"
						clearable
						placeholder="请输入用户昵称"
					/>
				</el-form-item>
			</el-col>
			<el-col :value="12" :xs="24" :sm="24">
				<el-form-item label="用户账号" prop="username">
					<el-input
						v-model="newFormInline.username"
						clearable
						placeholder="请输入用户账号"
					/>
				</el-form-item>
			</el-col>

			<el-col :value="12" :xs="24" :sm="24">
				<el-form-item
					label="用户密码"
					:prop="newFormInline.title !== '新增' ? '' : 'password'"
				>
					<el-input
						v-model="newFormInline.password"
						clearable
						:disabled="newFormInline.title !== '新增'"
						placeholder="请输入用户密码"
					/>
				</el-form-item>
			</el-col>
			<el-col :value="12" :xs="24" :sm="24">
				<el-form-item label="手机号" prop="phoneNumber">
					<el-input
						v-model="newFormInline.phoneNumber"
						clearable
						placeholder="请输入手机号"
					/>
				</el-form-item>
			</el-col>

			<el-col :value="12" :xs="24" :sm="24">
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="newFormInline.email" clearable placeholder="请输入邮箱" />
				</el-form-item>
			</el-col>
			<el-col :value="12" :xs="24" :sm="24">
				<el-form-item label="用户性别">
					<el-select
						v-model="newFormInline.gender"
						placeholder="请选择用户性别"
						class="w-full"
						clearable
					>
						<el-option
							v-for="(item, index) in sexOptions"
							:key="index"
							:label="item.itemName"
							:value="item.itemCode"
						/>
					</el-select>
				</el-form-item>
			</el-col>
			<el-col :value="12" :xs="24" :sm="24">
				<el-form-item label="用户生日">
					<el-date-picker
						v-model="newFormInline.birthdate"
						type="date"
						placeholder="请选择用户生日"
						format="YYYY-MM-DD"
						value-format="YYYY-MM-DD"
						:disabled-date="disabledDate"
					/>
				</el-form-item>
			</el-col>

			<el-col>
				<el-form-item label="地址">
					<el-input
						v-model="newFormInline.address"
						placeholder="请输入地址"
						type="textarea"
					/>
				</el-form-item>
			</el-col>
		</el-row>
	</el-form>
</template>

<style scoped>
.avatar-uploader .avatar {
	width: 130px;
	height: 130px;
	display: block;
}
::v-deep(.avatar-uploader .el-upload) {
	border-radius: 6px;
	cursor: pointer;
	position: relative;
	overflow: hidden;
	border: 1px dashed var(--el-border-color);
	transition: var(--el-transition-duration-fast);
}

::v-deep(.avatar-uploader .el-upload:hover) {
	border-color: var(--el-color-primary);
}

::v-deep(.el-icon.avatar-uploader-icon) {
	font-size: 28px;
	color: #8c939d;
	width: 130px;
	height: 130px;
	text-align: center;
}
</style>
