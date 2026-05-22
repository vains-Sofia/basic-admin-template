<script setup lang="ts">
import { ref } from 'vue'
import Plus from '~icons/ep/plus'
import { formRules } from '../utils/rule'
import type { FormProps } from '../utils/types'
import { useStore } from '@/views/dine/store/utils/hooks.tsx'
import { StatusEnum } from '@/api/types/Enums.ts'

const {
	formInline = {
		name: '',
		logo: '',
		status: StatusEnum.ENABLE,
		address: '',
		longitude: undefined,
		latitude: undefined,
		albums: [],
		businessHours: '',
		description: '',
	},
} = defineProps<FormProps>()

const ruleFormRef = ref()
const newFormInline = ref(JSON.parse(JSON.stringify(formInline)))
const { handleUpload } = useStore(false)

if (!newFormInline.value.albums) {
	newFormInline.value.albums = []
}

const removeAlbum = (index: number) => {
	newFormInline.value.albums.splice(index, 1)
}

defineExpose({
	getRef: () => ruleFormRef.value,
	getData: () => newFormInline,
})
</script>

<template>
	<el-form ref="ruleFormRef" :model="newFormInline" :rules="formRules" label-width="96px">
		<el-form-item label="门店 Logo" prop="logo">
			<el-upload
				class="logo-uploader"
				action="#"
				accept="image/*"
				:show-file-list="false"
				:before-upload="(file) => handleUpload(file, newFormInline, false)"
			>
				<img v-if="newFormInline.logo" :src="newFormInline.logo" alt="" class="logo" />
				<el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
			</el-upload>
		</el-form-item>
		<el-form-item label="门店名称" prop="name">
			<el-input v-model="newFormInline.name" clearable placeholder="请输入门店名称" />
		</el-form-item>
		<el-form-item label="门店地址" prop="address">
			<el-input v-model="newFormInline.address" clearable placeholder="请输入门店地址" />
		</el-form-item>
		<el-row :gutter="16">
			<el-col :span="12">
				<el-form-item label="经度" prop="longitude">
					<el-input-number
						v-model="newFormInline.longitude"
						class="!w-full"
						:precision="6"
						:step="0.000001"
						controls-position="right"
					/>
				</el-form-item>
			</el-col>
			<el-col :span="12">
				<el-form-item label="纬度" prop="latitude">
					<el-input-number
						v-model="newFormInline.latitude"
						class="!w-full"
						:precision="6"
						:step="0.000001"
						controls-position="right"
					/>
				</el-form-item>
			</el-col>
		</el-row>
		<el-form-item label="商家相册" prop="albums">
			<div class="album-list">
				<div v-for="(item, index) in newFormInline.albums" :key="item" class="album-item">
					<el-image :src="item" fit="cover" :preview-src-list="newFormInline.albums" />
					<el-button class="album-remove" circle size="small" @click="removeAlbum(index)">
						<Icon icon="ep:close" />
					</el-button>
				</div>
				<el-upload
					class="album-uploader"
					action="#"
					accept="image/*"
					:show-file-list="false"
					:before-upload="(file) => handleUpload(file, newFormInline, false, 'albums')"
				>
					<el-icon class="album-uploader-icon"><Plus /></el-icon>
				</el-upload>
			</div>
		</el-form-item>
		<el-form-item label="营业时间" prop="businessHours">
			<el-input
				v-model="newFormInline.businessHours"
				clearable
				placeholder="请输入营业时间"
			/>
		</el-form-item>
		<el-form-item label="门店描述" prop="description">
			<el-input
				v-model="newFormInline.description"
				type="textarea"
				:rows="4"
				placeholder="请输入门店描述"
			/>
		</el-form-item>
		<el-form-item label="门店状态" prop="status">
			<el-radio-group v-model="newFormInline.status">
				<el-radio-button :value="StatusEnum.ENABLE">启用</el-radio-button>
				<el-radio-button :value="StatusEnum.DISABLE">禁用</el-radio-button>
			</el-radio-group>
		</el-form-item>
	</el-form>
</template>

<style scoped>
.logo-uploader .logo {
	width: 130px;
	height: 130px;
	display: block;
	object-fit: cover;
}

::v-deep(.logo-uploader .el-upload) {
	border-radius: 6px;
	cursor: pointer;
	position: relative;
	overflow: hidden;
	border: 1px dashed var(--el-border-color);
	transition: var(--el-transition-duration-fast);
}

::v-deep(.logo-uploader .el-upload:hover) {
	border-color: var(--el-color-primary);
}

::v-deep(.el-icon.logo-uploader-icon) {
	font-size: 28px;
	color: #8c939d;
	width: 130px;
	height: 130px;
	text-align: center;
}

.album-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.album-item {
	position: relative;
	width: 96px;
	height: 96px;
	overflow: hidden;
	border-radius: 6px;
	border: 1px solid var(--el-border-color);
}

.album-item .el-image {
	width: 100%;
	height: 100%;
}

.album-remove {
	position: absolute;
	top: 4px;
	right: 4px;
}

::v-deep(.album-uploader .el-upload) {
	width: 96px;
	height: 96px;
	border: 1px dashed var(--el-border-color);
	border-radius: 6px;
}

.album-uploader-icon {
	font-size: 24px;
	color: #8c939d;
}
</style>
