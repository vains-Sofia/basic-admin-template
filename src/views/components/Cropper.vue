<template>
	<div style="padding: 24px">
		<div class="flex gap-3">
			<el-button type="primary" @click="visible = true">打开裁剪器</el-button>
			<el-upload
				accept="image/*"
				:show-file-list="false"
				:before-upload="handleUpload"
			>
				<el-button type="primary">上传后剪裁</el-button>
			</el-upload>
		</div>

		<el-dialog title="图片裁剪" v-model="visible" width="900px">
			<ImageCropper
				v-model="rawImage"
				@update:blob="blob = $event"
				@update:url="preview = $event"
				:width="400"
				:height="400"
				:aspect-ratio="1"
			/>

			<template #footer>
				<el-button @click="visible = false">取消</el-button>
				<el-button type="primary" @click="saveImage">保存</el-button>
			</template>
		</el-dialog>

		<el-dialog title="图片裁剪" v-model="fileVisible" width="900px">
			<ImageCropper
				v-model="file"
				@update:blob="blob = $event"
				@update:url="preview = $event"
				:aspect-ratio="1"
			/>

			<template #footer>
				<el-button @click="fileVisible = false">取消</el-button>
				<el-button type="primary" @click="saveImage">保存</el-button>
			</template>
		</el-dialog>

		<div v-if="preview" style="margin-top: 20px">
			<h3>最终图片预览：</h3>
			<img :src="preview" style="width: 300px; border-radius: 6px" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImageCropper from '@/components/ImageCropper'

const visible = ref(false)
const fileVisible = ref(false)
const rawImage = ref<string>('')
const preview = ref<string>('')
const blob = ref<Blob | null>(null)
const file = ref<File>()

const saveImage = () => {
	if (!blob.value) return

	preview.value = URL.createObjectURL(blob.value)
	console.log(preview.value)

	visible.value = false
}

const handleUpload = (uploadFile: File) => {
	file.value = uploadFile
	fileVisible.value = true

	return false
}
</script>
