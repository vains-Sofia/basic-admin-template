<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { formRules } from '../utils/rule'
import { type FormProps } from '../utils/types'

import {
	fixedTagOptions,
	frameLoadingOptions,
	hiddenTagOptions,
	keepAliveOptions,
	menuTypeOptions,
	needAuthenticationOptions,
	showLinkOptions,
	showParentOptions,
} from '../utils/enums'
import { dictItems } from '@/api/system/Dict'
import InputIconSelect from '@/components/InputIconSelect'
import type { FindSysDictItemResponse } from '@/api/types/DictTypes'

const moduleNames = ref<FindSysDictItemResponse[]>([])
const requestMethods = ref<FindSysDictItemResponse[]>([])
onMounted(() => {
	dictItems('MODULE').then((res) => {
		moduleNames.value = res
	})

	dictItems('HTTP_METHOD').then((res) => {
		requestMethods.value = res
	})
})

const {
	formInline = {
		id: null,
		permissionType: 0,
		parentId: '0',
		title: '',
		name: '',
		path: '',
		component: '',
		rank: 99,
		redirect: '',
		icon: '',
		extraIcon: '',
		enterTransition: '',
		leaveTransition: '',
		activePath: '',
		permission: '',
		frameSrc: '',
		frameLoading: true,
		keepAlive: false,
		hiddenTag: false,
		fixedTag: false,
		showLink: true,
		showParent: false,
		deleted: false,
		moduleName: '',
		requestMethod: '',
		needAuthentication: true,
	},
	rank = -99,
	parentId = '-1',
	higherMenuOptions = [],
} = defineProps<FormProps>()

const ruleFormRef = ref()
const newFormInline = ref(JSON.parse(JSON.stringify(formInline)))

if (rank !== -99 && parentId !== '-1') {
	// 添加某个权限的子级时，如果直接由formInline传入则无其它默认值
	newFormInline.value.rank = rank ?? newFormInline.value.rank
	newFormInline.value.parentId = parentId ?? newFormInline.value.parentId
}
if (newFormInline.value?.children) {
	delete newFormInline.value?.children
}

defineExpose({
	getRef: () => ruleFormRef.value,
	getData: () => newFormInline,
})
</script>

