<script setup lang="ts">
import { ref, watch } from 'vue'
import { formRules } from '../utils/rule'
import type { FormProps } from '../utils/types'
import { pageCategory } from '@/api/dine/Category.ts'
import { pageStore } from '@/api/dine/Store.ts'
import { RecommendEnum, StatusEnum } from '@/api/types/Enums.ts'

const {
	formInline = {
		storeId: '',
		categoryId: '',
		name: '',
		image: '',
		images: [],
		description: '',
		price: 0,
		labels: [],
		recommend: RecommendEnum.NORMAL,
		cookingTime: 0,
		unit: '份',
		sort: 0,
		status: StatusEnum.ENABLE,
	},
} = defineProps<FormProps>()

const ruleFormRef = ref()
const newFormInline = ref(JSON.parse(JSON.stringify(formInline)))
const categorySelectKey = ref(0)
const imageInput = ref('')

const fetchStores = async (params: any) => {
	return pageStore(params)
}

const fetchCategories = async (params: any) => {
	return pageCategory({
		...params,
		storeId: newFormInline.value.storeId,
	})
}

const addImage = () => {
	const url = imageInput.value.trim()
	if (!url) return
	newFormInline.value.images = [...(newFormInline.value.images ?? []), url]
	imageInput.value = ''
}

const removeImage = (index: number) => {
	newFormInline.value.images.splice(index, 1)
}

watch(
	() => newFormInline.value.storeId,
	(newStoreId, oldStoreId) => {
		if (oldStoreId !== undefined && newStoreId !== oldStoreId) {
			newFormInline.value.categoryId = ''
			categorySelectKey.value++
		}
	},
)

defineExpose({
	getRef: () => ruleFormRef.value,
	getData: () => newFormInline,
})
</script>

<template>
	<el-form ref="ruleFormRef" :model="newFormInline" :rules="formRules" label-width="96px">
		<el-form-item label="所属门店" prop="storeId">
			<remote-select-v2
				v-model="newFormInline.storeId"
				:fetch-function="fetchStores"
				placeholder="请选择所属门店"
				class="w-full"
				clearable
			/>
		</el-form-item>

		<el-form-item label="菜单分类" prop="categoryId">
			<remote-select-v2
				:key="categorySelectKey"
				v-model="newFormInline.categoryId"
				:fetch-function="fetchCategories"
				placeholder="请选择菜单分类"
				class="w-full"
				clearable
				:disabled="!newFormInline.storeId"
			/>
		</el-form-item>

		<el-form-item label="菜品名称" prop="name">
			<el-input v-model="newFormInline.name" clearable placeholder="请输入菜品名称" />
		</el-form-item>

		<el-form-item label="封面图" prop="image">
			<div class="image-field">
				<el-input v-model="newFormInline.image" clearable placeholder="请输入封面图 URL" />
				<el-image
					v-if="newFormInline.image"
					:src="newFormInline.image"
					fit="cover"
					class="image-preview"
					:preview-src-list="[newFormInline.image]"
					preview-teleported
				/>
			</div>
		</el-form-item>

		<el-form-item label="菜品图集" prop="images">
			<div class="gallery-field">
				<div class="gallery-input">
					<el-input
						v-model="imageInput"
						clearable
						placeholder="请输入图集图片 URL"
						@keyup.enter="addImage"
					/>
					<el-button type="primary" @click="addImage">添加</el-button>
				</div>
				<div v-if="newFormInline.images?.length" class="gallery-list">
					<div
						v-for="(item, index) in newFormInline.images"
						:key="`${item}-${index}`"
						class="gallery-item"
					>
						<el-image
							:src="item"
							fit="cover"
							class="gallery-image"
							:preview-src-list="newFormInline.images"
							:initial-index="index"
							preview-teleported
						/>
						<el-button circle size="small" type="danger" @click="removeImage(index)">
							<Icon icon="ep:delete" />
						</el-button>
					</div>
				</div>
			</div>
		</el-form-item>

		<el-form-item label="菜品价格" prop="price">
			<el-input-number
				v-model="newFormInline.price"
				class="!w-full"
				:min="0"
				:precision="2"
				controls-position="right"
			/>
		</el-form-item>

		<el-form-item label="菜品标签" prop="labels">
			<el-select
				v-model="newFormInline.labels"
				multiple
				filterable
				allow-create
				default-first-option
				class="w-full"
				placeholder="请输入或选择标签"
			/>
		</el-form-item>

		<el-form-item label="推荐状态" prop="recommend">
			<el-radio-group v-model="newFormInline.recommend">
				<el-radio-button :value="RecommendEnum.NORMAL">普通</el-radio-button>
				<el-radio-button :value="RecommendEnum.RECOMMEND">推荐</el-radio-button>
			</el-radio-group>
		</el-form-item>

		<el-form-item label="烹饪时间" prop="cookingTime">
			<el-input-number
				v-model="newFormInline.cookingTime"
				class="!w-full"
				:min="0"
				:max="9999"
				controls-position="right"
			/>
		</el-form-item>

		<el-form-item label="售卖单位" prop="unit">
			<el-input
				v-model="newFormInline.unit"
				clearable
				placeholder="请输入售卖单位，如份、杯、盘"
			/>
		</el-form-item>

		<el-form-item label="排序值" prop="sort">
			<el-input-number
				v-model="newFormInline.sort"
				class="!w-full"
				:min="0"
				:max="9999"
				controls-position="right"
			/>
		</el-form-item>

		<el-form-item label="菜品状态" prop="status">
			<el-radio-group v-model="newFormInline.status">
				<el-radio-button :value="StatusEnum.ENABLE">启用</el-radio-button>
				<el-radio-button :value="StatusEnum.DISABLE">禁用</el-radio-button>
			</el-radio-group>
		</el-form-item>

		<el-form-item label="菜品描述" prop="description">
			<el-input
				v-model="newFormInline.description"
				type="textarea"
				:rows="4"
				maxlength="500"
				show-word-limit
				placeholder="请输入菜品描述"
			/>
		</el-form-item>
	</el-form>
</template>

<style scoped>
.image-field,
.gallery-field {
	width: 100%;
}

.image-preview {
	width: 96px;
	height: 96px;
	margin-top: 10px;
	border-radius: 6px;
}

.gallery-input {
	display: flex;
	gap: 8px;
	width: 100%;
}

.gallery-list {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-top: 10px;
}

.gallery-item {
	position: relative;
	width: 96px;
	height: 96px;
}

.gallery-image {
	width: 96px;
	height: 96px;
	border-radius: 6px;
}

.gallery-item .el-button {
	position: absolute;
	top: 4px;
	right: 4px;
}
</style>