<template>
	<el-form ref="ruleFormRef" :model="newFormInline" :rules="formRules" label-width="82px">
		<el-row :gutter="30">
			<el-col>
				<el-form-item label="菜单类型">
					<el-segmented
						v-model="newFormInline.permissionType"
						:options="menuTypeOptions"
					/>
				</el-form-item>
			</el-col>

			<el-col>
				<el-form-item label="上级菜单">
					<el-cascader
						v-model="newFormInline.parentId"
						class="w-full"
						:options="higherMenuOptions"
						:props="{
							value: 'id',
							label: 'title',
							emitPath: false,
							checkStrictly: true,
						}"
						clearable
						filterable
						placeholder="请选择上级菜单"
					>
						<template #default="{ node, data }">
							<span>{{ data.title }}</span>
							<span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
						</template>
					</el-cascader>
				</el-form-item>
			</el-col>

			<el-col :md="12" :xs="24" :sm="24">
				<el-form-item label="菜单名称" prop="title">
					<el-input
						v-model="newFormInline.title"
						clearable
						placeholder="请输入菜单名称"
					/>
				</el-form-item>
			</el-col>
			<el-col v-if="newFormInline.permissionType !== 3" :md="12" :xs="24" :sm="24">
				<el-form-item label="路由名称" prop="name">
					<el-input v-model="newFormInline.name" clearable placeholder="请输入路由名称" />
				</el-form-item>
			</el-col>

			<el-col :md="12" :xs="24" :sm="24">
				<el-form-item
					:label="newFormInline.permissionType !== 3 ? '路由路径' : '请求路径'"
					prop="path"
				>
					<el-input v-model="newFormInline.path" clearable placeholder="请输入路由路径" />
				</el-form-item>
			</el-col>

			<el-col v-show="newFormInline.permissionType === 0" :md="12" :xs="24" :sm="24">
				<el-form-item label="组件路径">
					<el-input
						v-model="newFormInline.component"
						clearable
						placeholder="请输入组件路径"
					/>
				</el-form-item>
			</el-col>

			<el-col :md="12" :xs="24" :sm="24">
				<el-form-item label="菜单排序">
					<el-input-number
						v-model="newFormInline.rank"
						class="!w-full"
						:min="1"
						:max="9999"
						controls-position="right"
					/>
				</el-form-item>
			</el-col>
			<el-col v-show="newFormInline.permissionType === 0" :md="12" :xs="24" :sm="24">
				<el-form-item label="路由重定向">
					<el-input
						v-model="newFormInline.redirect"
						clearable
						placeholder="请输入默认跳转地址"
					/>
				</el-form-item>
			</el-col>

			<el-col v-show="newFormInline.permissionType !== 3" :md="12" :xs="24" :sm="24">
				<el-form-item label="菜单图标">
					<InputIconSelect v-model="newFormInline.icon" input-placeholder="请选择图标" />
				</el-form-item>
			</el-col>
			<el-col v-show="newFormInline.permissionType !== 3" :md="12" :xs="24" :sm="24">
				<el-form-item label="右侧图标">
					<el-input
						v-model="newFormInline.extraIcon"
						clearable
						placeholder="菜单名称右侧的额外图标"
					/>
				</el-form-item>
			</el-col>

			<el-col v-show="newFormInline.permissionType < 2" :md="12" :xs="24" :sm="24">
				<el-form-item label="进场动画">
					<!--					<ReAnimateSelector
						v-model="newFormInline.enterTransition"
						placeholder="请选择页面进场加载动画"
					/>-->
					<el-input
						v-model="newFormInline.extraIcon"
						clearable
						placeholder="请选择页面进场加载动画"
					/>
				</el-form-item>
			</el-col>
			<el-col v-show="newFormInline.permissionType < 2" :md="12" :xs="24" :sm="24">
				<el-form-item label="离场动画">
					<!--					<ReAnimateSelector
						v-model="newFormInline.leaveTransition"
						placeholder="请选择页面离场加载动画"
					/>-->
					<el-input
						v-model="newFormInline.extraIcon"
						clearable
						placeholder="请选择页面进场加载动画"
					/>
				</el-form-item>
			</el-col>

			<el-col v-show="newFormInline.permissionType === 0" :md="12" :xs="24" :sm="24">
				<el-form-item label="菜单激活">
					<el-input
						v-model="newFormInline.activePath"
						clearable
						placeholder="请输入需要激活的菜单"
					/>
				</el-form-item>
			</el-col>
			<el-col :md="12" :xs="24" :sm="24">
				<!-- 按钮级别权限设置 -->
				<el-form-item label="权限标识" prop="permission">
					<el-input
						v-model="newFormInline.permission"
						clearable
						placeholder="请输入权限标识"
					/>
				</el-form-item>
			</el-col>

			<el-col :md="12" :xs="24" :sm="24">
				<el-form-item label="所属模块">
					<el-cascader
						v-model="newFormInline.moduleName"
						class="w-full"
						:options="moduleNames"
						:props="{
							value: 'itemCode',
							label: 'itemName',
							emitPath: false,
							checkStrictly: true,
						}"
						clearable
						filterable
						placeholder="请选择所属模块"
					>
						<template #default="{ node, data }">
							<span>{{ data.itemName }}</span>
							<span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
						</template>
					</el-cascader>
				</el-form-item>
			</el-col>

			<el-col v-show="newFormInline.permissionType === 1" :md="12" :xs="24" :sm="24">
				<!-- iframe -->
				<el-form-item label="链接地址">
					<el-input
						v-model="newFormInline.frameSrc"
						clearable
						placeholder="请输入 iframe 链接地址"
					/>
				</el-form-item>
			</el-col>
			<el-col v-if="newFormInline.permissionType === 1" :md="12" :xs="24" :sm="24">
				<el-form-item label="加载动画">
					<el-segmented
						:modelValue="newFormInline.frameLoading ? 0 : 1"
						:options="frameLoadingOptions"
						@change="
							(value: any) => {
								newFormInline.frameLoading = value
							}
						"
					/>
				</el-form-item>
			</el-col>

			<el-col v-show="newFormInline.permissionType !== 3" :md="12" :xs="24" :sm="24">
				<el-form-item label="菜单">
					<el-segmented
						:modelValue="newFormInline.showLink"
						:options="showLinkOptions"
						@change="
							(value: any) => {
								newFormInline.showLink = value
							}
						"
					/>
				</el-form-item>
			</el-col>
			<el-col v-show="newFormInline.permissionType !== 3" :md="12" :xs="24" :sm="24">
				<el-form-item label="父级菜单">
					<el-segmented
						:modelValue="newFormInline.showParent"
						:options="showParentOptions"
						@change="
							(value: any) => {
								newFormInline.showParent = value
							}
						"
					/>
				</el-form-item>
			</el-col>

			<el-col v-show="newFormInline.permissionType < 2" :md="12" :xs="24" :sm="24">
				<el-form-item label="缓存页面">
					<el-segmented
						:modelValue="newFormInline.keepAlive"
						:options="keepAliveOptions"
						@change="
							(value: any) => {
								newFormInline.keepAlive = value
							}
						"
					/>
				</el-form-item>
			</el-col>

			<el-col v-show="newFormInline.permissionType < 2" :md="12" :xs="24" :sm="24">
				<el-form-item label="标签页">
					<el-segmented
						:modelValue="newFormInline.hiddenTag"
						:options="hiddenTagOptions"
						@change="
							(value: any) => {
								newFormInline.hiddenTag = value
							}
						"
					/>
				</el-form-item>
			</el-col>
			<el-col v-show="newFormInline.permissionType < 2" :md="12" :xs="24" :sm="24">
				<el-form-item label="固定标签页">
					<el-segmented
						:modelValue="newFormInline.fixedTag"
						:options="fixedTagOptions"
						@change="
							(value: any) => {
								newFormInline.fixedTag = value
							}
						"
					/>
				</el-form-item>
			</el-col>
			<el-col v-show="newFormInline.permissionType === 3" :md="12" :xs="24" :sm="24">
				<el-form-item label="请求方式">
					<el-cascader
						v-model="newFormInline.requestMethod"
						class="w-full"
						:options="requestMethods"
						:props="{
							value: 'itemCode',
							label: 'itemName',
							emitPath: false,
							checkStrictly: true,
						}"
						clearable
						filterable
						placeholder="请选择请求方式"
					>
						<template #default="{ node, data }">
							<span>{{ data.itemName }}</span>
							<span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
						</template>
					</el-cascader>
				</el-form-item>
			</el-col>
			<el-col v-show="newFormInline.permissionType === 3" :md="12" :xs="24" :sm="24">
				<el-form-item label="鉴权">
					<el-segmented
						:modelValue="newFormInline.needAuthentication"
						:options="needAuthenticationOptions"
						@change="
							(value: any) => {
								newFormInline.needAuthentication = value
							}
						"
					/>
				</el-form-item>
			</el-col>
		</el-row>
	</el-form>
</template>
